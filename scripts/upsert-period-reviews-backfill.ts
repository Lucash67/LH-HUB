/**
 * Backfill Retratos faltantes: semanas 13/07 → 09/08 + mês julho/2026.
 * (10–14 e 17–21 já publicados.)
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-reviews-backfill.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

type Review = PeriodReviewUpsert & { businessId: string };

const EMPTY_PREV = {
  label: "Sem baseline",
  start: "2026-07-01",
  end: "2026-07-01",
  revenue: 0,
  diaryProfit: 0,
  unitsSold: 0,
  unitsLost: 0,
  ownCapital: 0,
  familyCapital: 0,
  purchaseInvestment: 0,
};

/** 13–19/07 — primeiros dias homologados (qui–sex). */
const W_0713: Review = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-07-13",
  rangeStart: "2026-07-13",
  rangeEnd: "2026-07-19",
  status: "published",
  title: "Primeira semana operada — Salgados",
  headline: "Dois dias, lucro = faturamento: estoque 100% família e operação ainda nascendo",
  summary:
    "Semana 13–19/07 teve só qui 16 e sex 17 homologados (R$ 105 fat · R$ 105 lucro · 21 un.). Capital próprio R$ 0 — tudo família (R$ 73,50). Sem baseline anterior: é o ponto zero da operação pós-consolidação.",
  causes: [
    {
      rank: 1,
      title: "Só 2 dias operados (qui–sex)",
      detail:
        "Seg–qua sem registro. A semana inteira cabe em R$ 105 / 21 un. — leitura é de abertura, não de ritmo semanal cheio.",
      impact: "critical",
      badge: "#1 cobertura",
    },
    {
      rank: 2,
      title: "Lucro = fat porque o bolso próprio não entrou",
      detail:
        "Investimento R$ 73,50 100% família. Custo operacional do operador ≈ 0 → cada real vendido entrou como lucro no diário.",
      impact: "high",
      badge: "#2 capital",
    },
    {
      rank: 3,
      title: "Canal único: Acal",
      detail: "Sem Henrique/Unifor nesta abertura. Mix simples, fácil de ler, volume ainda baixo.",
      impact: "medium",
      badge: "#3 mix",
    },
  ],
  actions: [
    {
      title: "Completar a grade seg–sex",
      why: "Semana parcial não vira régua",
      measure: "5 dias com diário na próxima semana",
    },
    {
      title: "Começar a misturar capital próprio",
      why: "Lucro 100% família distorce a leitura do bolso",
      measure: "Pelo menos 1 dia com own > 0",
    },
  ],
  nextGoals: "Operar 5 dias · fat ≥ R$ 300 · registrar split próprio/família com clareza",
  fairReading:
    "Não compare esta semana com as seguintes em valor absoluto. Use como marco zero: a operação existe, vende, e ainda depende 100% do capital da família.",
  metricsSnapshot: {
    current: {
      label: "16–17/07 (abertura)",
      start: "2026-07-16",
      end: "2026-07-17",
      revenue: 105,
      diaryProfit: 105,
      unitsSold: 21,
      unitsLost: 0,
      ownCapital: 0,
      familyCapital: 73.5,
      purchaseInvestment: 73.5,
    },
    previous: EMPTY_PREV,
    pills: [
      { label: "2 dias operados", tone: "neutral" },
      { label: "Own R$ 0", tone: "warning" },
      { label: "Lucro = fat", tone: "success" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    dailyProfitNote: "Só qui e sex com diário · seg–qua sem operação homologada",
    dailyProfitCompare: [
      { label: "Seg", previous: 0, current: 0 },
      { label: "Ter", previous: 0, current: 0 },
      { label: "Qua", previous: 0, current: 0 },
      { label: "Qui", previous: 0, current: 45 },
      { label: "Sex", previous: 0, current: 60 },
    ],
    chartTitleAcal: "Faturamento Acal",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 0, current: 0 },
      { label: "Ter", previous: 0, current: 0 },
      { label: "Qua", previous: 0, current: 0 },
      { label: "Qui", previous: 0, current: 45 },
      { label: "Sex", previous: 0, current: 60 },
    ],
    channels: [
      { name: "Acal", previousRevenue: 0, currentRevenue: 105, previousProfit: 0, currentProfit: 105 },
      { name: "Henrique", previousRevenue: 0, currentRevenue: 0, previousProfit: 0, currentProfit: 0 },
      { name: "Unifor", previousRevenue: 0, currentRevenue: 0, previousProfit: 0, currentProfit: 0 },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "—", current: "21", delta: "abertura" },
      { metric: "Un. perdidas", previous: "—", current: "0", delta: "—" },
      { metric: "Invest. compra", previous: "—", current: "R$ 73,50", delta: "—" },
      { metric: "Capital família", previous: "—", current: "R$ 73,50", delta: "100%" },
    ],
    footerNote: "Primeira semana com diário homologado. Lucro = diary operational_profit.",
  },
};

