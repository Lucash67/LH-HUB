/**
 * Upsert Retrato semanal 31/08–04/09 × 24–28/08 — Salgados.
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-review-3108-0409.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

/**
 * Semana Mon 31/08 – Fri 04/09 (periodKey = segunda).
 * Lucro op R$ 330 · cofrinho R$ 347 (+R$ 17 bônus 03/09).
 * Anterior 24–28: R$ 295 limpa.
 */
const WEEK: PeriodReviewUpsert & { businessId: string } = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "weekly",
  periodKey: "2026-08-31",
  rangeStart: "2026-08-31",
  rangeEnd: "2026-09-06",
  status: "published",
  title: "Semana atual vs anterior — Salgados",
  headline:
    "Lucro op R$ 330 (cofrinho R$ 347) — passou a anterior, mas quinta 100% família e sexta só Henrique distorcem",
  summary:
    "A semana 31/08–04/09 lucrou R$ 330 operacional (R$ 347 no cofrinho com bônus R$ 17) vs R$ 295 da 24–28. Fat caiu (R$ 465 vs R$ 540) e volume também (91 vs 108 un.) — sexta 04/09 foi só Henrique (7 un · R$ 35), sem Acal/Unifor. A quinta 03/09 (100% família → lucro op R$ 110 + bônus R$ 17) infla o placar: sem ela, a semana ficaria ~R$ 220. Own despencou (R$ 240 → R$ 125); família subiu (R$ 138 → R$ 197). Perdas 4 (3 no 31 + 1 no 02). Fiados abertos: Anderson, Rodrigues, Ana Laura (R$ 5 cada).",
  causes: [
    {
      rank: 1,
      badge: "#1 placar",
      title: "Quinta 03/09 100% família infla o lucro (~R$ 110)",
      detail:
        "Estoque do dia todo em terceiros (R$ 77) → lucro op ≈ fat R$ 110, mais bônus Henrique R$ 17 (cofrinho R$ 127). Sem essa quinta, a semana cairia para ~R$ 220 op — abaixo da 24–28 limpa (R$ 295). Trate o R$ 330 como placar bruto, não como ritmo repetível.",
      impact: "critical",
    },
    {
      rank: 2,
      badge: "#2 sexta curta",
      title: "04/09 só Henrique (7 un · R$ 35) — sem Acal",
      detail:
        "Lucas não foi à Acal/Unifor. Um dia a menos de canal forte puxa fat (−R$ 75 vs uma sexta típica ~R$ 100–110) e unidades (91 vs 108). É exceção de calendário, não quebra estrutural — mas a semana “cheia” de 5 dias Acal não aconteceu.",
      impact: "high",
    },
    {
      rank: 3,
      badge: "#3 capital",
      title: "Own caiu forte (R$ 240 → R$ 125) — split a favor do bolso",
      detail:
        "Família R$ 138 → R$ 197. Dias 03 e 04 com own R$ 0. Meta anterior era own ≤ R$ 200 — desta vez você ficou folgado no próprio. Retorno por real seu sobe, mas depende de capital família disponível.",
      impact: "high",
    },
    {
      rank: 4,
      badge: "#4 perdas + fiados",
      title: "4 perdas · 3 fiados abertos (R$ 15)",
      detail:
        "31/08: 3 un. da sobra (não vendeu). 02/09: 1 NN. Fiados: Anderson das Chagas R$5 (24/08) · Jose Maclaurem Rodrigues R$5 (31/08) · Ana Laura R$5 (02/09, não quitou em 04/09). Meta da 24–28 era 0 perda e quitar Ismael (agora Anderson).",
      impact: "medium",
    },
    {
      rank: 5,
      badge: "#5 ritmo",
      title: "Ter/qua estáveis em R$ 60 · seg 31 em R$ 65 (após ajuste)",
      detail:
        "Seg 65 (rec + quit. NN do 31) · Ter 60 · Qua 60 · Qui 110 · Sex 35. O miolo da semana (ter–qua) repetiu a baseline da 24–28. O extremo (qui “grátis” + sex curta) define o placar.",
      impact: "medium",
    },
  ],
  actions: [
    {
      title: "Quitar Anderson · Rodrigues · Ana Laura (R$ 15)",
      why: "Três fiados abertos seguram caixa e poluem a leitura",
      measure: "Cobrar e lançar quitação no dia original de cada um",
    },
    {
      title: "Não comparar próxima semana ao R$ 330 bruto",
      why: "Sem a quinta 100% família o ritmo foi ~R$ 220–280",
      measure: "Régua: lucro limpo ≥ R$ 300 em 5 dias com Acal",
    },
    {
      title: "Manter own semanal ≤ R$ 200 (já ok nesta)",
      why: "Ficou R$ 125 — bom; não voltar aos R$ 240 da 24–28",
      measure: "Own ≤ R$ 40–45/dia em compras ~22 un.",
    },
    {
      title: "Segurar perdas ≤ 2",
      why: "4 un. (3+1) vs 0 da semana anterior",
      measure: "Contar sobra no fim do dia · NN = perda explícita",
    },
    {
      title: "Recuperar sexta com Acal quando operar",
      why: "04/09 sem Acal tirou ~R$ 70–80 de fat",
      measure: "Sexta ≥ 20 un. / fat ≥ R$ 100 quando for à Acal",
    },
  ],
  nextGoals:
    "Lucro limpo ≥ R$ 300 (sem dia 100% família) · own ≤ R$ 200 · perdas ≤ 2 · quitar 3 fiados · fat Acal ≥ R$ 350 na semana",
  fairReading:
    "No placar bruto esta semana ganhou da 24–28 (330 vs 295; cofrinho 347). Na leitura justa, a quinta “grátis” e a sexta só-Henrique explicam quase tudo: tire a quinta e sobra ~R$ 220 — aí a 24–28 limpa ainda é a melhor régua. O que melhorou de verdade foi o split (menos own) e o bônus de R$ 17. O que piorou: perdas (4) e fiados acumulados (R$ 15). Próxima semana cheia de Acal, com own controlado e quitação dos três, deve mirar R$ 300 limpos de novo.",
  metricsSnapshot: {
    current: {
      label: "31/08–04/09 (atual)",
      start: "2026-08-31",
      end: "2026-09-04",
      revenue: 465,
      diaryProfit: 330,
      unitsSold: 91,
      unitsLost: 4,
      ownCapital: 125,
      familyCapital: 197,
      purchaseInvestment: 322,
    },
    previous: {
      label: "24–28/08 (anterior)",
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
    pills: [
      { tone: "success", label: "Lucro op +R$ 35 vs ant." },
      { tone: "warning", label: "Qui 03 = 100% família" },
      { tone: "warning", label: "Sex só Henrique" },
      { tone: "success", label: "Own R$ 125 (−R$ 115)" },
      { tone: "danger", label: "4 perdas · 3 fiados" },
    ],
    dailyProfitCompare: [
      { label: "Seg", previous: 55, current: 65 },
      { label: "Ter", previous: 60, current: 60 },
      { label: "Qua", previous: 60, current: 60 },
      { label: "Qui", previous: 60, current: 110 },
      { label: "Sex", previous: 60, current: 35 },
    ],
    dailyProfitNote:
      "Qui 03 = R$ 110 op (+ R$ 17 bônus → cofrinho R$ 127). Sex 04 = R$ 35 só Henrique. Cofrinho da semana = R$ 347.",
    dailyAcalRevenueCompare: [
      { label: "Seg", previous: 80, current: 75 },
      { label: "Ter", previous: 85, current: 75 },
      { label: "Qua", previous: 85, current: 70 },
      { label: "Qui", previous: 85, current: 80 },
      { label: "Sex", previous: 80, current: 0 },
    ],
    dailyAcalNote: "Acal da semana ~R$ 300 (sem sexta). Anterior ~R$ 415 com 5 dias.",
    channels: [
      {
        name: "Acal",
        previousRevenue: 415,
        currentRevenue: 300,
        previousProfit: 226.5,
        currentProfit: 0,
      },
      {
        name: "Henrique",
        previousRevenue: 125,
        currentRevenue: 140,
        previousProfit: 68.5,
        currentProfit: 0,
      },
      {
        name: "Unifor",
        previousRevenue: 0,
        currentRevenue: 15,
        previousProfit: 0,
        currentProfit: 0,
      },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "108", current: "91", delta: "−17" },
      { metric: "Un. perdidas", previous: "0", current: "4", delta: "+4" },
      { metric: "Invest. compra", previous: "R$ 378,00", current: "R$ 322,00", delta: "−R$ 56" },
      { metric: "Capital próprio", previous: "R$ 240,00", current: "R$ 125,00", delta: "−R$ 115" },
      { metric: "Cofrinho (op+bônus)", previous: "R$ 295", current: "R$ 347", delta: "+R$ 52" },
    ],
    chartTitleProfit: "Lucro dia a dia (operacional)",
    chartTitleAcal: "Faturamento Acal",
    footerNote:
      "Semana = 31/08–04/09 (periodKey 2026-08-31). Lucro snapshot = operacional R$ 330; cofrinho R$ 347 (+R$ 17 bônus 03/09). Fiados abertos: Anderson · Rodrigues · Ana Laura (R$5 cada).",
  },
};

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.log("Dry-run. Defina CONFIRM_RETRATO=1 para gravar.");
    console.log(
      JSON.stringify(
        {
          periodKey: WEEK.periodKey,
          headline: WEEK.headline,
          lucro: WEEK.metricsSnapshot.current.diaryProfit,
          fat: WEEK.metricsSnapshot.current.revenue,
        },
        null,
        2,
      ),
    );
    return;
  }
  const row = await upsertPeriodReview(WEEK);
  console.log(`✅ Retrato publicado: ${row.periodType} ${row.periodKey} · ${row.status} · id ${row.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
