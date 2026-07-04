// ============================================================
// MEMÓRIA ATIVA — app.js
// Este arquivo controla tudo o que acontece na tela:
// gravar áudio, transcrever, resumir com IA, formatar texto
// e salvar/consultar o histórico de reuniões.
// ============================================================

// ---------- 1. LIGAR AO SUPABASE (banco de dados) ----------
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.MEMORIA_ATIVA_CONFIG;
let supabaseClient = null;
if (SUPABASE_URL && !SUPABASE_URL.startsWith("COLE_AQUI")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Cada aparelho ganha um "codinome" único, guardado no navegador,
// para saber quais reuniões são suas — sem precisar de senha.
function obterIdDoUsuario() {
  let id = localStorage.getItem("memoria_ativa_usuario_id");
  if (!id) {
    id = "usuario-" + crypto.randomUUID();
    localStorage.setItem("memoria_ativa_usuario_id", id);
  }
  return id;
}
const idUsuario = obterIdDoUsuario();

// ---------- 2. EDITOR DE TEXTO (Quill) ----------
const editor = new Quill("#editor-quill", {
  theme: "snow",
  placeholder: "O texto da reunião vai aparecer aqui...",
  modules: {
    toolbar: {
      container: [
        [{ font: [] }, { size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ color: [] }],
        [{ align: [] }],
        ["clean"]
      ]
    }
  }
});

// ---------- 3. ELEMENTOS DA TELA ----------
const btnGravar = document.getElementById("btn-gravar");
const textoGravar = document.getElementById("texto-gravar");
const statusAudio = document.getElementById("status-audio");
const inputArquivo = document.getElementById("input-arquivo");
const playerAudio = document.getElementById("player-audio");

const btnResumir = document.getElementById("btn-resumir");
const btnSalvar = document.getElementById("btn-salvar");
const statusIa = document.getElementById("status-ia");

const btnAtualizarHistorico = document.getElementById("btn-atualizar-historico");
const listaHistorico = document.getElementById("lista-historico");

// ---------- 4. GRAVAÇÃO + TRANSCRIÇÃO (Web Speech API — 100% grátis) ----------
// Funciona melhor no Google Chrome ou Microsoft Edge.
const ReconhecimentoDeFala = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconhecimento = null;
let gravando = false;
let textoAcumulado = "";

if (ReconhecimentoDeFala) {
  reconhecimento = new ReconhecimentoDeFala();
  reconhecimento.lang = "pt-BR";
  reconhecimento.continuous = true;
  reconhecimento.interimResults = true;

  reconhecimento.onresult = (evento) => {
    let textoFinal = "";
    for (let i = evento.resultIndex; i < evento.results.length; i++) {
      if (evento.results[i].isFinal) {
        textoFinal += evento.results[i][0].transcript + " ";
      }
    }
    if (textoFinal) {
      textoAcumulado += textoFinal;
      editor.setText(textoAcumulado);
    }
  };

  reconhecimento.onerror = (evento) => {
    statusAudio.textContent = "Ops! Houve um problema ao ouvir: " + evento.error;
  };

  reconhecimento.onend = () => {
    if (gravando) {
      // O navegador às vezes encerra sozinho depois de um tempo.
      // Se ainda estivermos "gravando", reiniciamos automaticamente.
      reconhecimento.start();
    }
  };
} else {
  statusAudio.textContent =
    "Seu navegador não tem a função de 'ouvir e escrever'. Use o Google Chrome para gravar, ou importe um arquivo de áudio.";
  btnGravar.disabled = true;
}

btnGravar.addEventListener("click", () => {
  if (!reconhecimento) return;

  if (!gravando) {
    textoAcumulado = editor.getText().trim() ? editor.getText() + " " : "";
    reconhecimento.start();
    gravando = true;
    btnGravar.classList.add("gravando");
    textoGravar.textContent = "Parar gravação";
    statusAudio.textContent = "🔴 Ouvindo e escrevendo... fale com calma.";
  } else {
    gravando = false; // importante: false ANTES de stop, para não reiniciar sozinho
    reconhecimento.stop();
    btnGravar.classList.remove("gravando");
    textoGravar.textContent = "Gravar áudio";
    statusAudio.textContent = "✅ Gravação parada. Revise o texto abaixo antes de resumir.";
  }
});

// ---------- 5. IMPORTAR ARQUIVO DE ÁUDIO (MP3/WAV) ----------
inputArquivo.addEventListener("change", (evento) => {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;

  const url = URL.createObjectURL(arquivo);
  playerAudio.src = url;
  playerAudio.hidden = false;

  statusAudio.innerHTML =
    "📁 Arquivo carregado. Este site transcreve apenas áudio ao vivo pelo microfone (é a forma 100% gratuita). " +
    "Para transcrever este arquivo: aumente o volume das caixas de som, aperte <strong>Gravar áudio</strong> " +
    "e toque o arquivo — o microfone vai 'ouvir' o áudio tocando.";
});

// ---------- 6. RESUMIR COM IA (chama nossa função no servidor) ----------
btnResumir.addEventListener("click", async () => {
  const texto = editor.getText().trim();
  if (!texto) {
    statusIa.textContent = "Escreva ou grave um texto antes de resumir.";
    return;
  }

  statusIa.textContent = "🤖 Pensando e organizando o resumo...";
  btnResumir.disabled = true;

  try {
    const resposta = await fetch("/api/resumir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Não foi possível gerar o resumo.");
    }

    editor.setText(dados.resumo);
    statusIa.textContent = "✅ Resumo pronto! Você já pode formatar o texto como preferir.";
  } catch (erro) {
    statusIa.textContent = "❌ " + erro.message;
  } finally {
    btnResumir.disabled = false;
  }
});

