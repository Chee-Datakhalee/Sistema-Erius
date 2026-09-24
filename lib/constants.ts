export const SERVICOS = [
  "Etiquetas",
  "Adesivos",
  "Adesivação",
  "Placas/Sinalização",
  "Banners/Faixas",
  "Outros",
] as const;

export const CATEGORIAS_GASTO = [
  "Bobina/Vinil",
  "Tinta",
  "Anúncios (Ads)",
  "Parcelas de equipamento",
  "Contas fixas",
  "Embalagem/Frete",
  "Outros",
] as const;

// Limites (% do total de despesas) — vindos da aba Config da planilha
export const LIMITES: Record<string, { amarelo: number; vermelho: number }> = {
  "Anúncios (Ads)": { amarelo: 0.15, vermelho: 0.25 },
  Tinta: { amarelo: 0.1, vermelho: 0.18 },
  "Bobina/Vinil": { amarelo: 0.3, vermelho: 0.45 },
  "Parcelas de equipamento": { amarelo: 0.2, vermelho: 0.35 },
  "Contas fixas": { amarelo: 0.2, vermelho: 0.3 },
  "Embalagem/Frete": { amarelo: 0.08, vermelho: 0.15 },
  Outros: { amarelo: 0.1, vermelho: 0.2 },
};

export const CORES = ["#00AEEF", "#EC008C", "#FFF200", "#F5F5F5", "#6B6B6B", "#33C3F2", "#F0339C"];

export const FORMAS = ["Pix", "Dinheiro", "Cartão", "Boleto"] as const;
