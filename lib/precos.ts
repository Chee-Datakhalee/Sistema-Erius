export type PrecoTabela = { tamanho: string; quantidade: number; preco: number };

// Interpola o preço pela tabela (tamanho x quantidade), igual à calculadora de Config.
export function precoEtiqueta(precos: PrecoTabela[], tamanho: string, quantidade: number): number {
  const rows = precos.filter((p) => p.tamanho === tamanho).sort((a, b) => a.quantidade - b.quantidade);
  if (!rows.length || !quantidade) return 0;
  const exato = rows.find((r) => r.quantidade === quantidade);
  if (exato) return exato.preco;
  let a = rows[0], b = rows[rows.length - 1];
  if (quantidade < a.quantidade) b = rows[1] ?? a;
  else if (quantidade > b.quantidade) a = rows[rows.length - 2] ?? b;
  else for (let i = 0; i < rows.length - 1; i++) if (rows[i].quantidade < quantidade && rows[i + 1].quantidade > quantidade) { a = rows[i]; b = rows[i + 1]; }
  if (a.quantidade === b.quantidade) return a.preco;
  return a.preco + ((b.preco - a.preco) * (quantidade - a.quantidade)) / (b.quantidade - a.quantidade);
}
