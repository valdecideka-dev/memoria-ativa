// ============================================================
// CONFIGURAÇÃO PÚBLICA — Memória Ativa
// ------------------------------------------------------------
// Aqui vão APENAS as chaves "públicas" do Supabase.
// Elas são seguras para ficar no navegador (não são secretas).
// A chave "secreta" da IA (Gemini) NUNCA fica aqui — ela mora
// só no servidor (Vercel), dentro da pasta /api.
//
// Troque os dois valores abaixo pelos que o Supabase te der
// (veja o passo 4 do README.md).
// ============================================================

window.MEMORIA_ATIVA_CONFIG = {
  SUPABASE_URL: "COLE_AQUI_A_URL_DO_SEU_PROJETO_SUPABASE",
  SUPABASE_ANON_KEY: "COLE_AQUI_A_CHAVE_ANON_PUBLIC_DO_SUPABASE"
};