/** 20–26/07 × 13–19/07 */
const W_0720: Review = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-07-20",
  rangeStart: "2026-07-20",
  rangeEnd: "2026-07-26",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline: "Primeira semana cheia: 5 dias, fat ×3,7 — e o lucro deixa de ser ‘grátis’",
  summary:
    "20–24/07 fechou R$ 395 fat · R$ 221 lucro · 79 un. vs abertura 16–17 (R$ 105 / R$ 105). Volume explodiu, mas o lucro por real caiu: own capital entrou (R$ 77,50) e seg/ter foram fracos (R$ 22,50 e R$ 16). Sexta 24 (R$ 95 lucro) puxou a semana.",
  causes: [
    {
      rank: 1,
      title: "Grade completa mudou a escala (+R$ 290 fat)",
      detail:
        "De 2 para 5 dias. Un. 21 → 79. A operação deixou de ser ‘teste’ e virou semana de verdade — comparação absoluta com a abertura é enganosa sem olhar por dia.",
      impact: "critical",
      badge: "#1 escala",
    },
    {
      rank: 2,
      title: "Seg e ter fracos (R$ 22,50 + R$ 16)",
      detail:
        "Começo de semana com lucro baixo mesmo com fat R$ 75 e R$ 60. Custo família alto nesses dias comprimiu margem operacional do operador.",
      impact: "high",
      badge: "#2 ritmo",
    },
    {
      rank: 3,
      title: "Capital próprio aparece (R$ 77,50)",
      detail:
        "Qua–sex começam a misturar own. Lucro deixa de espelhar fat. Bom para o negócio, pior para a ‘sensação’ de lucro fácil da abertura.",
      impact: "high",
      badge: "#3 caixa",
    },
    {
      rank: 4,
      title: "Henrique entra no mix (R$ 70 fat)",
      detail:
        "A partir de qua 22 o canal Colegas do Henrique soma R$ 70. Diversifica demanda, mas ainda é secundário frente à Acal (R$ 305).",
      impact: "medium",
      badge: "#4 mix",
    },
    {
      rank: 5,
      title: "Sexta 24 carrega a semana (R$ 95 lucro)",
      detail:
        "22 un. · fat R$ 110 · lucro R$ 95 com pouco own (R$ 15). Sem essa sexta o lucro semanal cairia para ~R$ 126.",
      impact: "medium",
      badge: "#5 pico",
    },
  ],
  actions: [
    {
      title: "Elevar piso de seg/ter",
      why: "Dois dias fracos derrubam a média",
      measure: "Lucro ≥ R$ 40 em seg e ter",
    },
    {
      title: "Manter 5 dias cheios",
      why: "A escala veio da grade completa",
      measure: "Nenhum dia útil sem diário",
    },
    {
      title: "Registrar split com clareza",
      why: "Own começou a importar",
      measure: "Own e família em todo dia",
    },
  ],
  nextGoals: "Lucro ≥ R$ 250 · fat ≥ R$ 400 · perdas ≤ 1 · seg/ter ≥ R$ 40 lucro",
  fairReading:
    "Crescimento real de volume. O ‘lucro menor que o fat’ não é piora — é o custo próprio entrando. O ponto de atenção é o começo de semana (seg/ter), não a sexta forte.",
  metricsSnapshot: {
    current: {
      label: "20–24/07 (atual)",
      start: "2026-07-20",
      end: "2026-07-24",
      revenue: 395,
      diaryProfit: 221,
      unitsSold: 79,
      unitsLost: 1,
      ownCapital: 77.5,
      familyCapital: 201,
      purchaseInvestment: 278.5,
    },
    previous: {
      label: "16–17/07 (abertura)",
      start: "2026-07-16",
      end: "2026-07-17",
      revenue: 105,
      diaryProfit: 105,
      unitsSold: 21,
      unitsLost: 0,
      ownCapital: 0,
      familyCapital: 73.5,
      purchaseInvestment: 73.5,
    },
    pills: [
      { label: "Fat +R$ 290", tone: "success" },
      { label: "Lucro +R$ 116", tone: "success" },
      { label: "Own R$ 77,50", tone: "neutral" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    dailyProfitCompare: [
      { label: "Seg", previous: 0, current: 22.5 },
      { label: "Ter", previous: 0, current: 16 },
      { label: "Qua", previous: 0, current: 52.5 },
      { label: "Qui", previous: 45, current: 35 },
      { label: "Sex", previous: 60, current: 95 },
    ],
    chartTitleAcal: "Faturamento Acal",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 0, current: 75 },
      { label: "Ter", previous: 0, current: 50 },
      { label: "Qua", previous: 0, current: 55 },
      { label: "Qui", previous: 45, current: 55 },
      { label: "Sex", previous: 60, current: 70 },
    ],
    channels: [
      { name: "Acal", previousRevenue: 105, currentRevenue: 305, previousProfit: 105, currentProfit: 160.41 },
      { name: "Henrique", previousRevenue: 0, currentRevenue: 70, previousProfit: 0, currentProfit: 27 },
      { name: "Unifor", previousRevenue: 0, currentRevenue: 0, previousProfit: 0, currentProfit: 0 },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "21", current: "79", delta: "+58" },
      { metric: "Un. perdidas", previous: "0", current: "1", delta: "+1" },
      { metric: "Invest. compra", previous: "R$ 73,50", current: "R$ 278,50", delta: "+R$ 205" },
      { metric: "Capital próprio", previous: "R$ 0", current: "R$ 77,50", delta: "+R$ 77,50" },
    ],
    footerNote: "Diário operacional · canais via sales.department.",
  },
};

