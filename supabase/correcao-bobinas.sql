-- =========================================================
-- Correção das bobinas conforme as notas da Sign Solution
-- Só mexe nos 2 lançamentos de bobina de 01/10 e inclui a de 15/09.
-- =========================================================

-- Pedido 163791-7 (30/09): transparente brilho 120T
update gastos
set valor = 476.00, data = '2026-09-30',
    descricao = 'Bobina transparente brilho 120T 1,27x50m',
    observacoes = 'Sign Solution - pedido 163791-7 (com IPI e desconto)'
where categoria = 'Bobina/Vinil' and data = '2026-10-01' and lower(trim(descricao)) = 'bobina transparente';

-- Pedido 163791-7 (30/09): fosca 120g
update gastos
set valor = 362.80, data = '2026-09-30',
    descricao = 'Bobina fosca 120g 1,27x50m',
    observacoes = 'Sign Solution - pedido 163791-7 (com desconto)'
where categoria = 'Bobina/Vinil' and data = '2026-10-01' and lower(trim(descricao)) = 'bobina fosco';

-- Pedido 163435-9 (15/09): fosca 100g (não estava lançada)
insert into gastos (data, descricao, categoria, valor, observacoes)
select '2026-09-15', 'Bobina fosca 100g 1,27x50m', 'Bobina/Vinil', 332.00, 'Sign Solution - pedido 163435-9'
where not exists (
  select 1 from gastos where categoria = 'Bobina/Vinil' and data = '2026-09-15' and valor = 332.00
);

-- Conferência
select data, descricao, valor from gastos where categoria = 'Bobina/Vinil' order by data;
