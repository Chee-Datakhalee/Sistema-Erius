-- =========================================================
-- Envelope "Caixa da empresa"
-- Paga contas fixas, parcelas das máquinas e imprevistos.
-- Pode rodar mais de uma vez sem problema.
-- =========================================================

-- 1) cria o envelope (só se ainda não existir)
insert into envelopes (nome, pct, categoria, ordem)
select 'Caixa da empresa', 20, 'Caixa da empresa', 5
where not exists (select 1 from envelopes where categoria = 'Caixa da empresa');

-- 2) nova divisão (soma 100%)
update envelopes set pct = 35 where categoria = 'Anúncios (Ads)';
update envelopes set pct = 20 where categoria = 'Bobina/Vinil';
update envelopes set pct = 10 where categoria = 'Tinta';
update envelopes set pct = 15 where categoria = 'Pró-labore';
update envelopes set pct = 20 where categoria = 'Caixa da empresa';

-- conferir: precisa dar 100
select nome, pct from envelopes order by ordem;
select sum(pct) as total from envelopes;
