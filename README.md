# 🧠 Memória Ativa

Um assistente pessoal, simples e gratuito, para ajudar a acompanhar reuniões e assembleias: grava, transcreve, resume com Inteligência Artificial e deixa você formatar o texto do seu jeito.

Este guia foi escrito como se você estivesse abrindo um computador pela primeira vez. Vá com calma, passo a passo, sem pular nenhum.

---

## Antes de começar: como o sistema funciona (em palavras simples)

1. Você aperta **"Gravar áudio"** e fala. O próprio navegador (Google Chrome) já escreve o que você fala — isso é 100% grátis, sem precisar de nenhuma chave especial.
2. Você aperta **"Resumir com IA"**. O texto vai para uma Inteligência Artificial do Google (chamada Gemini), que devolve um resumo organizado por tópicos.
3. Você usa os botões de formatação (negrito, cor, tamanho da letra) para deixar o texto do jeito que você gosta de ler.
4. Você aperta **"Salvar no histórico"**, e a reunião fica guardada para você consultar depois.

Tudo isso mora em 3 "casas" gratuitas na internet:

| Casa | Serve para | Custo |
|---|---|---|
| **Vercel** | Mostrar o site e rodar o "cérebro" que fala com a IA | Grátis |
| **Supabase** | Guardar o histórico de reuniões | Grátis |
| **Google AI Studio** | Gerar os resumos com Inteligência Artificial | Grátis (com um limite generoso por dia) |

⚠️ **Um aviso importante e honesto:** a transcrição usa uma função do navegador chamada "Web Speech API". Ela é gratuita e funciona muito bem para gravações **ao vivo, pelo microfone**. Já existem serviços de transcrição de arquivos de áudio prontos (como o Whisper, da OpenAI) que são mais precisos, mas eles cobram depois de um período de teste — por isso não foram incluídos aqui, para manter a promessa de "100% gratuito". Se um dia você quiser evoluir o sistema, esse é o primeiro ponto a pagar.

---

## O que tem dentro da pasta do projeto

```
memoria-ativa/
├── public/                 → tudo o que aparece na tela (frontend)
│   ├── index.html           → a estrutura da página
│   ├── style.css             → as cores, tamanhos e botões grandes
│   ├── app.js                 → o que acontece quando você clica em algo
│   └── config.js               → onde colamos as chaves do Supabase
├── api/
│   └── resumir.js           → a função que conversa com a Inteligência Artificial
├── supabase-schema.sql      → o "molde" da tabela onde as reuniões ficam guardadas
├── package.json              → informações do projeto para a Vercel entender
├── vercel.json                → configurações de hospedagem
└── .env.example                → modelo de onde colar a chave secreta da IA
```

Você não precisa entender programação para seguir os passos abaixo — só precisa saber copiar e colar.

---

## PASSO 1 — Criar uma conta no GitHub (para guardar o código)

1. Acesse: https://github.com/signup
2. Crie uma conta gratuita com seu e-mail.
3. Depois de criada a conta, clique no botão verde **"New"** (ou "Novo repositório").
4. Dê o nome `memoria-ativa` e clique em **"Create repository"**.

Agora envie os arquivos do projeto para lá. Se você tiver o programa **Git** instalado no computador, abra o terminal na pasta do projeto e cole:

```bash
git init
git add .
git commit -m "Primeira versão do Memória Ativa"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/memoria-ativa.git
git push -u origin main
```

> Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub.
>
> Se preferir não usar o terminal, o próprio site do GitHub tem um botão **"uploading an existing file"** onde você arrasta os arquivos com o mouse.

---

## PASSO 2 — Criar a conta gratuita no Google AI Studio (para os resumos)

1. Acesse: https://aistudio.google.com/
2. Entre com sua conta do Google (a mesma do Gmail).
3. Clique em **"Get API key"** (Obter chave de API).
4. Clique em **"Create API key"**.
5. Copie a chave que aparecer (um código longo de letras e números) e guarde em um bloco de notas — vamos usar em breve.

Essa chave é como uma "senha secreta" que permite ao seu site pedir resumos à Inteligência Artificial. **Nunca compartilhe essa chave com ninguém.**

---

## PASSO 3 — Criar a conta gratuita no Supabase (para guardar o histórico)

1. Acesse: https://supabase.com/
2. Clique em **"Start your project"** e entre com sua conta do GitHub (a mesma do Passo 1).
3. Clique em **"New project"**.
4. Escolha um nome, por exemplo `memoria-ativa`, crie uma senha (guarde-a) e clique em **"Create new project"**. Aguarde 1 ou 2 minutinhos.
5. No menu do lado esquerdo, clique em **"SQL Editor"**.
6. Abra o arquivo `supabase-schema.sql` (que veio junto com este projeto), copie **todo o conteúdo** dele, cole na tela do Supabase e clique em **"Run"**. Isso cria a "gaveta" onde as reuniões ficam guardadas.
7. Agora clique em **"Project Settings"** (ícone de engrenagem) → **"API"**.
8. Você vai ver dois valores importantes:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)
9. Abra o arquivo `public/config.js` do projeto e cole esses dois valores nos lugares indicados:

