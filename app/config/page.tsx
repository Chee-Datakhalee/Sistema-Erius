import Cabecalho from "@/components/Cabecalho";
import Excluir from "@/components/Excluir";
import Enviar from "@/components/Enviar";
import FormReset from "@/components/FormReset";
import Calculadora from "@/components/Calculadora";
import { carregar, carregarPrecos } from "@/lib/data";
import { brl } from "@/lib/format";
import { CATEGORIAS_GASTO } from "@/lib/constants";
import { salvarConfig, criarFixa, alternarFixa, excluirFixa, salvarPreco } from "../actions";

export const dynamic = "force-dynamic";

export default async function Config() {
  const [b, precos] = await Promise.all([carregar(), carregarPrecos()]);
  const c = b.config;
  const tamanhos = [...new Set(precos.map((p) => p.tamanho))].sort((x, y) => parseFloat(x) - parseFloat(y));
  const qtds = [...new Set(precos.map((p) => p.quantidade))].sort((x, y) => x - y);
  const mapa = new Map(precos.map((p) => [`${p.tamanho}|${p.quantidade}`, p.preco]));
  const fmt = (v: number) => v.toFixed(2).replace(".", ",");

  return (
    <>
      <Cabecalho titulo="Configurações" sub="Caixa, despesas fixas e preços" />
      <div className="space-y-4 p-4 lg:p-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="painel p-5">
            <h2 className="titulo mb-4">Geral</h2>
            <form action={salvarConfig} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="rotulo" htmlFor="caixa_inicial">Caixa inicial (R$)</label>
                <input id="caixa_inicial" name="caixa_inicial" defaultValue={fmt(c.caixa_inicial)} inputMode="decimal" className="campo" />
              </div>
              <div>
                <label className="rotulo" htmlFor="adicional_prioridade">Adicional 48h (R$)</label>
                <input id="adicional_prioridade" name="adicional_prioridade" defaultValue={fmt(c.adicional_prioridade)} inputMode="decimal" className="campo" />
              </div>
              <div>
                <label className="rotulo" htmlFor="markup_revenda">Markup revenda (%)</label>
                <input id="markup_revenda" name="markup_revenda" defaultValue={fmt(c.markup_revenda)} inputMode="decimal" className="campo" />
              </div>
              <div className="sm:col-span-3"><Enviar>Salvar configurações</Enviar></div>
            </form>
          </section>

          <section className="painel p-5">
            <h2 className="titulo mb-3">Despesas fixas mensais</h2>
            <table className="tabela">
              <tbody>
                {b.fixas.map((f) => (
                  <tr key={f.id} className={f.ativo ? "" : "opacity-50"}>
                    <td className="px-0">{f.nome}<div className="text-xs text-mute">{f.categoria}</div></td>
                    <td className="text-right">{brl(f.valor)}</td>
                    <td className="w-24 text-right">
                      <form action={alternarFixa}>
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="ativo" value={String(f.ativo)} />
                        <button className="botao2 py-1 text-xs">{f.ativo ? "Pausar" : "Ativar"}</button>
                      </form>
                    </td>
                    <td className="w-8 px-0"><Excluir action={excluirFixa} id={f.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <FormReset action={criarFixa} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input name="nome" required placeholder="Nova despesa" className="campo col-span-2 sm:col-span-1" aria-label="Nome" />
              <select name="categoria" className="campo" aria-label="Categoria">{CATEGORIAS_GASTO.map((x) => <option key={x}>{x}</option>)}</select>
              <input name="valor" required inputMode="decimal" placeholder="R$" className="campo" aria-label="Valor" />
              <Enviar className="botao col-span-2 sm:col-span-1">Adicionar</Enviar>
            </FormReset>
          </section>
        </div>

        <section className="painel p-5">
          <h2 className="titulo mb-4">Calculadora de preço</h2>
          <Calculadora precos={precos} markup={c.markup_revenda} />
        </section>

        <section className="painel overflow-x-auto p-5">
          <h2 className="titulo mb-1">Tabela de etiquetas</h2>
          <p className="mb-3 text-xs text-mute">Preço total do lote por tamanho e quantidade.</p>
          <table className="tabela min-w-[760px]">
            <thead>
              <tr><th>Qtd</th>{tamanhos.map((t) => <th key={t} className="text-right">{t} cm</th>)}</tr>
            </thead>
            <tbody>
              {qtds.map((q) => (
                <tr key={q}>
                  <td className="text-mute">{q}</td>
                  {tamanhos.map((t) => {
                    const v = mapa.get(`${t}|${q}`);
                    return <td key={t} className="text-right">{v !== undefined ? brl(v) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <FormReset action={salvarPreco} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input name="tamanho" required placeholder="Tamanho (ex: 7x7)" className="campo" aria-label="Tamanho" />
            <input name="quantidade" required inputMode="numeric" placeholder="Quantidade" className="campo" aria-label="Quantidade" />
            <input name="preco" required inputMode="decimal" placeholder="Preço R$" className="campo" aria-label="Preço" />
            <Enviar>Salvar preço</Enviar>
          </FormReset>
          <p className="mt-1.5 text-xs text-mute">Se o tamanho e a quantidade já existirem, o preço é atualizado.</p>
        </section>
      </div>
    </>
  );
}
