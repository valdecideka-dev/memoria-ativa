-- ============================================================
-- Memória Ativa — estrutura do banco de dados (Supabase)
-- ------------------------------------------------------------
-- Como usar: veja o README.md, passo 4. Basta colar este
-- arquivo inteiro no "SQL Editor" do Supabase e clicar em "Run".
-- ============================================================

create table if not exists reunioes (
  id uuid primary key default gen_random_uuid(),
  usuario_id text not null,
  titulo text not null,
  conteudo_html text not null,
  criado_em timestamptz not null default now()
);

-- Ativa a segurança por linha (cada pessoa só vê as próprias reuniões)
alter table reunioes enable row level security;

-- Como não usamos senha (login anônimo por aparelho), liberamos
-- que qualquer pedido leia/escreva — a separação por pessoa é
-- feita pelo "usuario_id" gerado no navegador de cada um.
create policy "Qualquer um pode inserir reuniões"
  on reunioes for insert
  with check (true);

create policy "Qualquer um pode ler reuniões"
  on reunioes for select
  using (true);

-- Índice para deixar a listagem por usuário mais rápida
create index if not exists idx_reunioes_usuario on reunioes (usuario_id, criado_em desc);
