"use client";
import { useRef, useState } from "react";
import { criarOS } from "@/app/actions";
import { SERVICOS, FORMAS } from "@/lib/constants";

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const parse = (s: string) => {
  let t = String(s ?? "").trim().replace(/[R$\s]/g, "");
  if (!t) return 0;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const x = Number(t);
  return isFinite(x) ? x : 0;
};
const paraCampo = (v: number) => v.toFixed(2).replace(".", ",");

type Item = { servico: string; descricao: string; quantidade: string; unitario: string };
const itemVazio = (): Item => ({ servico: SERVICOS[0], descricao: "", quantidade: "1", unitario: "" });
const qtdDe = (it: Item) => Math.max(1, Math.round(parse(it.quantidade)) || 1);
const subtotal = (it: Item) => Math.round(qtdDe(it) * parse(it.unitario) * 100) / 100;

export default function NovaOS({ hoje, nomes }: { hoje: string; nomes: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [itens, setItens] = useState<Item[]>([itemVazio()]);
  const [pagou50, setPagou50] = useState<"sim" | "nao">("nao");
  const [pagoTxt, setPagoTxt] = useState("");
  const [editado, setEditado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const total = itens.reduce((s, i) => s + subtotal(i), 0);
  const metade = Math.round(total * 50) / 100;
  const pago = pagou50 === "sim" ? (editado ? parse(pagoTxt) : metade) : 0;
  const falta = total - pago;

  function mudar(i: number, patch: Partial<Item>) {
    setItens((v) => v.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function salvar() {
    const fd = new FormData(formRef.current!);
    if (!String(fd.get("cliente") ?? "").trim()) return setErro("Informe o cliente.");
    const validos = itens.filter((i) => i.descricao.trim());
    if (!validos.length) return setErro("Descreva ao menos um serviço.");
    if (!fd.get("prazo_entrega")) return setErro("Informe o prazo de entrega.");
    setErro("");
    setSalvando(true);
    fd.set(
      "itens",
      JSON.stringify(validos.map((i) => ({ servico: i.servico, descricao: i.descricao.trim(), quantidade: qtdDe(i), valor_unitario: parse(i.unitario), valor_total: subtotal(i) })))
    );
    fd.set("valor_pago", String(pago));
    try {
      await criarOS(fd);
      formRef.current?.reset();
      setItens([itemVazio()]);
      setPagou50("nao");
      setPagoTxt("");
      setEditado(false);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form ref={formRef} className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar(); }}>
      {/* Cliente e prazo */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <div className="col-span-2">
          <label className="rotulo" htmlFor="os-cliente">Cliente</label>
          <input id="os-cliente" name="cliente" list="os-lista-clientes" required className="campo" placeholder="Nome do cliente" />
          <datalist id="os-lista-clientes">{nomes.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
        <div>
          <label className="rotulo" htmlFor="os-telefone">WhatsApp</label>
          <input id="os-telefone" name="telefone" inputMode="tel" className="campo" placeholder="(19) 99999-9999" />
        </div>
        <div>
          <label className="rotulo" htmlFor="os-data">Data da OS</label>
          <input id="os-data" name="data" type="date" defaultValue={hoje} className="campo" />
        </div>
        <div>
          <label className="rotulo" htmlFor="os-prazo">Prazo de entrega</label>
          <input id="os-prazo" name="prazo_entrega" type="date" required min={hoje} className="campo" />
        </div>
        <div>
          <label className="rotulo" htmlFor="os-forma">Pagamento</label>
          <select id="os-forma" name="forma_pagto" className="campo">{FORMAS.map((f) => <option key={f}>{f}</option>)}</select>
        </div>
      </div>

      {/* Serviços */}
      <div className="rounded-lg border border-line">
        <div className="flex items-center justify-between border-b border-line p-3">
          <span className="text-sm font-semibold text-ink">Discriminação dos serviços</span>
          <button type="button" onClick={() => setItens((v) => [...v, itemVazio()])} className="botao2 py-1 text-xs">+ Serviço</button>
        </div>
        <ul className="divide-y divide-line">
          {itens.map((it, i) => (
            <li key={i} className="grid grid-cols-2 gap-2 p-3 md:grid-cols-12">
              <div className="md:col-span-2">
                <label className="rotulo">Tipo</label>
                <select className="campo" value={it.servico} onChange={(e) => mudar(i, { servico: e.target.value })}>
                  {SERVICOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-5">
                <label className="rotulo">Descrição do serviço</label>
                <input className="campo" value={it.descricao} onChange={(e) => mudar(i, { descricao: e.target.value })} placeholder="Ex: Etiqueta 5x5 brilho, corte redondo" />
              </div>
              <div className="md:col-span-1">
                <label className="rotulo">Qtd</label>
                <input className="campo" inputMode="numeric" value={it.quantidade} onChange={(e) => mudar(i, { quantidade: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="rotulo">Valor unit. (R$)</label>
                <input className="campo" inputMode="decimal" value={it.unitario} onChange={(e) => mudar(i, { unitario: e.target.value })} placeholder="0,00" />
              </div>
              <div className="col-span-2 flex items-end justify-between gap-2 md:col-span-2">
                <span className="pb-2 font-display font-semibold text-ciano">{brl(subtotal(it))}</span>
                {itens.length > 1 && (
                  <button type="button" onClick={() => setItens((v) => v.filter((_, idx) => idx !== i))} className="rounded p-1.5 text-mute hover:bg-magenta/15 hover:text-magenta" aria-label="Remover serviço">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line p-3">
          <span className="text-sm text-mute">Valor total da OS</span>
          <span className="font-display text-xl font-bold text-ink">{brl(total)}</span>
        </div>
      </div>

      {/* Pagamento */}
      <div className="grid gap-4 rounded-lg border border-line p-4 md:grid-cols-[auto_1fr_auto]">
        <div>
          <span className="rotulo">Cliente pagou 50% do valor total?</span>
          <div className="flex gap-2">
            {(["sim", "nao"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => { setPagou50(op); setEditado(false); setPagoTxt(""); }}
                className={`rounded-lg border px-5 py-2 text-sm font-semibold ${
                  pagou50 === op
                    ? op === "sim" ? "border-ciano bg-ciano/15 text-ciano" : "border-magenta bg-magenta/15 text-magenta"
                    : "border-line text-mute hover:border-mute"
                }`}
              >
                {op === "sim" ? "Sim" : "Não"}
              </button>
            ))}
          </div>
        </div>

        <div>
          {pagou50 === "sim" ? (
            <>
              <label className="rotulo" htmlFor="os-pago">Valor pago (R$) — altere se pagou a mais ou a menos</label>
              <div className="flex gap-2">
                <input
                  id="os-pago"
                  inputMode="decimal"
                  className="campo max-w-[180px]"
                  value={editado ? pagoTxt : paraCampo(metade)}
                  onChange={(e) => { setEditado(true); setPagoTxt(e.target.value); }}
                />
                {editado && (
                  <button type="button" onClick={() => { setEditado(false); setPagoTxt(""); }} className="botao2 text-xs">Voltar p/ 50%</button>
                )}
              </div>
            </>
          ) : (
            <p className="pt-6 text-sm text-mute">Sem entrada. O valor total fica em aberto.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-right md:min-w-[260px]">
          <div>
            <div className="rotulo">Pago</div>
            <div className="font-display text-lg font-semibold text-ciano">{brl(pago)}</div>
          </div>
          <div>
            <div className="rotulo">Falta pagar</div>
            <div className={`font-display text-lg font-bold ${falta > 0.005 ? "text-magenta" : "text-ciano"}`}>
              {falta > 0.005 ? brl(falta) : "Quitado"}
            </div>
          </div>
          {falta < -0.005 && (
            <p className="col-span-2 text-xs text-amarelo">Pagou {brl(-falta)} a mais que o total.</p>
          )}
        </div>
      </div>

      <div>
        <label className="rotulo" htmlFor="os-obs">Observações (opcional)</label>
        <input id="os-obs" name="observacoes" className="campo" placeholder="Ex: arte enviada pelo WhatsApp, retirar na loja" />
      </div>

      {erro && <p className="text-sm text-magenta">{erro}</p>}
      <button type="submit" disabled={salvando} className="botao disabled:opacity-60">
        {salvando ? "Salvando..." : "Abrir OS"}
      </button>
    </form>
  );
}
