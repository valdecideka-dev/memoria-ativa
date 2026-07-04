// ============================================================
// /api/resumir.js
// Esta função roda no SERVIDOR (Vercel), nunca no navegador.
// Por isso é o lugar seguro para guardar a chave secreta da IA.
// ------------------------------------------------------------
// O que ela faz:
//  1. Recebe o texto transcrito da reunião.
//  2. Manda esse texto para a IA Gemini (Google), pedindo um
//     resumo organizado por tópicos.
//  3. Devolve o resumo pronto para a tela.
// ============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido." });
  }

  const { texto } = req.body || {};

  if (!texto || typeof texto !== "string" || !texto.trim()) {
    return res.status(400).json({ erro: "Nenhum texto foi enviado para resumir." });
  }

  const chaveApi = process.env.GEMINI_API_KEY;
  if (!chaveApi) {
    return res.status(500).json({
      erro: "A chave da IA (GEMINI_API_KEY) não foi configurada no servidor. Veja o README.md, passo 5."
    });
  }

  // Modelo gratuito da Google (verifique sempre o mais recente em ai.google.dev/gemini-api/docs/models)
  const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

  const instrucao = `Você é um assistente que ajuda pessoas idosas a entender reuniões e assembleias.
Leia a transcrição abaixo e escreva um RESUMO EXECUTIVO, curto e muito claro, em português simples.
Organize por tópicos principais, como um boletim informativo, usando frases curtas.
Não invente informações que não estão no texto. Se algo não ficou claro na transcrição, apenas não mencione.

Formato de saída (texto simples, sem markdown):
Título curto da reunião
Depois, uma lista de tópicos principais, cada um começando com um traço "-".
No final, se houver, uma linha "Decisões e próximos passos:" com o que foi combinado.

Transcrição:
"""
${texto}
"""`;

  try {
    const respostaGoogle = await fetch(`${url}?key=${chaveApi}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instrucao }] }]
      })
    });

    const dados = await respostaGoogle.json();

    if (!respostaGoogle.ok) {
      const mensagem = dados?.error?.message || "Erro ao falar com a IA do Google.";
      return res.status(respostaGoogle.status).json({ erro: mensagem });
    }

    const resumo = dados?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resumo) {
      return res.status(500).json({ erro: "A IA não devolveu um resumo. Tente novamente." });
    }

    return res.status(200).json({ resumo: resumo.trim() });
  } catch (erro) {
    return res.status(500).json({ erro: "Falha ao conectar com a IA: " + erro.message });
  }
}
