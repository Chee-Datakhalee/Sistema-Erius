import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/supabase";
import { brl, dataBR } from "@/lib/format";

// Cores CMYK da Érius, em RGB 0–1 (pdf-lib usa esse formato)
const CIANO = rgb(0 / 255, 174 / 255, 239 / 255);
const MAGENTA = rgb(236 / 255, 0 / 255, 140 / 255);
const AMARELO = rgb(255 / 255, 242 / 255, 0 / 255);
const PRETO = rgb(0.11, 0.11, 0.11);
const CINZA = rgb(0.35, 0.37, 0.36);
const CLARO = rgb(0.96, 0.96, 0.96);
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

  // Faixas ciano no topo e magenta no rodapé (identidade CMYK)
  page.drawRectangle({ x: 0, y: H - mm(8), width: W, height: mm(8), color: CIANO });
  page.drawRectangle({ x: 0, y: 0, width: W, height: mm(6), color: MAGENTA });

  let y = H - mm(24);
  // Espaço reservado para logo: canto superior esquerdo, ~60x30mm
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
  drawText("Apresentamos abaixo os valores para os itens solicitados.", M, y, { size: 9.5, color: CINZA });
  y -= mm(10);

  // Agrupa itens por (servico + tamanho) para blocos, ou cada manual isolado
  type Grupo = { titulo: string; linhas: { qtd: string; uni: string; tot: string }[] };
  const grupos: Grupo[] = [];
  const porTitulo = new Map<string, Grupo>();
  for (const it of itens) {
    const titulo = it.tipo === "etiqueta"
      ? `ETIQUETA ADESIVA ${it.tamanho}`
      : (it.descricao ?? it.servico).toUpperCase();
    if (!porTitulo.has(titulo)) {
      const g: Grupo = { titulo, linhas: [] };
      porTitulo.set(titulo, g);
      grupos.push(g);
    }
    porTitulo.get(titulo)!.linhas.push({
      qtd: `${it.quantidade} un.`,
      uni: brl(it.valor_unitario),
      tot: brl(it.valor_total),
    });
  }

  for (let gi = 0; gi < grupos.length; gi++) {
    const g = grupos[gi];
    if (gi > 0) y -= mm(9);

    // cabeçalho do item (faixa ciano)
    page.drawRectangle({ x: M, y: y - mm(11), width: W - 2 * M, height: mm(11), color: CIANO });
    drawText(`ITEM ${String(gi + 1).padStart(2, "0")}  ·  ${g.titulo}`, M + mm(4), y - mm(7.5), { size: 10.5, font: bold, color: rgb(1, 1, 1) });
    y -= mm(11);

    // cabeçalho da tabela
    const col1 = M + mm(4), col2 = W / 2 + mm(5), col3 = W - M - mm(4);
    y -= mm(7);
    drawText("QUANTIDADE", col1, y, { size: 8, font: bold, color: PRETO });
    drawText("VALOR UNITÁRIO", col2, y, { size: 8, font: bold, color: PRETO, align: "right" });
    drawText("VALOR TOTAL", col3, y, { size: 8, font: bold, color: PRETO, align: "right" });
    page.drawLine({ start: { x: M, y: y - mm(2.5) }, end: { x: W - M, y: y - mm(2.5) }, thickness: 0.6, color: LINHA });

    for (let i = 0; i < g.linhas.length; i++) {
      const l = g.linhas[i];
      y -= mm(8);
      if (i % 2 === 0) page.drawRectangle({ x: M, y: y - mm(2.5), width: W - 2 * M, height: mm(8), color: rgb(0.98, 0.98, 0.98) });
      drawText(l.qtd, col1, y, { size: 10, font: bold, color: PRETO });
      drawText(l.uni, col2, y, { size: 10, color: CINZA, align: "right" });
      drawText(l.tot, col3, y, { size: 10.5, font: bold, color: rgb(0, 0.55, 0.7), align: "right" });
      page.drawLine({ start: { x: M, y: y - mm(2.5) }, end: { x: W - M, y: y - mm(2.5) }, thickness: 0.4, color: LINHA });
    }
    y -= mm(2.5);
  }

  const totalGeral = itens.reduce((s2, i) => s2 + i.valor_total, 0);
  y -= mm(10);
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: PRETO });
  y -= mm(8);
  drawText("VALOR TOTAL DA PROPOSTA", M, y, { size: 10, font: bold, color: PRETO });
  drawText(brl(totalGeral), W - M, y, { size: 15, font: bold, color: MAGENTA, align: "right" });

  // Condições comerciais
  y -= mm(14);
  drawText("CONDIÇÕES COMERCIAIS", M, y, { size: 10, font: bold, color: PRETO });
  page.drawLine({ start: { x: M, y: y - mm(2.5) }, end: { x: M + mm(42), y: y - mm(2.5) }, thickness: 1, color: CIANO });
  y -= mm(9);

  const cond: [string, string][] = [
    ["Prazo de produção", orc.prazo ?? "5 dias úteis após aprovação da arte"],
    ["Forma de pagamento", orc.pagamento ?? "50% na aprovação e 50% na entrega | PIX"],
    ["Arte final", "Enviada pelo cliente em alta resolução (PDF, AI ou CDR) ou desenvolvida pela Érius mediante orçamento à parte."],
    ["Frete", "A combinar. Retirada no local sem custo."],
  ];
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
