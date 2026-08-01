import type { OperationalDiaryEntry } from "./types";

/** Registro oficial — 16/07/2026 · Salgados (homologado A.3.1) */
export const OFFICIAL_DIARY_2026_07_16: OperationalDiaryEntry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-16",
  dailyGoalUnits: 9,
  purchase: {
    totalUnits: 9,
    investment: 31.5,
    products: [
      { name: "Croissant", quantity: 3 },
      { name: "Misto com Catupiry", quantity: 3 },
      { name: "Pastel de Frango com Presunto", quantity: 3 },
    ],
  },
  sales: { paidCount: 8, creditCount: 0 },
  revenue: { received: 45, pending: 0, total: 45 },
  profit: 45,
  quantitySold: 9,
  quantityLost: 0,
  observations:
    "Primeiro dia oficial ACAL. 100% vendido em 47 min. 100% PIX. Investimento R$ 31,50 (Henrique — 100%). Lucro R$ 45,00 (= faturamento, sem custo próprio).",
  manualInsights:
    "Henrique arcou com todo o investimento. Lucro operacional = faturamento. Preço R$ 5,00 aceito. Mix 3+3+3 equilibrado.",
  lessonsLearned:
    "Validação bem-sucedida. Decisão: 12 unidades no dia 17 (5 Croissant, 4 Pastel, 3 Misto).",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Estoque esgotado em 47 minutos.",
      "Germana — primeira venda múltipla (pagador ≠ consumidor).",
    ],
    conclusion: "Produção dia 17 definida com base exclusiva neste dia.",
  },
  suggestedActions: [
    {
      id: "producao-dia-17",
      title: "Aumentar produção para 12 unidades (17/07)",
      description: "5 Croissants · 4 Pastéis · 3 Mistos.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Mix equilibrado — dados insuficientes para favorito.",
      confirmed: null,
    },
  ],
  tags: ["primeiro-dia", "validacao", "pix-100", "estoque-zerado"],
};

/** Registro oficial — 17/07/2026 · Salgados (homologado A.3.2 · ROO-0002) */
export const OFFICIAL_DIARY_2026_07_17: OperationalDiaryEntry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-17",
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 12,
    investment: 42,
    products: [
      { name: "Croissant", quantity: 5 },
      { name: "Pastel de Frango com Presunto", quantity: 4 },
      { name: "Misto com Catupiry", quantity: 3 },
    ],
  },
  sales: { paidCount: 12, creditCount: 0 },
  revenue: { received: 60, pending: 0, total: 60 },
  profit: 60,
  quantitySold: 12,
  quantityLost: 0,
  observations:
    "ROO-0002. Segundo dia ACAL. 100% vendido. Investimento R$ 42,00 (Henrique — 100%). Lucro R$ 60,00 (= faturamento, sem custo próprio).",
  manualInsights:
    "Henrique arcou com todo o investimento. Lucro operacional = faturamento. Manter R$ 5,00. Crescimento gradual.",
  lessonsLearned:
    "Produção 12 un validada. Recorrência intradiária (Raimunda). Mix 5+4+3 conforme plano do dia 16.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "100% estoque vendido.",
      "Raimunda — 2 compras no mesmo dia.",
      "Vendas matinais e vespertinas.",
    ],
    conclusion: "Segundo dia validado. Crescimento gradual confirmado.",
  },
  suggestedActions: [
    {
      id: "crescimento-gradual",
      title: "Continuar crescimento gradual",
      description: "Manter preço e registrar clientes.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Mix 5+4+3 — dados insuficientes para favorito.",
      confirmed: null,
    },
  ],
  tags: ["segundo-dia", "roo-0002", "pix-100", "raimunda-recorrente"],
};

