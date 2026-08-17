/**
 * Upsert Retrato (period_review) — uso pelo agente após análise no chat.
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-review.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

/** Retrato 10–14/08 × 03–09/08 — espelho do canvas semana-vs-anterior-salgados. */
const WEEK_1014: PeriodReviewUpsert & { businessId: string } = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-08-10",
  rangeStart: "2026-08-10",
  rangeEnd: "2026-08-16",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline: "Faturou mais, lucrou um pouco menos — e o bolso próprio bancou o volume",
  summary:
    "A semana atual faturou mais (R$ 600 vs R$ 500), mas o lucro operacional caiu um pouco (R$ 291 vs R$ 299,50) porque a Acal enfraqueceu, o seu capital próprio subiu ~54% e a semana anterior foi inflada pela sexta 07/08 (estoque 100% Henrique → lucro ≈ faturamento).",
  causes: [
    {
      rank: 1,
      title: "Acal vendeu menos lucro (−R$ 37,71)",
      detail:
        "Fat. Acal caiu de R$ 390 para R$ 370 (−R$ 20). Lucro do canal caiu de R$ 234 para R$ 196. Menos tickets (75 → 63 vendas). Terça e quarta da semana atual ficaram em R$ 60 de faturamento Acal — abaixo do padrão da semana boa (R$ 80–100).",
      impact: "critical",
      badge: "#1 impacto",
    },
    {
      rank: 2,
      title: "Sexta 07/08 inflou a semana anterior (~R$ 120)",
      detail:
        "Na sexta anterior o estoque foi 100% capital Henrique (R$ 84). As 23 vendas entraram com custo R$ 0 → lucro = faturamento (R$ 120). Sem essa sexta, o lucro da semana anterior seria ~R$ 179,50 — aí a semana atual (R$ 291) teria sido melhor, não pior. A sensação de “semana boa” veio muito desse dia atípico.",
      impact: "high",
      badge: "#2 distorce comparação",
    },
    {
      rank: 3,
      title: "Você bancou bem mais o estoque (+R$ 108,50 próprio)",
      detail:
        "Capital próprio: R$ 200,50 → R$ 309. Família/Henrique: R$ 143,50 → R$ 96. Resultado: mesmo com fat maior, cada real seu rendeu menos (retorno 1,49× → 0,94×). Dias 10 e 12 com compra de 30 un. / R$ 87 só no seu bolso apertaram a margem do dia.",
      impact: "high",
      badge: "#3 caixa do operador",
    },
    {
      rank: 4,
      title: "Perdas triplicaram (2 → 6 un.)",
      detail:
        "Semana atual: perdas em 11, 12, 13 e 14/08. Cada unidade perdida queima custo sem receita — em volume alto (120 un. vendidas) o desperdício pesa mais no lucro do que na semana anterior.",
      impact: "medium",
      badge: "#4",
    },
    {
      rank: 5,
      title: "Mix deslocou para Henrique/Unifor",
      detail:
        "Henrique + Unifor subiram o faturamento (R$ 110 → R$ 230), mas não compensaram a queda de lucro na Acal. Ex.: 12/08 metade do dia foi cota Henrique (R$ 60 fat / R$ 25 lucro) enquanto Acal também ficou em R$ 60 — volume sem o mesmo retorno do melhor mix Acal.",
      impact: "medium",
      badge: "#5",
    },
  ],
  actions: [
    {
      title: "Recuperar Acal (prioridade)",
      why: "É o canal que mais perdeu lucro (−R$ 38)",
      measure: "≥ 14–16 vendas Acal/dia · meta R$ 80 fat Acal/dia",
    },
    {
      title: "Dividir compra grande com Henrique",
      why: "Dias de 30 un. no seu bolso matam o retorno",
      measure: "Own capital/dia ≤ R$ 50 quando compra ≥ 25 un.",
    },
    {
      title: "Cortar perda",
      why: "6 un. perdidas ≈ custo queimado sem venda",
      measure: "Checklist fim do dia: contar sobra antes de sair",
    },
    {
      title: "Não confundir fat com lucro",
      why: "Semana atual faturou +20% e lucro caiu",
      measure: "Olhar lucro do diário + capital próprio, não só fat",
    },
    {
      title: "Tratar sexta ‘grátis’ como bônus",
      why: "07/08 não é baseline — é exceção",
      measure: "Comparar semanas sem dias 100% família",
    },
  ],
  nextGoals:
    "Lucro operacional ≥ R$ 300 · capital próprio ≤ R$ 220 · perdas ≤ 2 un. · fat Acal ≥ R$ 400",
  fairReading:
    "Se tirarmos a sexta 07/08 da conta, a semana atual foi a mais forte em lucro consistente (todos os dias entre R$ 53 e R$ 65). O problema real não é “a operação quebrou” — é Acal mais fraca no meio da semana + mais dinheiro seu no estoque + mais perda. Conserta esses três e a semana volta (ou passa) a anterior.",
  metricsSnapshot: {
    current: {
      label: "10–14/08 (atual)",
      start: "2026-08-10",
      end: "2026-08-14",
      revenue: 600,
      diaryProfit: 291,
      unitsSold: 120,
      unitsLost: 6,
      ownCapital: 309,
      familyCapital: 96,
      purchaseInvestment: 405,
    },
    previous: {
      label: "03–09/08 (anterior)",
      start: "2026-08-03",
      end: "2026-08-09",
      revenue: 500,
      diaryProfit: 299.5,
      unitsSold: 99,
      unitsLost: 2,
      ownCapital: 200.5,
      familyCapital: 143.5,
      purchaseInvestment: 344,
    },
    pills: [
      { label: "Lucro −R$ 8,50", tone: "warning" },
      { label: "Acal −R$ 37,71", tone: "danger" },
      { label: "Capital próprio +R$ 108,50", tone: "neutral" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    dailyProfitNote:
      "Diário operacional · sex 07/08 = R$ 120 com custo de venda zerado (compra paga pelo Henrique)",
    dailyProfitCompare: [
      { label: "Seg", previous: 55, current: 63 },
      { label: "Ter", previous: 60, current: 65 },
      { label: "Qua", previous: 17.5, current: 53 },
      { label: "Qui", previous: 27, current: 55 },
      { label: "Sex", previous: 120, current: 55 },
    ],
    chartTitleAcal: "Faturamento Acal (o canal que mais dói)",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 55, current: 100 },
      { label: "Ter", previous: 80, current: 60 },
      { label: "Qua", previous: 65, current: 60 },
      { label: "Qui", previous: 90, current: 70 },
      { label: "Sex", previous: 100, current: 80 },
    ],
    channels: [
      {
        name: "Acal",
        previousRevenue: 390,
        currentRevenue: 370,
        previousProfit: 234.09,
        currentProfit: 196.38,
      },
      {
        name: "Henrique",
        previousRevenue: 95,
        currentRevenue: 165,
        previousProfit: 66.02,
        currentProfit: 82.85,
      },
      {
        name: "Unifor",
        previousRevenue: 15,
        currentRevenue: 65,
        previousProfit: 7.98,
        currentProfit: 33.33,
      },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "99", current: "120", delta: "+21" },
      { metric: "Un. perdidas", previous: "2", current: "6", delta: "+4" },
      { metric: "Invest. compra", previous: "R$ 344,00", current: "R$ 405,00", delta: "+R$ 61" },
      {
        metric: "Capital Henrique",
        previous: "R$ 143,50",
        current: "R$ 96,00",
        delta: "−R$ 47,50",
      },
    ],
    footerNote:
      "Semana atual = última semana útil fechada (10–14/08). Lucro usado = diary operational_profit; canais = sales.department.",
  },
};

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.log("Dry-run. Defina CONFIRM_RETRATO=1 para gravar.");
    console.log(JSON.stringify({ periodKey: WEEK_1014.periodKey, title: WEEK_1014.title }, null, 2));
    return;
  }
  const review = await upsertPeriodReview(WEEK_1014);
  console.log("OK Retrato publicado:", review.id, review.periodKey, review.title);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