```javascript
window.MEMORIA_ATIVA_CONFIG = {
  SUPABASE_URL: "https://xxxxx.supabase.co",       // sua Project URL
  SUPABASE_ANON_KEY: "sua-chave-anon-public-aqui"  // sua anon public key
};
```

10. Salve o arquivo.

⚠️ **Nota sobre privacidade:** para manter o sistema simples e sem exigir senha, o histórico é separado por um código único gerado no seu próprio navegador (não por login). Isso significa que, tecnicamente, alguém com muito conhecimento técnico e acesso à chave pública poderia consultar o banco de dados. Para uso pessoal e familiar, isso é seguro o bastante. Se no futuro você quiser guardar informações mais sensíveis, o passo seguinte seria ativar um login de verdade (com Google, por exemplo) — posso te ajudar com isso depois, se quiser.

---

## PASSO 4 — Publicar o site na Vercel (hospedagem gratuita)

1. Acesse: https://vercel.com/signup
2. Entre com sua conta do GitHub.
3. Clique em **"Add New..."** → **"Project"**.
4. Escolha o repositório `memoria-ativa` que você criou no Passo 1 e clique em **"Import"**.
5. Antes de clicar em "Deploy", abra a seção **"Environment Variables"** (Variáveis de Ambiente) e adicione:

| Nome (Key) | Valor (Value) |
|---|---|
| `GEMINI_API_KEY` | a chave que você copiou no Passo 2 |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

6. Clique em **"Deploy"**. Aguarde 1 ou 2 minutinhos.
7. Quando terminar, a Vercel vai te dar um link, algo como `https://memoria-ativa-seu-usuario.vercel.app`. **Esse é o endereço do seu site!** Pode salvar como favorito ou colocar na tela inicial do celular/tablet.

---

## PASSO 5 — Testando no seu computador antes de publicar (opcional)

Se você quiser conferir tudo antes de publicar, ou se estiver com a ajuda de alguém que entenda um pouco de tecnologia, siga:

1. Instale o **Node.js**: https://nodejs.org (baixe a versão "LTS" e clique em "Avançar" em tudo).
2. Abra o terminal (Prompt de Comando) na pasta do projeto e rode:

```bash
npm install -g vercel
```

3. Crie um arquivo chamado `.env` (copiando o `.env.example`) e cole sua chave do Gemini nele.
4. Rode:

```bash
vercel dev
```

5. Abra no navegador o endereço que aparecer (normalmente `http://localhost:3000`).

---

## Como usar o Memória Ativa no dia a dia

1. **Antes da reunião:** abra o link do site no seu celular ou tablet e deixe a tela aberta.
2. **Durante a reunião:** aperte **"🎤 Gravar áudio"** e fale (ou aponte o aparelho para quem está falando). O texto vai aparecendo sozinho.
3. **Terminou de gravar:** aperte o mesmo botão de novo (agora escrito "Parar gravação").
4. **Revise o texto:** corrija palavras que a IA entendeu errado, clicando e digitando normalmente.
5. **Aperte "🤖 Resumir com IA":** em poucos segundos, o texto vira um resumo organizado.
6. **Deixe do seu jeito:** selecione o texto e use os botões de negrito, cor e tamanho de letra, se quiser.
7. **Aperte "💾 Salvar no histórico":** pronto, a reunião fica guardada.
8. **Para ver reuniões antigas:** role até "Reuniões salvas" e clique em "Abrir".

**Dica:** use fones de ouvido ou fique perto de quem está falando — quanto mais claro o som, melhor a transcrição.

---

## Se algo der errado

- **"Meu navegador não grava"** → use o Google Chrome ou o Microsoft Edge (o Safari e o Firefox ainda têm suporte limitado para essa função gratuita).
- **"O resumo não aparece"** → confira se a chave `GEMINI_API_KEY` foi colada certinho na Vercel (Passo 4).
- **"O histórico não salva"** → confira se você colou a URL e a chave do Supabase no arquivo `public/config.js` (Passo 3).
- **"Atingi o limite grátis da IA"** → o Google renova a cota gratuita todos os dias; espere até o dia seguinte ou crie um novo projeto gratuito no Google AI Studio.

---

## Assim que quiser ir além (opcional, ainda gratuito ou de baixo custo)

- Trocar o "login por aparelho" por um login de verdade com Google, para acessar o histórico de qualquer aparelho.
- Adicionar leitura em voz alta do resumo (o navegador também tem essa função grátis).
- Exportar o resumo em PDF para imprimir.

Se quiser ajuda para implementar qualquer uma dessas melhorias, é só pedir. 💙