/** Registro oficial — 20/07/2026 · Salgados (reconciliado 21/07) */
export const OFFICIAL_DIARY_2026_07_20: OperationalDiaryEntry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-20",
  dailyGoalUnits: 15,
  purchase: {
    totalUnits: 15,
    investment: 52.5,
    products: [
      { name: "Croissant", quantity: 6 },
      { name: "Pastel", quantity: 5 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: {
    paidCount: 11,
    creditCount: 0,
    fatherSale: { units: 3, amount: 15, buyerName: "Henrique" },
  },
  revenue: {
    received: 75,
    pending: 0,
    total: 75,
  },
  profit: 22.5,
  quantitySold: 15,
  quantityLost: 0,
  observations:
    "15 un destinadas · 0 perdas. Mikely fiado (PIX 21/07) · Anselmo recuperado (PIX 21/07) · Henrique sobras 21:00. Lucro R$ 22,50.",
  manualInsights:
    "Pastel esgotou rapidamente. Croissant apresentou desempenho inferior ao esperado. Misto com Catupiry apresentou crescimento. Divergência de pagamento não implica perda operacional.",
  lessonsLearned:
    "O preço não estava visível. Clientes perguntaram antes de comprar. Uma placa mais clara pode aumentar a conversão. Atraso no pagamento não deve ser registrado como perda.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Pessoas perguntaram o preço antes de comprar.",
      "Unidade considerada perdida foi vendida — divergência foi apenas atraso no pagamento.",
    ],
    conclusion: "Existe atrito no processo de venda. Fiado e atraso de pagamento não equivalem a perda.",
  },
  suggestedActions: [
    {
      id: "placa-qrcode-v2",
      title: "Nova placa com QR Code e preço visível",
      description:
        "Criar placa contendo: QR Code, valor unitário, sabores disponíveis, mensagem chamativa e Pix pré-preenchido com R$ 5,00.",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Pastel", hypothesis: "Pastel tornou-se o sabor de maior saída.", confirmed: null },
    { flavor: "Croissant", hypothesis: "Croissant perdeu força.", confirmed: null },
    { flavor: "Misto com Catupiry", hypothesis: "Misto com Catupiry apresentou crescimento.", confirmed: null },
  ],
  tags: ["atrato-venda", "placa", "qrcode", "mix-produtos", "meta-atingida", "reconciliacao-pagamento"],
};

/** Registro oficial — 21/07/2026 · Salgados */
export const OFFICIAL_DIARY_2026_07_21: OperationalDiaryEntry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-21",
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 12,
    investment: 44,
    products: [
      { name: "Croissant", quantity: 4 },
      { name: "Pastel", quantity: 4 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: { paidCount: 10, creditCount: 0 },
  revenue: { received: 60, pending: 0, total: 60 },
  profit: 16,
  quantitySold: 12,
  quantityLost: 0,
  observations:
    "ROO-0002. 10 transações · 12 un · R$ 60 · lucro R$ 16. Recebimentos 20/07 (Mikelly/Anselmo R$ 10) via cash_flow — não vendas do 21.",
  manualInsights:
    "Demanda forte antes do horário de chegada (08h00–08h30). Terças com demanda alta. Demanda reprimida 15h30–16h00.",
  lessonsLearned:
    "Chegar mais cedo pode capturar demanda matinal. Coletar contatos para encomendas. Meta matinal: 8–9 unidades até 10h. Terças/quintas mantêm demanda alta.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Colaboradores procuram salgados entre 08h00 e 08h30.",
      "Demanda reprimida entre 15h30 e 16h00.",
      "Meta matinal: 8–9 unidades até 10h.",
    ],
    conclusion: "Antecipar chegada e aumentar compra em dias fortes.",
  },
  suggestedActions: [
    {
      id: "chegar-mais-cedo",
      title: "Antecipar horário de chegada",
      description: "Testar chegada antes das 08h30 por 3 dias úteis.",
      status: "planned",
    },
    {
      id: "meta-manha-8-9",
      title: "Meta matinal até 10h",
      description: "Vender entre 8 e 9 unidades até 10h da manhã.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Chegar mais cedo pode aumentar significativamente o faturamento diário.",
      confirmed: null,
    },
  ],
  tags: ["meta-atingida", "demanda-matinal", "demanda-reprimida", "terca-feira"],
};

/** Registro oficial — 22/07/2026 · Salgados (primeiro dia pós-Consolidação Histórica) */
export const OFFICIAL_DIARY_2026_07_22: OperationalDiaryEntry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-22",
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 15,
    investment: 52.5,
    products: [
      { name: "Croissant", quantity: 5 },
      { name: "Pastel de Frango com Presunto", quantity: 5 },
      { name: "Misto com Catupiry", quantity: 5 },
    ],
  },
  sales: {
    paidCount: 11,
    creditCount: 0,
    fatherSale: { units: 3, amount: 15, buyerName: "Clientes do trabalho do Henrique" },
  },
  revenue: { received: 75, pending: 0, total: 75 },
  profit: 52.5,
  quantitySold: 15,
  quantityLost: 0,
  observations:
    "15 un vendidas · R$ 75 · lucro R$ 52,50. Investimento: R$ 22,50 próprio + R$ 30,00 Henrique. Lucro = faturamento − minha parte do investimento.",
  manualInsights:
    "Henrique pagou R$ 30,00 do custo; investi R$ 22,50. Com 15 salgados a R$ 5, lucro operacional R$ 52,50. Manter 12 un na ACAL nesta semana.",
  lessonsLearned:
    "Não assumir perda antes de confirmar. Preservar incertezas como eventos operacionais.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "1 pastel em investigação — não contabilizar como perda.",
      "Sabores dos últimos 3 salgados não identificados.",
    ],
    conclusion: "Regularizar pendências quando houver evidência documental.",
  },
  suggestedActions: [
    {
      id: "identificar-cliente-dinheiro-2207",
      title: "Identificar cliente dos 2 salgados em dinheiro",
      description: "Perguntar à Dona Raimunda.",
      status: "in_progress",
    },
    {
      id: "pastel-investigacao-2207",
      title: "Pastel em investigação",
      description: "1 pastel — não contabilizar como perda.",
      status: "in_progress",
    },
    {
      id: "encomenda-misto-sexta",
      title: "Encomenda — 2 Mistos para sexta-feira",
      description: "Colega do Henrique — planejamento futuro.",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Geral", hypothesis: "Manter 12 unidades na ACAL nesta semana.", confirmed: null },
  ],
  tags: ["pos-consolidacao", "investigacao-pastel", "sabor-nao-identificado", "operacao-real"],
};
