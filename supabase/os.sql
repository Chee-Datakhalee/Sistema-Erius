-- =========================================================
-- Ordens de Serviço (adicionado depois)
-- Rode só este bloco no Supabase > SQL Editor
-- =========================================================
create table if not exists ordens_servico (
  id bigint generated always as identity primary key,
  cliente text not null,
  telefone text,
  data date not null default current_date,
  prazo_entrega date,
  status text not null default 'aberta' check (status in ('aberta','producao','pronta','entregue')),
  forma_pagto text default 'Pix',
  observacoes text,
  pedido_id bigint references pedidos(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists os_itens (
  id bigint generated always as identity primary key,
  os_id bigint not null references ordens_servico(id) on delete cascade,
  servico text not null default 'Outros',
  descricao text not null,
  quantidade integer not null default 1,
  valor_unitario numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  ordem integer not null default 0
);

alter table ordens_servico enable row level security;
alter table os_itens enable row level security;