// ---------- 7. SALVAR NO HISTÓRICO (Supabase) ----------
btnSalvar.addEventListener("click", async () => {
  const textoSimples = editor.getText().trim();
  const textoFormatado = editor.root.innerHTML;

  if (!textoSimples) {
    statusIa.textContent = "Não há texto para salvar ainda.";
    return;
  }
  if (!supabaseClient) {
    statusIa.textContent = "⚠️ O banco de dados ainda não foi configurado (veja o README.md, passo 4).";
    return;
  }

  statusIa.textContent = "💾 Salvando...";

  const titulo = textoSimples.split(/\s+/).slice(0, 8).join(" ") + "...";

  const { error } = await supabaseClient.from("reunioes").insert({
    usuario_id: idUsuario,
    titulo,
    conteudo_html: textoFormatado,
    criado_em: new Date().toISOString()
  });

  if (error) {
    statusIa.textContent = "❌ Erro ao salvar: " + error.message;
  } else {
    statusIa.textContent = "✅ Reunião salva no histórico!";
    carregarHistorico();
  }
});

// ---------- 8. LISTAR HISTÓRICO ----------
async function carregarHistorico() {
  if (!supabaseClient) {
    listaHistorico.innerHTML = "<li>Configure o Supabase para ver seu histórico (README.md, passo 4).</li>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("reunioes")
    .select("*")
    .eq("usuario_id", idUsuario)
    .order("criado_em", { ascending: false });

  if (error) {
    listaHistorico.innerHTML = "<li>Erro ao carregar histórico: " + error.message + "</li>";
    return;
  }

  if (!data || data.length === 0) {
    listaHistorico.innerHTML = "<li>Nenhuma reunião salva ainda.</li>";
    return;
  }

  listaHistorico.innerHTML = "";
  data.forEach((reuniao) => {
    const item = document.createElement("li");
    item.className = "item-historico";
    const data_formatada = new Date(reuniao.criado_em).toLocaleString("pt-BR");
    item.innerHTML = `
      <strong>${reuniao.titulo}</strong>
      <span>${data_formatada}</span>
      <br/>
      <button data-id="${reuniao.id}">Abrir</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      editor.root.innerHTML = reuniao.conteudo_html;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    listaHistorico.appendChild(item);
  });
}

btnAtualizarHistorico.addEventListener("click", carregarHistorico);

// Carrega o histórico assim que a página abre
carregarHistorico();
