/**
 * Upsert Retrato (period_review) — uso pelo agente após análise no chat.
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-review.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

/** Retrato 17–21/08 × 10–14/08 — espelho do canvas semana-17-21-vs-anterior-salgados. */
const WEEK_1721: PeriodReviewUpsert & { businessId: string } = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-08-17",
  rangeStart: "2026-08-17",
  rangeEnd: "2026-08-23",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline:
    "Lucrou mais com menos fat e menos capital próprio — mas a qua 19/08 (100% família) infla o placar",
  summary:
    "A semana 17–21 lucrou R$ 350,50 vs R$ 296 da 10–14, com faturamento menor (R$ 537,50 vs R$ 600) e capital próprio quase pela metade (R$ 180,50 vs R$ 309). A melhora estrutural é o split com a família; a quarta 19/08 (estoque 100% família → lucro ≈ fat R$ 118,50) distorce a comparação — sem ela o lucro seria ~R$ 232.",
  causes: [
    {
      rank: 1,
      title: "Quarta 19/08 inflou o lucro (~R$ 118,50)",
      detail:
        "Estoque 100% capital família (R$ 87,50). Lucro do diário = faturamento (R$ 118,50). Sem essa quarta, o lucro da semana atual seria ~R$ 232 — abaixo dos R$ 296 da anterior. Mesmo tipo de dia “grátis” da sexta 07/08: conta no resultado, não serve de baseline.",
      impact: "critical",
      badge: "#1 distorce comparação",
    },
    {
      rank: 2,
      title: "Você bancou bem menos o estoque (−R$ 128,50 próprio)",
      detail:
        "Capital próprio: R$ 309 → R$ 180,50 (bateu a meta ≤ R$ 220). Família: R$ 96 → R$ 211,50. Retorno por real seu: 0,96× → 1,94×. Essa é a melhora estrutural real — independente da quarta atípica.",
      impact: "high",
      badge: "#2 caixa do operador",
    },
    {
      rank: 3,
      title: "Terça 18/08: R$ 28 de lucro com R$ 77 só no seu bolso",
      detail:
        "Compra 22 un. / R$ 77 100% próprio. Fat. R$ 105 · lucro só R$ 28 · 1 perda. Pior dia da semana e o oposto do que a meta pedia (dividir compra grande).",
      impact: "high",
      badge: "#3 dia fraco",
    },
    {
      rank: 4,
      title: "Faturou e vendeu menos (−R$ 62,50 · −11 un.)",
      detail:
        "120 → 109 un. · fat. R$ 600 → R$ 537,50. Acal quase flat (R$ 370 → R$ 363,50) — ainda abaixo da meta R$ 400. Unifor quase sumiu (R$ 65 → R$ 30).",
      impact: "medium",
      badge: "#4 volume",
    },
    {
      rank: 5,
      title: "Perdas cairam pela metade (6 → 3)",
      detail:
        "Meta era ≤ 2; ficou em 3 — quase. Melhora clara vs. 10–14/08. Continua valendo o checklist de sobra no fim do dia.",
      impact: "low",
      badge: "#5 perdas",
    },
  ],
  actions: [
    {
      title: "Proibir dia 100% próprio em compra ≥ 22 un.",
      why: "Ter 18/08: R$ 77 próprio → lucro R$ 28",
      measure: "Own ≤ R$ 50 quando compra ≥ 22 un.",
    },
    {
      title: "Tratar dia 100% família como bônus",
      why: "Qua 19 infla lucro e distorce a régua",
      measure: "Comparar semanas sem esses dias",
    },
    {
      title: "Empurrar Acal para R$ 80–100/dia",
      why: "Meta R$ 400 ainda não veio (R$ 363,50)",
      measure: "≥ 16 un. Acal/dia nos dias fracos (seg/qua)",
    },
    {
      title: "Manter split com Henrique",
      why: "Own R$ 180,50 foi o melhor movimento da semana",
      measure: "Own semanal ≤ R$ 200",
    },
    {
      title: "Fechar perdas em ≤ 2",
      why: "Já caiu 6 → 3; falta 1",
      measure: "Contar sobra antes de sair",
    },
  ],
  nextGoals:
    "Lucro operacional ≥ R$ 300 sem dia 100% família · capital próprio ≤ R$ 200 · perdas ≤ 2 un. · fat Acal ≥ R$ 400",
  fairReading:
    "No bolso, a semana 17–21 foi melhor: menos dinheiro seu no estoque e retorno ~2× por real investido. No ritmo de venda “limpo” (sem a quarta grátis), o lucro ainda ficou abaixo da 10–14. O jogo agora é repetir o split bom e eliminar o padrão da terça 18 — aí o lucro consistente passa a anterior sem precisar de dia 100% família.",
  metricsSnapshot: {
    current: {
      label: "17–21/08 (atual)",
      start: "2026-08-17",
      end: "2026-08-21",
      revenue: 537.5,
      diaryProfit: 350.5,
      unitsSold: 109,
      unitsLost: 3,
      ownCapital: 180.5,
      familyCapital: 211.5,
      purchaseInvestment: 392,
    },
    previous: {
      label: "10–14/08 (anterior)",
      start: "2026-08-10",
      end: "2026-08-14",
      revenue: 600,
      diaryProfit: 296,
      unitsSold: 120,
      unitsLost: 6,
      ownCapital: 309,
      familyCapital: 96,
      purchaseInvestment: 405,
    },
    pills: [
      { label: "Lucro +R$ 54,50", tone: "success" },
      { label: "Capital próprio −R$ 128,50", tone: "success" },
      { label: "Fat. −R$ 62,50", tone: "warning" },
      { label: "Qua 19/08 = R$ 118,50 “grátis”", tone: "neutral" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    dailyProfitNote:
      "Diário operacional · qua 19/08 = R$ 118,50 com custo de venda zerado (compra 100% família)",
    dailyProfitCompare: [
      { label: "Seg", previous: 63, current: 60 },
      { label: "Ter", previous: 65, current: 28 },
      { label: "Qua", previous: 53, current: 118.5 },
      { label: "Qui", previous: 55, current: 84 },
      { label: "Sex", previous: 60, current: 60 },
    ],
    chartTitleAcal: "Faturamento Acal",
    dailyAcalNote: "Meta da semana passada era ≥ R$ 400 · atual ficou em R$ 363,50",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 100, current: 60 },
      { label: "Ter", previous: 60, current: 75 },
      { label: "Qua", previous: 60, current: 58.5 },
      { label: "Qui", previous: 70, current: 95 },
      { label: "Sex", previous: 80, current: 75 },
    ],
    channels: [
      {
        name: "Acal",
        previousRevenue: 370,
        currentRevenue: 363.5,
        previousProfit: 196.38,
        currentProfit: 234.7,
      },
      {
        name: "Henrique",
        previousRevenue: 165,
        currentRevenue: 150,
        previousProfit: 82.85,
        currentProfit: 98.34,
      },
      {
        name: "Unifor",
        previousRevenue: 65,
        currentRevenue: 30,
        previousProfit: 33.33,
        currentProfit: 30,
      },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "120", current: "109", delta: "−11" },
      { metric: "Un. perdidas", previous: "6", current: "3", delta: "−3" },
      { metric: "Invest. compra", previous: "R$ 405,00", current: "R$ 392,00", delta: "−R$ 13" },
      {
        metric: "Capital família",
        previous: "R$ 96,00",
        current: "R$ 211,50",
        delta: "+R$ 115,50",
      },
    ],
    footerNote:
      "Semana atual = 17–21/08. Lucro = diary operational_profit; canais = sales.department; fat. = revenue_received.",
  },
};

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.log("Dry-run. Defina CONFIRM_RETRATO=1 para gravar.");
    console.log(JSON.stringify({ periodKey: WEEK_1721.periodKey, title: WEEK_1721.title }, null, 2));
    return;
  }
  const review = await upsertPeriodReview(WEEK_1721);
  console.log("OK Retrato publicado:", review.id, review.periodKey, review.title);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
