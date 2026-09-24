"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { hoje, mesAtual, ultimoDia } from "@/lib/format";

function valor(v: FormDataEntryValue | null) {
  let s = String(v ?? "").trim().replace(/[R$\s]/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const x = Number(s);
  return isFinite(x) ? x : 0;
}
const txt = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s || null;
};
async function run(p: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await p;
  if (error) throw new Error(error.message);
}
function tudo() {
  ["/", "/clientes", "/gastos", "/fluxo", "/faturamento", "/config"].forEach((p) => revalidatePath(p));
}

/* ---------- Pedidos ---------- */
export async function criarPedido(fd: FormData) {
  const s = db();
  const { data: cfg } = await s.from("config").select("adicional_prioridade").eq("id", 1).single();
  const { data, error } = await s
    .from("pedidos")
    .insert({
      cliente: txt(fd.get("cliente")) ?? "Sem nome",
      servico: txt(fd.get("servico")) ?? "Outros",
      descricao: txt(fd.get("descricao")),
      quantidade: Math.round(valor(fd.get("quantidade"))) || 1,
      data: txt(fd.get("data")) ?? hoje(),
      prioridade: fd.get("prioridade") === "on",
      valor_base: valor(fd.get("valor_base")),
      adicional_prioridade: Number(cfg?.adicional_prioridade ?? 35),
      forma_pagto: txt(fd.get("forma_pagto")) ?? "Pix",
      observacoes: txt(fd.get("observacoes")),
    })
    .select("id, data")
    .single();
  if (error) throw new Error(error.message);
  const pago = valor(fd.get("valor_pago"));
  if (pago > 0)
    await run(s.from("pagamentos").insert({ pedido_id: data.id, data: data.data, valor: pago, forma: txt(fd.get("forma_pagto")) ?? "Pix" }));
  tudo();
}

export async function registrarPagamento(fd: FormData) {
  const v = valor(fd.get("valor"));
  if (v <= 0) return;
  await run(
    db().from("pagamentos").insert({
      pedido_id: Number(fd.get("pedido_id")),
      valor: v,
      data: txt(fd.get("data")) ?? hoje(),
      forma: txt(fd.get("forma")) ?? "Pix",
    })
  );
  tudo();
}

export async function excluirPedido(fd: FormData) {
  await run(db().from("pedidos").delete().eq("id", Number(fd.get("id"))));
  tudo();
}

export async function excluirPagamento(fd: FormData) {
  await run(db().from("pagamentos").delete().eq("id", Number(fd.get("id"))));
  tudo();
}

/* ---------- Gastos ---------- */
export async function criarGasto(fd: FormData) {
  const parc = String(fd.get("parcela") ?? "").match(/(\d+)\s*\/\s*(\d+)/);
  await run(
    db().from("gastos").insert({
      data: txt(fd.get("data")) ?? hoje(),
      descricao: txt(fd.get("descricao")) ?? "Gasto",
      categoria: txt(fd.get("categoria")) ?? "Outros",
      parcela_atual: parc ? Number(parc[1]) : null,
      parcela_total: parc ? Number(parc[2]) : null,
      valor: valor(fd.get("valor")),
      observacoes: txt(fd.get("observacoes")),
    })
  );
  tudo();
}

export async function excluirGasto(fd: FormData) {
  await run(db().from("gastos").delete().eq("id", Number(fd.get("id"))));
  tudo();
}

/* ---------- Despesas fixas ---------- */
export async function lancarFixas(fd: FormData) {
  const s = db();
  const mes = txt(fd.get("mes")) ?? mesAtual();
  const { data: fixas } = await s.from("despesas_fixas").select("*").eq("ativo", true);
  const { data: existentes } = await s
    .from("gastos")
    .select("descricao")
    .gte("data", `${mes}-01`)
    .lte("data", ultimoDia(mes));
  const ja = new Set((existentes ?? []).map((g) => String(g.descricao).toLowerCase()));
  const novos = (fixas ?? [])
    .filter((f) => !ja.has(String(f.nome).toLowerCase()))
    .map((f) => ({ data: `${mes}-05`, descricao: f.nome, categoria: f.categoria, valor: f.valor, observacoes: "Despesa fixa" }));
  if (novos.length) await run(s.from("gastos").insert(novos));
  tudo();
}

export async function criarFixa(fd: FormData) {
  await run(
    db().from("despesas_fixas").insert({
      nome: txt(fd.get("nome")) ?? "Despesa",
      categoria: txt(fd.get("categoria")) ?? "Contas fixas",
      valor: valor(fd.get("valor")),
    })
  );
  tudo();
}

export async function alternarFixa(fd: FormData) {
  await run(db().from("despesas_fixas").update({ ativo: fd.get("ativo") !== "true" }).eq("id", Number(fd.get("id"))));
  tudo();
}

export async function excluirFixa(fd: FormData) {
  await run(db().from("despesas_fixas").delete().eq("id", Number(fd.get("id"))));
  tudo();
}

/* ---------- Config e preços ---------- */
export async function salvarConfig(fd: FormData) {
  await run(
    db().from("config").upsert({
      id: 1,
      caixa_inicial: valor(fd.get("caixa_inicial")),
      adicional_prioridade: valor(fd.get("adicional_prioridade")),
      markup_revenda: valor(fd.get("markup_revenda")),
    })
  );
  tudo();
}

export async function salvarPreco(fd: FormData) {
  await run(
    db().from("precos").upsert({
      tamanho: txt(fd.get("tamanho")) ?? "",
      quantidade: Math.round(valor(fd.get("quantidade"))),
      preco: valor(fd.get("preco")),
    })
  );
  revalidatePath("/config");
}
