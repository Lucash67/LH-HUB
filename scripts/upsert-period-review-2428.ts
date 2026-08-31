/**
 * Upsert Retrato semanal 24–28/08 × 17–21/08 — Salgados.
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-review-2428.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

const WEEK_2428: PeriodReviewUpsert & { businessId: string } = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-08-24",
  rangeStart: "2026-08-24",
  rangeEnd: "2026-08-30",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline:
    "Semana estável (R$ 295) — sem dia “grátis”, sem perda, mas abaixo da anterior inflada (R$ 350,50)",
  summary:
    "A semana 24–28 lucrou R$ 295 vs R$ 350,50 da 17–21, com faturamento quase igual (R$ 540 vs R$ 537,50) e zero perdas. A queda de lucro vs a anterior é em grande parte a ausência da qua 19/08 (100% família → ~R$ 118,50): sem ela, a 17–21 teria ~R$ 232 — e a 24–28 ganharia. Ritmo limpo: Seg 55 · Ter–Qui 60 · Sex 60. Segunda fechou 55 (não 60) por causa do fiado Ismael R$5 ainda aberto.",
  causes: [
    {
      rank: 1,
      badge: "#1 comparação justa",
      title: "Anterior foi inflada pela qua 19/08 (~R$ 118,50)",
      detail:
        "Na 17–21 o estoque da quarta foi 100% família → lucro ≈ fat R$ 118,50. Sem esse dia, o lucro anterior cairia para ~R$ 232. A 24–28 (R$ 295) seria a semana mais forte em lucro “limpo”. Não trate a queda bruta 350→295 como piora estrutural.",
      impact: "critical",
    },
    {
      rank: 2,
      badge: "#2 estabilidade",
      title: "Ritmo limpo: 5 dias entre R$ 55 e R$ 60 · 0 perdas",
      detail:
        "Nenhum dia 100% família, nenhuma terça-colapso (18/08 tinha sido R$ 28). Inventário fechou 108/108. Essa é a operação “repetível” — a régua certa para a próxima semana.",
      impact: "high",
    },
    {
      rank: 3,
      badge: "#3 caixa do operador",
      title: "Capital próprio subiu (R$ 180,50 → R$ 240)",
      detail:
        "Meta da semana passada era own ≤ R$ 200. Você ficou em R$ 240 (4× R$ 50 + sex R$ 40). Família caiu R$ 211,50 → R$ 138. Retorno por real seu ficou menor que na 17–21 — split ainda ajuda, mas apertou vs a meta.",
      impact: "high",
    },
    {
      rank: 4,
      badge: "#4 segunda 24/08",
      title: "Lucro 55 (não 60): Ismael R$5 ainda pendente",
      detail:
        "Compra R$ 77 · próprio R$ 50 · fat total R$ 110 · recebido R$ 105. O fiado do Ismael (ex-“perda” reclassificada) segura R$ 5 do resultado. Quando quitar, o 24/08 sobe para lucro R$ 60 no bolso (faturamento do dia já está no diário).",
      impact: "medium",
    },
    {
      rank: 5,
      badge: "#5 volume",
      title: "Volume estável (−1 un. · fat +R$ 2,50)",
      detail:
        "109 → 108 un. · fat R$ 537,50 → R$ 540. Acal ~R$ 415 na semana (forte vs meta antiga R$ 400). Sexta 28 com 20 un. / fat R$ 100 — único dia abaixo de 22.",
      impact: "low",
    },
  ],
  actions: [
    {
      title: "Quitar Ismael (R$5 do 24/08)",
      why: "Único fiado aberto da semana — destrava o 55→60",
      measure: "Cobrar e lançar quitação no 24 (como Mikely/Ana Laura)",
    },
    {
      title: "Segurar own semanal ≤ R$ 200",
      why: "Ficou R$ 240 — acima da meta da semana anterior",
      measure: "Own ≤ R$ 40–45/dia quando compra ~22 un.",
    },
    {
      title: "Manter zero perda",
      why: "0 perdas foi o melhor da comparação",
      measure: "Contar sobra antes de sair · não fechar “sumiu” sem checar fiado",
    },
    {
      title: "Usar 24–28 como baseline limpa",
      why: "Sem dia 100% família — régua honesta",
      measure: "Comparar próximas semanas a ~R$ 295 / ~R$ 55–60/dia",
    },
    {
      title: "Manter Acal ≥ R$ 80/dia",
      why: "Semana ficou ~R$ 415 Acal (boa)",
      measure: "≥ 16 un. Acal/dia nos dias fracos",
    },
  ],
  nextGoals:
    "Lucro limpo ≥ R$ 300 · own ≤ R$ 200 · perdas 0 · quitar Ismael · fat Acal ≥ R$ 400",
  fairReading:
    "No placar bruto, a 24–28 lucrou menos que a 17–21. Na leitura justa (sem a quarta 100% família), esta semana foi melhor e mais saudável: lucro estável, zero perda, Acal firme. O ponto de atenção é o bolso — você colocou mais capital próprio (R$ 240) e ainda tem R$ 5 do Ismael em aberto. Conserta split + quitação e a próxima semana pode passar dos R$ 300 limpos.",
  metricsSnapshot: {
    current: {
      label: "24–28/08 (atual)",
      start: "2026-08-24",
      end: "2026-08-28",
      revenue: 540,
      diaryProfit: 295,
      unitsSold: 108,
      unitsLost: 0,
      ownCapital: 240,
      familyCapital: 138,
      purchaseInvestment: 378,
    },
    previous: {
      label: "17–21/08 (anterior)",
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
    pills: [
      { tone: "warning", label: "Lucro −R$ 55,50 (bruto)" },
      { tone: "success", label: "0 perdas" },
      { tone: "success", label: "Ritmo R$ 55–60/dia" },
      { tone: "neutral", label: "Sem qua “grátis” 19/08" },
    ],
    dailyProfitCompare: [
      { label: "Seg", previous: 60, current: 55 },
      { label: "Ter", previous: 28, current: 60 },
      { label: "Qua", previous: 118.5, current: 60 },
      { label: "Qui", previous: 84, current: 60 },
      { label: "Sex", previous: 65, current: 60 },
    ],
    dailyProfitNote:
      "Seg 24 = R$ 55 com Ismael R$5 pendente (seria R$ 60 se quitado). Anterior tem qua 19 = R$ 118,50 (100% família).",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 60, current: 80 },
      { label: "Ter", previous: 75, current: 85 },
      { label: "Qua", previous: 58.5, current: 85 },
      { label: "Qui", previous: 95, current: 85 },
      { label: "Sex", previous: 75, current: 80 },
    ],
    dailyAcalNote: "Acal da 24–28 ~R$ 415 na semana — acima da meta R$ 400 da semana anterior.",
    channels: [
      {
        name: "Acal",
        previousRevenue: 363.5,
        currentRevenue: 415,
        previousProfit: 234.7,
        currentProfit: 226.5,
      },
      {
        name: "Henrique",
        previousRevenue: 150,
        currentRevenue: 125,
        previousProfit: 98.34,
        currentProfit: 68.5,
      },
      {
        name: "Unifor",
        previousRevenue: 30,
        currentRevenue: 0,
        previousProfit: 30,
        currentProfit: 0,
      },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "109", current: "108", delta: "−1" },
      { metric: "Un. perdidas", previous: "3", current: "0", delta: "−3" },
      { metric: "Invest. compra", previous: "R$ 392,00", current: "R$ 378,00", delta: "−R$ 14" },
      { metric: "Capital próprio", previous: "R$ 180,50", current: "R$ 240,00", delta: "+R$ 59,50" },
    ],
    chartTitleProfit: "Lucro dia a dia",
    chartTitleAcal: "Faturamento Acal",
    footerNote:
      "Semana atual = 24–28/08. Lucro = diary operational_profit (+ bônus se houver). Seg 24: pend. Ismael R$5. Comparação justa: sem qua 19/08 a anterior seria ~R$ 232.",
  },
};

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.error("Defina CONFIRM_RETRATO=1 para publicar.");
    process.exit(1);
  }
  const row = await upsertPeriodReview(WEEK_2428);
  console.log(`✅ Retrato publicado: ${row.periodType} ${row.periodKey} · ${row.status} · id ${row.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