/** 27/07–02/08 × 20–26/07 */
const W_0727: Review = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-07-27",
  rangeStart: "2026-07-27",
  rangeEnd: "2026-08-02",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline: "Melhor semana de julho: R$ 450 fat · R$ 294 lucro — e segunda 27 foi o pico",
  summary:
    "27–31/07: R$ 450 fat (+14%) · R$ 294 lucro (+33%) · 91 un. Capital próprio R$ 156 (dobrou vs R$ 77,50). Segunda 27 sozinha fez R$ 150 fat / R$ 108 lucro. Terça 28 esfriou (R$ 34). Perdas 2 un.",
  causes: [
    {
      rank: 1,
      title: "Segunda 27 carregou a semana (R$ 108 lucro)",
      detail:
        "30 un. · R$ 150 fat · split 42 próprio + 45 família. Metade Henrique no fat do dia. Sem essa segunda o lucro semanal cairia para ~R$ 186.",
      impact: "critical",
      badge: "#1 pico",
    },
    {
      rank: 2,
      title: "Lucro semanal +R$ 73 vs semana anterior",
      detail:
        "221 → 294. Ritmo mais estável qua–sex (R$ 47–55) depois do tombo da terça. Escala e mix melhoraram juntos.",
      impact: "high",
      badge: "#2 resultado",
    },
    {
      rank: 3,
      title: "Own capital dobrou (R$ 77,50 → R$ 156)",
      detail:
        "Mais dinheiro seu no estoque, mas o lucro ainda subiu. Retorno own ≈ 1,88× (294/156) — saudável para o estágio.",
      impact: "high",
      badge: "#3 caixa",
    },
    {
      rank: 4,
      title: "Terça 28 fraca (R$ 34 lucro)",
      detail: "12 un. · 1 perda · fat R$ 55. Quebra o ritmo pós-segunda monstro. Padrão que volta em outras terças.",
      impact: "medium",
      badge: "#4 terça",
    },
    {
      rank: 5,
      title: "Henrique forte na segunda (R$ 75 fat)",
      detail:
        "Canal família/colegas somou R$ 105 na semana. Ajuda volume; Acal segue líder (R$ 355).",
      impact: "medium",
      badge: "#5 mix",
    },
  ],
  actions: [
    {
      title: "Replicar o padrão da segunda 27",
      why: "Melhor dia do mês em lucro",
      measure: "≥ 25 un. com split ~50/50 em pelo menos 1 dia",
    },
    {
      title: "Segurar a terça",
      why: "28/07 e outras terças esfriam",
      measure: "Lucro terça ≥ R$ 45",
    },
    {
      title: "Manter perdas ≤ 2",
      why: "Já em 2 — não deixar subir",
      measure: "Checklist de sobra",
    },
  ],
  nextGoals: "Lucro ≥ R$ 300 · fat ≥ R$ 450 · own ≤ R$ 180 · perdas ≤ 2",
  fairReading:
    "Melhor semana cheia de julho. O risco é achar que toda segunda será 27/07 — o fundo da terça mostra que o ritmo ainda oscila. Trate 27 como teto aspiracional e 294 como prova de que R$ 300/semana é possível.",
  metricsSnapshot: {
    current: {
      label: "27–31/07 (atual)",
      start: "2026-07-27",
      end: "2026-07-31",
      revenue: 450,
      diaryProfit: 294,
      unitsSold: 91,
      unitsLost: 2,
      ownCapital: 156,
      familyCapital: 148,
      purchaseInvestment: 304,
    },
    previous: {
      label: "20–24/07 (anterior)",
      start: "2026-07-20",
      end: "2026-07-24",
      revenue: 395,
      diaryProfit: 221,
      unitsSold: 79,
      unitsLost: 1,
      ownCapital: 77.5,
      familyCapital: 201,
      purchaseInvestment: 278.5,
    },
    pills: [
      { label: "Lucro +R$ 73", tone: "success" },
      { label: "Fat +R$ 55", tone: "success" },
      { label: "Seg 27 = R$ 108", tone: "neutral" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    dailyProfitCompare: [
      { label: "Seg", previous: 22.5, current: 108 },
      { label: "Ter", previous: 16, current: 34 },
      { label: "Qua", previous: 52.5, current: 49.5 },
      { label: "Qui", previous: 35, current: 55 },
      { label: "Sex", previous: 95, current: 47.5 },
    ],
    chartTitleAcal: "Faturamento Acal",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 75, current: 75 },
      { label: "Ter", previous: 50, current: 60 },
      { label: "Qua", previous: 55, current: 75 },
      { label: "Qui", previous: 55, current: 70 },
      { label: "Sex", previous: 70, current: 75 },
    ],
    channels: [
      { name: "Acal", previousRevenue: 305, currentRevenue: 355, previousProfit: 160.41, currentProfit: 232.05 },
      { name: "Henrique", previousRevenue: 70, currentRevenue: 105, previousProfit: 27, currentProfit: 40.5 },
      { name: "Unifor", previousRevenue: 0, currentRevenue: 0, previousProfit: 0, currentProfit: 0 },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "79", current: "91", delta: "+12" },
      { metric: "Un. perdidas", previous: "1", current: "2", delta: "+1" },
      { metric: "Invest. compra", previous: "R$ 278,50", current: "R$ 304,00", delta: "+R$ 25,50" },
      { metric: "Capital próprio", previous: "R$ 77,50", current: "R$ 156,00", delta: "+R$ 78,50" },
    ],
    footerNote: "Última semana cheia de julho · diário operacional.",
  },
};

