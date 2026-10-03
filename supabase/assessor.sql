-- =========================================================
-- Meu Assessor (envelopes do dinheiro recebido)
-- Só cria coisas novas. Não apaga nem altera dados existentes.
-- Pode rodar mais de uma vez sem problema.
-- =========================================================
create table if not exists envelopes (
  id bigint generated always as identity primary key,
  nome text not null,
  pct numeric(5,2) not null default 0,
  categoria text not null,          -- categoria de Gastos que sai deste envelope
  ordem integer not null default 0
);
alter table envelopes enable row level security;

insert into envelopes (nome, pct, categoria, ordem)
select * from (values
  ('Tráfego', 40, 'Anúncios (Ads)', 1),
  ('Bobina', 25, 'Bobina/Vinil', 2),
  ('Pró-labore', 25, 'Pró-labore', 3),
  ('Tinta', 10, 'Tinta', 4)
) as v(nome, pct, categoria, ordem)
where not exists (select 1 from envelopes);

alter table config add column if not exists das_mensal numeric(12,2) not null default 0;
alter table config add column if not exists assessor_inicio date not null default '2026-10-01';
