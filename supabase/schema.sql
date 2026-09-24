-- =========================================================
-- Érius Gestão — schema + dados importados da planilha
-- Rode inteiro no Supabase > SQL Editor
-- =========================================================

create table if not exists pedidos (
  id bigint generated always as identity primary key,
  cliente text not null,
  servico text not null,
  descricao text,
  quantidade integer default 1,
  data date not null default current_date,
  prioridade boolean not null default false,
  valor_base numeric(12,2) not null default 0,
  adicional_prioridade numeric(12,2) not null default 0,
  valor_total numeric(12,2) generated always as (valor_base + case when prioridade then adicional_prioridade else 0 end) stored,
  forma_pagto text default 'Pix',
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists pagamentos (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  data date not null default current_date,
  valor numeric(12,2) not null,
  forma text default 'Pix',
  created_at timestamptz default now()
);

create table if not exists gastos (
  id bigint generated always as identity primary key,
  data date not null default current_date,
  descricao text not null,
  categoria text not null,
  parcela_atual integer,
  parcela_total integer,
  valor numeric(12,2) not null,
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists despesas_fixas (
  id bigint generated always as identity primary key,
  nome text not null,
  categoria text not null default 'Contas fixas',
  valor numeric(12,2) not null,
  ativo boolean not null default true
);

create table if not exists config (
  id integer primary key default 1 check (id = 1),
  caixa_inicial numeric(12,2) not null default 0,
  adicional_prioridade numeric(12,2) not null default 35,
  markup_revenda numeric(6,2) not null default 30
);

create table if not exists precos (
  tamanho text not null,
  quantidade integer not null,
  preco numeric(12,2) not null,
  primary key (tamanho, quantidade)
);

-- Acesso só pelo servidor (service role). RLS ligado e sem políticas:
-- a chave pública não consegue ler nem gravar nada.
alter table pedidos enable row level security;
alter table pagamentos enable row level security;
alter table gastos enable row level security;
alter table despesas_fixas enable row level security;
alter table config enable row level security;
alter table precos enable row level security;

-- ------------------- DADOS DA PLANILHA (já corrigidos) -------------------
insert into config (id, caixa_inicial, adicional_prioridade, markup_revenda)
values (1, 531.07, 35, 30) on conflict (id) do nothing;

insert into pedidos (cliente, servico, descricao, quantidade, data, prioridade, valor_base, adicional_prioridade, forma_pagto, observacoes) values
('Cerâmica Tambaú','Adesivação','Adesivação janela e porta',7,'2026-09-01',false,234,35,'Pix','Sinal de 50%, saldo na entrega'),
('AG FRIOS','Etiquetas','Etiquetas fosco',3000,'2026-09-15',false,330,35,'Pix',null),
('Zeze Picados','Etiquetas','Etiquetas brilho',500,'2026-09-16',false,190,35,'Pix',null),
('Felipe Arrigi','Adesivos','Adesivo filho',4,'2026-09-16',false,30,35,'Pix',null),
('ADEGA PORTO','Etiquetas','Etiquetas',250,'2026-09-17',true,150,35,'Pix',null),
('Jhonas Ar Condicionado','Etiquetas','Etiquetas',140,'2026-09-18',false,40,35,'Pix',null),
('Shirley Posto Luana','Etiquetas','Etiquetas',200,'2026-09-21',false,30,35,'Pix',null),
('Tabata Bagata','Etiquetas','Etiquetas',1000,'2026-09-24',false,386,35,'Pix',null);

insert into pagamentos (pedido_id, data, valor, forma)
select p.id, p.data, v.valor, 'Pix' from pedidos p
join (values ('Zeze Picados',190),('ADEGA PORTO',185),('Jhonas Ar Condicionado',40),
             ('Shirley Posto Luana',15),('Tabata Bagata',190)) as v(cliente, valor)
  on v.cliente = p.cliente;

insert into gastos (data, descricao, categoria, parcela_atual, parcela_total, valor, observacoes) values
('2026-09-14','Anúncio Meta Ads','Anúncios (Ads)',null,null,350,'Campanha etiquetas ML'),
('2026-09-14','Tinta CMYK Mais Color','Tinta',1,7,129,null),
('2026-09-14','Parcela impressora Mais Color MC-J701x','Parcelas de equipamento',1,84,267.50,'Financ. 7 anos'),
('2026-09-14','Parcela plotter de recorte JK-721','Parcelas de equipamento',1,10,98,null),
('2026-09-15','Internet','Contas fixas',null,null,111,null),
('2026-09-16','Tomada para plotter','Outros',null,null,19.90,null);

insert into despesas_fixas (nome, categoria, valor) values
('Internet','Contas fixas',110),
('Água','Contas fixas',55),
('Energia','Contas fixas',130),
('IPTU','Contas fixas',50),
('Parcela impressora (minha metade)','Parcelas de equipamento',267.50),
('Parcela plotter de recorte (minha metade)','Parcelas de equipamento',98);

insert into precos (tamanho, quantidade, preco) values
('2x2',100,4.15),
('2x2',150,5.84),
('2x2',200,7.53),
('2x2',250,9.22),
('2x2',300,10.90),
('2x2',350,12.59),
('2x2',400,14.28),
('2x2',450,15.97),
('2x2',500,17.66),
('2x2',550,19.35),
('2x2',600,21.03),
('2x2',650,22.72),
('2x2',700,24.41),
('2x2',750,26.10),
('2x2',800,27.79),
('2x2',850,29.48),
('2x2',900,31.17),
('2x2',950,32.85),
('2x2',1000,34.54),
('3x3',100,9.85),
('3x3',150,14.39),
('3x3',200,18.93),
('3x3',250,23.47),
('3x3',300,28.01),
('3x3',350,32.54),
('3x3',400,37.08),
('3x3',450,41.62),
('3x3',500,46.16),
('3x3',550,50.70),
('3x3',600,55.24),
('3x3',650,59.78),
('3x3',700,64.31),
('3x3',750,68.85),
('3x3',800,73.39),
('3x3',850,77.93),
('3x3',900,82.47),
('3x3',950,87.01),
('3x3',1000,91.55),
('4x4',100,17.71),
('4x4',150,26.18),
('4x4',200,34.65),
('4x4',250,43.12),
('4x4',300,51.59),
('4x4',350,60.06),
('4x4',400,68.53),
('4x4',450,77.00),
('4x4',500,85.47),
('4x4',550,93.94),
('4x4',600,102.41),
('4x4',650,110.88),
('4x4',700,119.35),
('4x4',750,127.82),
('4x4',800,136.29),
('4x4',850,144.76),
('4x4',900,153.23),
('4x4',950,161.70),
('4x4',1000,170.17),
('5x5',100,25.01),
('5x5',150,37.13),
('5x5',200,49.24),
('5x5',250,61.36),
('5x5',300,73.48),
('5x5',350,85.60),
('5x5',400,97.71),
('5x5',450,109.83),
('5x5',500,121.95),
('5x5',550,134.07),
('5x5',600,146.18),
('5x5',650,158.30),
('5x5',700,170.42),
('5x5',750,182.53),
('5x5',800,194.65),
('5x5',850,206.77),
('5x5',900,218.89),
('5x5',950,231.00),
('5x5',1000,243.12),
('6x6',100,32.43),
('6x6',150,48.26),
('6x6',200,64.09),
('6x6',250,79.92),
('6x6',300,95.74),
('6x6',350,111.57),
('6x6',400,127.40),
('6x6',450,143.23),
('6x6',500,159.06),
('6x6',550,174.89),
('6x6',600,190.71),
('6x6',650,206.54),
('6x6',700,222.37),
('6x6',750,238.20),
('6x6',800,254.03),
('6x6',850,269.86),
('6x6',900,285.68),
('6x6',950,301.51),
('6x6',1000,317.34),
('8x8',100,61.07),
('8x8',150,91.22),
('8x8',200,121.37),
('8x8',250,151.52),
('8x8',300,181.67),
('8x8',350,211.82),
('8x8',400,241.97),
('8x8',450,272.12),
('8x8',500,302.27),
('8x8',550,332.41),
('8x8',600,362.56),
('8x8',650,392.71),
('8x8',700,422.86),
('8x8',750,453.01),
('8x8',800,483.16),
('8x8',850,513.31),
('8x8',900,543.46),
('8x8',950,573.61),
('8x8',1000,603.76),
('10x10',100,85.19),
('10x10',150,127.40),
('10x10',200,169.61),
('10x10',250,211.82),
('10x10',300,254.03),
('10x10',350,296.24),
('10x10',400,338.44),
('10x10',450,380.65),
('10x10',500,422.86),
('10x10',550,465.07),
('10x10',600,507.28),
('10x10',650,549.49),
('10x10',700,591.70),
('10x10',750,633.91),
('10x10',800,676.11),
('10x10',850,718.32),
('10x10',900,760.53),
('10x10',950,802.74),
('10x10',1000,844.95)
on conflict do nothing;

-- =========================================================
-- Orçamentos (adicionado depois)
-- =========================================================
create table if not exists orcamentos (
  id bigint generated always as identity primary key,
  cliente text not null,
  data date not null default current_date,
  validade_dias integer not null default 15,
  status text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  prazo text default '5 dias úteis após aprovação da arte',
  pagamento text default '50% na aprovação e 50% na entrega | PIX',
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists orcamento_itens (
  id bigint generated always as identity primary key,
  orcamento_id bigint not null references orcamentos(id) on delete cascade,
  tipo text not null default 'manual' check (tipo in ('etiqueta','manual')),
  servico text not null default 'Etiquetas',
  tamanho text,
  quantidade integer not null default 1,
  descricao text,
  valor_unitario numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  ordem integer not null default 0
);

alter table orcamentos enable row level security;
alter table orcamento_itens enable row level security;