/** 03–09/08 × 27/07–02/08 — inclui sábado 08/08 (Salgados). */
const W_0803: Review = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-08-03",
  rangeStart: "2026-08-03",
  rangeEnd: "2026-08-09",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline: "Faturou mais (R$ 495), lucrou quase igual (R$ 299,50) — sexta 07/08 ‘grátis’ mascara qua/qui fracos",
  summary:
    "03–08/08: R$ 495 fat · R$ 299,50 lucro · 99 un. vs 27–31 (R$ 450 / R$ 294). Own subiu para R$ 200,50. Sexta 07 com estoque 100% família (lucro = fat R$ 120) carrega o placar; qua 05 (R$ 17,50) e qui 06 (R$ 27) foram o fundo. Unifor aparece (R$ 15).",
  causes: [
    {
      rank: 1,
      title: "Sexta 07/08 inflou o lucro (~R$ 120)",
      detail:
        "Estoque 100% família (R$ 84). Lucro = fat. Sem essa sexta o lucro seria ~R$ 179,50 — bem abaixo dos R$ 294 da semana anterior. Mesmo padrão da ‘sexta grátis’ que distorceu comparações depois.",
      impact: "critical",
      badge: "#1 distorce",
    },
    {
      rank: 2,
      title: "Qua e qui no fundo (R$ 17,50 + R$ 27)",
      detail:
        "Dois dias com own alto (R$ 52,50 e R$ 63) e lucro baixo. Compra 100% própria nesses dias matou margem. Padrão que o Retrato 10–14 já apontou.",
      impact: "critical",
      badge: "#2 caixa ruim",
    },
    {
      rank: 3,
      title: "Own capital sobe (R$ 156 → R$ 200,50)",
      detail:
        "Mais dinheiro seu no jogo. Retorno own 299,5/200,5 ≈ 1,49× — pior que 1,88× da semana anterior. Fat maior não salvou eficiência do bolso.",
      impact: "high",
      badge: "#3 retorno",
    },
    {
      rank: 4,
      title: "Unifor nasce (R$ 15 fat)",
      detail: "Primeiros tickets Unifor (ter/qua). Volume ainda pequeno, mas abre canal novo.",
      impact: "low",
      badge: "#4 canal",
    },
    {
      rank: 5,
      title: "Sábado 08/08 extra (R$ 35 · R$ 20 lucro)",
      detail:
        "Operação extra no fim de semana (7 un. Henrique). Soma no total da semana; não é dia útil padrão.",
      impact: "low",
      badge: "#5 sábado",
    },
  ],
  actions: [
    {
      title: "Não bancar sozinho compra ≥ 15 un.",
      why: "Qua/qui 100% own = lucro de R$ 17–27",
      measure: "Own ≤ R$ 40 quando compra ≥ 15 un.",
    },
    {
      title: "Tratar sexta 100% família como bônus",
      why: "07/08 não é baseline",
      measure: "Comparar semanas sem esses dias",
    },
    {
      title: "Proteger Acal no meio da semana",
      why: "Qua/qui fracos puxam a média",
      measure: "Fat Acal ≥ R$ 70 qua e qui",
    },
  ],
  nextGoals: "Lucro ≥ R$ 300 sem dia 100% família · own ≤ R$ 180 · perdas ≤ 2 · fat Acal ≥ R$ 400",
  fairReading:
    "No placar bruto empatou com a melhor semana de julho. Na leitura justa (sem sexta grátis), foi pior — e o vilão é own alto em dia fraco. Essa semana vira o antimodelo que os Retratos de 10–14 e 17–21 vão cobrar.",
  metricsSnapshot: {
    current: {
      label: "03–08/08 (atual)",
      start: "2026-08-03",
      end: "2026-08-08",
      revenue: 495,
      diaryProfit: 299.5,
      unitsSold: 99,
      unitsLost: 2,
      ownCapital: 200.5,
      familyCapital: 143.5,
      purchaseInvestment: 344,
    },
    previous: {
      label: "27–31/07 (anterior)",
      start: "2026-07-27",
      end: "2026-07-31",
      revenue: 450,
      diaryProfit: 294,
      unitsSold: 91,
      unitsLost: 2,
      ownCapital: 156,
      familyCapital: 148,
      purchaseInvestment: 304,
    },
    pills: [
      { label: "Lucro +R$ 5,50", tone: "neutral" },
      { label: "Sex 07 = R$ 120 grátis", tone: "warning" },
      { label: "Own +R$ 44,50", tone: "danger" },
    ],
    chartTitleProfit: "Lucro dia a dia (seg–sex)",
    dailyProfitNote: "Sex 07/08 = R$ 120 com custo zerado · sábado 08 à parte (+R$ 20)",
    dailyProfitCompare: [
      { label: "Seg", previous: 108, current: 55 },
      { label: "Ter", previous: 34, current: 60 },
      { label: "Qua", previous: 49.5, current: 17.5 },
      { label: "Qui", previous: 55, current: 27 },
      { label: "Sex", previous: 47.5, current: 120 },
    ],
    chartTitleAcal: "Faturamento Acal",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 75, current: 55 },
      { label: "Ter", previous: 60, current: 80 },
      { label: "Qua", previous: 75, current: 65 },
      { label: "Qui", previous: 70, current: 90 },
      { label: "Sex", previous: 75, current: 100 },
    ],
    channels: [
      { name: "Acal", previousRevenue: 355, currentRevenue: 390, previousProfit: 232.05, currentProfit: 234.09 },
      { name: "Henrique", previousRevenue: 105, currentRevenue: 95, previousProfit: 40.5, currentProfit: 66.02 },
      { name: "Unifor", previousRevenue: 0, currentRevenue: 15, previousProfit: 0, currentProfit: 7.98 },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "91", current: "99", delta: "+8" },
      { metric: "Un. perdidas", previous: "2", current: "2", delta: "0" },
      { metric: "Invest. compra", previous: "R$ 304,00", current: "R$ 344,00", delta: "+R$ 40" },
      { metric: "Capital próprio", previous: "R$ 156,00", current: "R$ 200,50", delta: "+R$ 44,50" },
    ],
    footerNote: "Inclui sábado 08/08 Salgados. Lucro = diary · canais = sales.department.",
  },
};

