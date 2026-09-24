import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/supabase";
import { brl, dataBR } from "@/lib/format";
import { LOGO_ERIUS_PNG_BASE64 } from "@/lib/logo-base64";

// Paleta CMYK da Érius
const CIANO = rgb(0 / 255, 174 / 255, 239 / 255);
const MAGENTA = rgb(236 / 255, 0 / 255, 140 / 255);
const PRETO = rgb(0.11, 0.11, 0.11);
const CINZA = rgb(0.35, 0.37, 0.36);
const LINHA = rgb(0.85, 0.85, 0.85);

const mm = (v: number) => v * 2.834645669; // mm → pt

function quebraTexto(font: any, size: number, texto: string, larguraMax: number) {
  const palavras = texto.split(" ");
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const teste = (atual + " " + p).trim();
    if (font.widthOfTextAtSize(teste, size) > larguraMax && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const s = db();
  const { data: orc, error } = await s.from("orcamentos").select("*").eq("id", id).single();
  if (error || !orc) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  const { data: itensRaw } = await s.from("orcamento_itens").select("*").eq("orcamento_id", id).order("ordem");
  const itens = (itensRaw ?? []).map((i) => ({ ...i, valor_unitario: Number(i.valor_unitario), valor_total: Number(i.valor_total) }));

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Proposta Comercial - ${orc.cliente}`);
  const page = pdf.addPage([mm(210), mm(297)]);
  const W = mm(210), H = mm(297), M = mm(20);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, x: number, y: number, opts: { size?: number; font?: any; color?: any; align?: "left" | "right" } = {}) => {
    const { size = 10, font = reg, color = PRETO, align = "left" } = opts;
    const w = font.widthOfTextAtSize(text, size);
    const xx = align === "right" ? x - w : x;
    page.drawText(text, { x: xx, y, size, font, color });
  };

  // Faixas do topo (ciano) e rodapé (magenta) — identidade CMYK
  page.drawRectangle({ x: 0, y: H - mm(8), width: W, height: mm(8), color: CIANO });
  page.drawRectangle({ x: 0, y: 0, width: W, height: mm(6), color: MAGENTA });

  // Logo no canto superior esquerdo
  try {
    const logoBytes = Buffer.from(LOGO_ERIUS_PNG_BASE64, "base64");
    const logoImg = await pdf.embedPng(logoBytes);
    const logoSize = mm(22);
    page.drawImage(logoImg, { x: M, y: H - mm(20) - logoSize, width: logoSize, height: logoSize });
  } catch {
    // segue sem logo se algo falhar na incorporação
  }

  let y = H - mm(24);
  drawText("PROPOSTA COMERCIAL", W - M, y, { size: 20, font: bold, color: PRETO, align: "right" });
  drawText(`Nº ${String(id).padStart(4, "0")}/${orc.data.slice(0, 4)}   ·   ${dataBR(orc.data)}`, W - M, y - mm(7), { size: 8.5, color: CINZA, align: "right" });

  y = H - mm(58);
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINHA });

  y -= mm(10);
  drawText("CLIENTE", M, y, { size: 8, color: CINZA });
  drawText(orc.cliente.toUpperCase(), M, y - mm(7), { size: 15, font: bold, color: PRETO });
  drawText("VALIDADE DA PROPOSTA", W - M, y, { size: 8, color: CINZA, align: "right" });
  drawText(`${orc.validade_dias} dias`, W - M, y - mm(6), { size: 11, font: bold, color: PRETO, align: "right" });

  y -= mm(18);
  drawText("Apresentamos abaixo os valores para produção de etiquetas adesivas conforme solicitado.", M, y, { size: 9.5, color: CINZA });
  y -= mm(10);

  // Tabela única: ITEM | TAMANHO | QTD | UNITÁRIO | VALOR (como no PDF de referência da Talita)
  const temEtiqueta = itens.some((i) => i.tipo === "etiqueta");
  if (temEtiqueta) {
    drawText("ETIQUETAS ADESIVAS", M, y, { size: 11, font: bold, color: PRETO });
    y -= mm(5);
    drawText("Impressão digital colorida  ·  Vinil adesivo  ·  Corte no formato  ·  Acabamento em rolo ou cartela", M, y, { size: 8, color: CINZA });
    y -= mm(8);
  }

  const colItem = M, colTam = M + mm(78), colQtd = M + mm(108), colUni = M + mm(138), colVal = W - M;
  drawText("ITEM", colItem, y, { size: 8, font: bold, color: PRETO });
  drawText("TAMANHO", colTam, y, { size: 8, font: bold, color: PRETO });
  drawText("QTD", colQtd, y, { size: 8, font: bold, color: PRETO });
  drawText("UNITÁRIO", colUni, y, { size: 8, font: bold, color: PRETO, align: "right" });
  drawText("VALOR", colVal, y, { size: 8, font: bold, color: PRETO, align: "right" });
  y -= mm(2.5);
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: PRETO });

  for (let i = 0; i < itens.length; i++) {
    const it = itens[i];
    y -= mm(8);
    if (i % 2 === 0) page.drawRectangle({ x: M, y: y - mm(2.5), width: W - 2 * M, height: mm(8), color: rgb(0.98, 0.98, 0.98) });
    const nomeItem = it.tipo === "etiqueta" ? (it.descricao ? `Adesivo ${it.descricao}` : "Adesivo") : (it.descricao ?? it.servico);
    drawText(nomeItem, colItem, y, { size: 9.5, font: bold, color: PRETO });
    drawText(it.tamanho ?? "—", colTam, y, { size: 9.5, color: CINZA });
    drawText(`${it.quantidade} un`, colQtd, y, { size: 9.5, color: CINZA });
    drawText(brl(it.valor_unitario), colUni, y, { size: 9.5, color: CINZA, align: "right" });
    drawText(brl(it.valor_total), colVal, y, { size: 10, font: bold, color: rgb(0, 0.55, 0.7), align: "right" });
    y -= mm(2.5);
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.4, color: LINHA });
  }

  const totalGeral = itens.reduce((s2, i) => s2 + i.valor_total, 0);
  y -= mm(9);
  drawText("VALOR TOTAL", colItem, y, { size: 10, font: bold, color: PRETO });
  drawText(brl(totalGeral), colVal, y, { size: 13, font: bold, color: MAGENTA, align: "right" });

  if (orc.desconto_a_vista != null) {
    y -= mm(7);
    drawText("À VISTA", colItem, y, { size: 9, font: bold, color: CINZA });
    drawText(brl(Number(orc.desconto_a_vista)), colVal, y, { size: 11, font: bold, color: rgb(0, 0.55, 0.7), align: "right" });
  }

  // Condições comerciais
  y -= mm(16);
  drawText("CONDIÇÕES COMERCIAIS", M, y, { size: 10, font: bold, color: PRETO });
  page.drawLine({ start: { x: M, y: y - mm(2.5) }, end: { x: M + mm(42), y: y - mm(2.5) }, thickness: 1, color: MAGENTA });
  y -= mm(9);

  const cond: [string, string][] = [
    ["Prazo de produção", orc.prazo ?? "7 dias úteis após aprovação da arte"],
  ];
  if (orc.producao_prioritaria) {
    cond.push(["Produção prioritária", "Opcional: entrega em até 48h mediante acréscimo de R$ 35,00 ao valor."]);
  }
  cond.push(["Forma de pagamento", orc.pagamento ?? "50% na aprovação e 50% na entrega | PIX"]);
  cond.push(["Arte final", "Enviar em alta resolução nos formatos PDF, AI ou CDR."]);
  if (orc.bonificacao) cond.push(["Bonificação", orc.bonificacao]);
  if (orc.observacoes) cond.push(["Observação", orc.observacoes]);

  for (const [titulo, texto] of cond) {
    drawText(titulo, M, y, { size: 8.5, font: bold, color: PRETO });
    const linhasTxt = quebraTexto(reg, 8.5, texto, W - M - (M + mm(38)));
    linhasTxt.forEach((lt, j) => drawText(lt, M + mm(38), y - j * mm(4.2), { size: 8.5, color: CINZA }));
    y -= linhasTxt.length * mm(4.2) + mm(3.5);
  }

  // Rodapé
  page.drawLine({ start: { x: M, y: mm(24) }, end: { x: W - M, y: mm(24) }, thickness: 0.8, color: LINHA });
  drawText("ÉRIUS COMUNICAÇÃO VISUAL", M, mm(18), { size: 9, font: bold, color: PRETO });
  drawText("CNPJ 63.889.825/0001-29", M, mm(13.5), { size: 8, color: CINZA });
  drawText("contato@eriuscomunicacao.com.br  ·  (19) 99001-3719", W - M, mm(18), { size: 8, color: CINZA, align: "right" });
  drawText("Agradecemos a oportunidade.", W - M, mm(13.5), { size: 8, color: CINZA, align: "right" });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Proposta_${orc.cliente.replace(/\s+/g, "_")}.pdf"`,
    },
  });
}
