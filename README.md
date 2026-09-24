# Érius Gestão

Sistema interno de gestão financeira da Érius (Next.js + Supabase + Vercel). Sem login. Identidade visual CMYK da Érius.

## Subir em 3 passos

1. **Supabase**: crie um projeto, abra o SQL Editor, cole todo o `supabase/schema.sql` e rode.
   Isso cria as tabelas e já importa os dados da planilha (pedidos, pagamentos, gastos, despesas fixas, tabela de preços, orçamentos).
   Se você já rodou uma versão anterior deste arquivo, rode só a parte nova: procure `-- Orçamentos (adicionado depois)` no arquivo e execute a partir dali.
2. **GitHub**: suba esta pasta para um repositório.
3. **Vercel**: importe o repositório e adicione as variáveis de ambiente:
   - `SUPABASE_URL` (Project Settings > API > Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API > service_role)

Para rodar local: `npm install`, copie `.env.example` para `.env.local`, preencha e rode `npm run dev`.

## Segurança
A chave do Supabase fica só no servidor (nunca vai pro navegador) e o RLS está ligado sem políticas, então ninguém mexe no banco pela chave pública. A página não é indexada no Google.

## Cores
Segue a identidade CMYK da logo Érius: fundo preto (#0A0A0A), ciano (#00AEEF), magenta (#EC008C), amarelo (#FFF200). Definidas em `tailwind.config.ts`.

## Como os números são calculados
- **Faturamento** do mês = soma dos pedidos com data no mês (pago ou não).
- **Recebido** = pagamentos registrados no mês (é o que entra no Fluxo de Caixa).
- **Lucro** = faturamento − gastos do mês.
- **Caixa atual** = caixa inicial + tudo recebido − tudo gasto.
- **Semáforo das categorias**: limites em `lib/constants.ts` (vindos da aba Config da planilha).

## Orçamentos
Aba própria para montar propostas comerciais:
- Cada orçamento tem cliente + vários itens.
- Item "Etiqueta (tabela)": escolhe tamanho e quantidade, o preço sai automático pela tabela de Configurações (com interpolação, igual à calculadora).
- Item "manual": para outros serviços (adesivação, placas), com preço digitado.
- **Exportar PDF**: gera a proposta em `/orcamentos/[id]/pdf`, no layout A4 com a identidade CMYK da Érius (faixa ciano/magenta, bloco de itens, condições comerciais, rodapé com CNPJ).
- **Aprovado**: cria os pedidos correspondentes automaticamente na aba Clientes e marca o orçamento como aprovado.
- **Recusar / lixeira**: marca como recusado ou exclui, sem criar pedido.