/** Mês julho/2026 — primeiro mês fechado. */
const M_2026_07: Review = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "monthly",
  periodKey: "2026-07",
  rangeStart: "2026-07-01",
  rangeEnd: "2026-07-31",
  status: "published",
  title: "Retrato de julho/2026 — Salgados",
  headline: "Primeiro mês fechado: R$ 950 fat · R$ 620 lucro · 191 un. — operação nasceu e acelerou",
  summary:
    "Julho homologado (12 dias com diário, 16–31): R$ 950 faturamento · R$ 620 lucro operacional · 191 un. · 3 perdas. Capital próprio R$ 233,50 vs família R$ 422,50. A semana 27–31 foi o auge (R$ 294). Abertura 16–17 ainda 100% família.",
  causes: [
    {
      rank: 1,
      title: "Aceleração semana a semana",
      detail:
        "Abertura R$ 105 → semana cheia R$ 395 → melhor semana R$ 450. Lucro 105 → 221 → 294. O mês é uma rampa, não um platô.",
      impact: "critical",
      badge: "#1 trajetória",
    },
    {
      rank: 2,
      title: "Família bancou mais que o próprio (R$ 422 vs R$ 233)",
      detail:
        "64% do investimento do mês veio de família/Henrique. Lucro alto no começo reflete isso. À medida que own sobe, a margem ‘mágica’ some — e isso é saudável.",
      impact: "high",
      badge: "#2 capital",
    },
    {
      rank: 3,
      title: "Acal é o motor (sem Unifor ainda)",
      detail:
        "Unifor só aparece em agosto. Em julho o jogo é Acal + Henrique. Concentração = risco se Acal esfriar.",
      impact: "medium",
      badge: "#3 canal",
    },
    {
      rank: 4,
      title: "Perdas baixas (3 un. no mês)",
      detail: "Bom controle para o estágio. Não relaxar quando o volume passar de 25 un./dia.",
      impact: "low",
      badge: "#4 perdas",
    },
  ],
  actions: [
    {
      title: "Meta agosto: lucro ≥ R$ 1.200 (≈ R$ 300/semana × 4)",
      why: "Julho já mostrou R$ 294 numa semana",
      measure: "Soma dos diários ≥ R$ 1.200",
    },
    {
      title: "Subir own com split inteligente",
      why: "Não repetir qua/qui 100% próprio de agosto",
      measure: "Own mensal entre R$ 600–800 com retorno ≥ 1,5×",
    },
    {
      title: "Abrir Unifor com disciplina",
      why: "Canal novo em ago — não deixar virar distração",
      measure: "Unifor ≥ R$ 50/semana sem derrubar Acal",
    },
  ],
  nextGoals: "Agosto: lucro ≥ R$ 1.200 · fat ≥ R$ 1.800 · perdas ≤ 8 · own retorno ≥ 1,5×",
  fairReading:
    "Julho é o mês de nascimento da operação no sistema. O número que importa não é só R$ 620 — é a prova de que uma semana de R$ 294 é repetível. Agosto vai testar se o ritmo aguenta own maior e Unifor no mix.",
  metricsSnapshot: {
    current: {
      label: "Julho/2026",
      start: "2026-07-16",
      end: "2026-07-31",
      revenue: 950,
      diaryProfit: 620,
      unitsSold: 191,
      unitsLost: 3,
      ownCapital: 233.5,
      familyCapital: 422.5,
      purchaseInvestment: 656,
    },
    previous: {
      label: "Pré-julho (sem baseline)",
      start: "2026-06-01",
      end: "2026-06-30",
      revenue: 0,
      diaryProfit: 0,
      unitsSold: 0,
      unitsLost: 0,
      ownCapital: 0,
      familyCapital: 0,
      purchaseInvestment: 0,
    },
    pills: [
      { label: "R$ 620 lucro", tone: "success" },
      { label: "12 dias operados", tone: "neutral" },
      { label: "Melhor sem. R$ 294", tone: "success" },
    ],
    chartTitleProfit: "Lucro por semana cheia",
    dailyProfitNote: "Abertura 16–17 · sem. 20–24 · sem. 27–31 (valores de lucro semanal)",
    dailyProfitCompare: [
      { label: "Aber.", previous: 0, current: 105 },
      { label: "20–24", previous: 0, current: 221 },
      { label: "27–31", previous: 0, current: 294 },
    ],
    chartTitleAcal: "Faturamento por bloco",
    dailyAcalRevenueCompare: [
      { label: "Aber.", previous: 0, current: 105 },
      { label: "20–24", previous: 0, current: 395 },
      { label: "27–31", previous: 0, current: 450 },
    ],
    channels: [
      { name: "Acal (aprox.)", previousRevenue: 0, currentRevenue: 765, previousProfit: 0, currentProfit: 497 },
      { name: "Henrique (aprox.)", previousRevenue: 0, currentRevenue: 175, previousProfit: 0, currentProfit: 67.5 },
      { name: "Unifor", previousRevenue: 0, currentRevenue: 0, previousProfit: 0, currentProfit: 0 },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "—", current: "191", delta: "1º mês" },
      { metric: "Un. perdidas", previous: "—", current: "3", delta: "—" },
      { metric: "Invest. compra", previous: "—", current: "R$ 656,00", delta: "—" },
      { metric: "Dias com diário", previous: "—", current: "12", delta: "—" },
    ],
    footerNote: "Julho = dias com diary 16–31. Sem baseline de junho.",
  },
};

const ALL: Review[] = [W_0713, W_0720, W_0727, W_0803, M_2026_07];

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.log("Dry-run. Defina CONFIRM_RETRATO=1 para gravar.");
    for (const r of ALL) {
      console.log(`- ${r.periodType} ${r.periodKey}: ${r.headline.slice(0, 70)}…`);
    }
    return;
  }
  for (const r of ALL) {
    const saved = await upsertPeriodReview(r);
    console.log("OK", saved.periodType, saved.periodKey, saved.id);
  }
  console.log(`✅ ${ALL.length} Retratos publicados`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
