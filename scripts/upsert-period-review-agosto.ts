/**
 * Upsert Retrato mensal agosto/2026 — Salgados.
 * Cruzamento: realizado × meta canônica × next_goals julho × projeção fechamento Jul→Ago.
 *
 *   CONFIRM_RETRATO=1 pnpm tsx scripts/upsert-period-review-agosto.ts
 */
import "./load-env";
import { upsertPeriodReview } from "../src/platform/db/repositories/period-review-repository";
import type { PeriodReviewUpsert } from "../src/lib/period-reviews/types";
import { SALGADOS_BUSINESS_ID } from "../src/lib/business-units";

/**
 * Números canônicos (diário + narrative.bonusIncome):
 * - 22 dias com diário (incl. sáb 08/08)
 * - Op R$ 1.301 + bônus Henrique R$ 64 = cofrinho R$ 1.365
 * - Seg–sex só: R$ 1.345 (exclui sáb R$ 20 — alinhado ao cofrinho prático)
 * - Metas julho: lucro ≥ 1.200 · fat ≥ 1.800 · perdas ≤ 8 · own ≥ 1,5×
 * - Projeção fechamento Jul→Ago: Cons. ~996 · Real. ~1.265 · Amb. ~1.633
 */
const AGOSTO: PeriodReviewUpsert & { businessId: string } = {
  businessId: SALGADOS_BUSINESS_ID,
  periodType: "monthly",
  periodKey: "2026-08",
  rangeStart: "2026-08-01",
  rangeEnd: "2026-08-31",
  status: "published",
  title: "Retrato de agosto/2026 — Salgados",
  headline:
    "Meta e cenário realista batidos: R$ 2.277 fat · R$ 1.365 lucro (cofrinho) · 456 un. — dobrou julho",
  summary:
    "Agosto homologado (22 dias com diário, 03–31): R$ 2.277,50 faturamento · R$ 1.365 lucro no cofrinho (R$ 1.301 operacional + R$ 64 bônus Henrique em 04–06) · 456 un. · 11 perdas. Capital próprio R$ 970 vs família R$ 626. Bateu a meta canônica (R$ 1.200 / 240 un.) e o next_goals de julho em lucro e fat; ficou curto em perdas (11 > 8) e no retorno próprio (1,41× < 1,5×). Vs projeção Jul→Ago: passou Conservador (~996) e Realista (~1.265); não chegou no Ambicioso (~1.633).",
  causes: [
    {
      rank: 1,
      badge: "#1 placar",
      title: "Dobrou julho e passou o cenário Realista",
      detail:
        "Julho canônico R$ 664 → agosto R$ 1.365 (+R$ 701 / +105%). Fat R$ 950 → R$ 2.277,50. Unidades 191 → 456. O Realista do fechamento (~R$ 1.265) foi o cenário certo como âncora — você fechou ~R$ 100 acima. Ambicioso (~R$ 1.633) pediria ~R$ 74/dia útil sustentado; o ritmo real ficou ~R$ 64/dia útil (cofrinho seg–sex).",
      impact: "critical",
    },
    {
      rank: 2,
      badge: "#2 capital",
      title: "Own passou a família — retorno ainda abaixo de 1,5×",
      detail:
        "Próprio R$ 970 · família R$ 626 (invest. R$ 1.596). Em julho era o inverso (R$ 233 vs R$ 422). Saudável: você bancou o volume. Mas 1.365 / 970 ≈ 1,41× — abaixo da meta 1,5× do Retrato de julho. Split em dias de 30 un. (10 e 12/08 100% próprio) e semanas com own alto (24–28: R$ 240) puxaram o ROI para baixo.",
      impact: "high",
    },
    {
      rank: 3,
      badge: "#3 perdas",
      title: "11 perdas — única meta clara que falhou",
      detail:
        "Meta julho: ≤ 8. Realizado: 11 (concentração na 10–14: 6 un. e na 17–21: 3). Semanas 24–28 e 31 fecharam 0 perda lançada — o padrão bom existe. Atenção: 31/08 sobraram 6 un. no trabalho ainda sem perda lançada (conferir em setembro).",
      impact: "high",
    },
    {
      rank: 4,
      badge: "#4 ritmo",
      title: "Quatro semanas cheias + dia 31 — platô ~R$ 295–355",
      detail:
        "Blocos cofrinho: 03–08 R$ 363,50 (incl. sáb 20 + bônus 64) · 10–14 R$ 296 · 17–21 R$ 355,50 · 24–28 R$ 295 · 31 R$ 55. Semanas “sujas” (07 e 19 100% família) inflaram picos; a régua limpa é ~R$ 295–300/semana. Segunda 24 e segunda 31 fecharam 55 por fiado R$ 5 (Ismael + Rodrigues).",
      impact: "medium",
    },
    {
      rank: 5,
      badge: "#5 canais",
      title: "Acal motor · Henrique volume · Unifor ainda fino",
      detail:
        "Fat aprox. vendas: Acal ~R$ 1.613 · Colegas Henrique R$ 560 · Unifor R$ 110. Unifor abriu o mês mas não virou perna forte. Concentração em Acal continua — risco se o canal esfriar, oportunidade se recuperar o padrão R$ 80+/dia.",
      impact: "medium",
    },
  ],
  actions: [
    {
      title: "Quitar fiados abertos (Ismael 24 + Rodrigues 31)",
      why: "R$ 10 seguram dois dias em 55 em vez de 60",
      measure: "Lançar quitação como Mikely/Ana Laura — dias sobem no bolso",
    },
    {
      title: "Conferir 6 un. sobra do 31/08",
      why: "Ainda sem perda lançada — pode virar perda ou venda em set",
      measure: "Decidir até 1ª semana de set: venda / perda / estoque",
    },
    {
      title: "Segurar own mensal com split (meta ROI ≥ 1,5×)",
      why: "Agosto ficou 1,41× com R$ 970 próprio",
      measure: "Own ≤ ~R$ 45/dia em compras ~22 un. · nunca 30 un. 100% próprio",
    },
    {
      title: "Manter perdas ≤ 6 em setembro",
      why: "11 > 8; o fim do mês mostrou que 0 é possível",
      measure: "Checklist fim do dia + não classificar fiado como perda",
    },
    {
      title: "Usar ~R$ 300/semana limpa como baseline",
      why: "24–28 é a régua honesta (sem dia 100% família)",
      measure: "4 semanas × R$ 320 = R$ 1.280 piso · ambicioso R$ 1.500+",
    },
  ],
  nextGoals:
    "Setembro: lucro ≥ R$ 1.400 · fat ≥ R$ 2.400 · perdas ≤ 6 · own retorno ≥ 1,5× · own mensal ≤ R$ 900 · quitar fiados ago · resolver sobra 31/08",
  fairReading:
    "Agosto foi o primeiro mês “cheio” e entregou o que o Realista prometia — com folga na meta canônica de R$ 1.200. O cofrinho canônico do mês é R$ 1.365 (com sáb 08/08); no extrato prático Mon–Fri o número de referência continua R$ 1.345. Não chame de fracasso o Ambicioso: ele era teto motivacional (~R$ 1.633), não piso. Os dois buracos reais são disciplina de perda (11 un.) e eficiência do capital próprio (1,41×). Conserta split + perdas e setembro passa de R$ 1.400 sem precisar de outro dia “grátis”.",
  metricsSnapshot: {
    current: {
      label: "Agosto/2026",
      start: "2026-08-01",
      end: "2026-08-31",
      revenue: 2277.5,
      diaryProfit: 1365,
      unitsSold: 456,
      unitsLost: 11,
      ownCapital: 970,
      familyCapital: 626,
      purchaseInvestment: 1596,
    },
    previous: {
      label: "Julho/2026",
      start: "2026-07-16",
      end: "2026-07-31",
      revenue: 950,
      diaryProfit: 664,
      unitsSold: 191,
      unitsLost: 3,
      ownCapital: 233.5,
      familyCapital: 422.5,
      purchaseInvestment: 656,
    },
    pills: [
      { label: "Meta R$ 1.200 ✓", tone: "success" },
      { label: "Realista ✓ (+R$ 100)", tone: "success" },
      { label: "Ambicioso ✗ (−R$ 268)", tone: "warning" },
      { label: "Perdas 11 > 8", tone: "danger" },
      { label: "Own 1,41× < 1,5×", tone: "warning" },
    ],
    chartTitleProfit: "Lucro cofrinho dia a dia",
    dailyProfitNote:
      "Operacional + bônus Henrique (04–06: +19 +15 +30). Total ago = R$ 1.365. Seg–sex sem sáb 08 = R$ 1.345.",
    dailyProfitCompare: [
      { label: "03", previous: 0, current: 55 },
      { label: "04", previous: 0, current: 79 },
      { label: "05", previous: 0, current: 32.5 },
      { label: "06", previous: 0, current: 57 },
      { label: "07", previous: 0, current: 120 },
      { label: "08", previous: 0, current: 20 },
      { label: "10", previous: 0, current: 63 },
      { label: "11", previous: 0, current: 65 },
      { label: "12", previous: 0, current: 53 },
      { label: "13", previous: 0, current: 55 },
      { label: "14", previous: 0, current: 60 },
      { label: "17", previous: 0, current: 60 },
      { label: "18", previous: 0, current: 28 },
      { label: "19", previous: 0, current: 118.5 },
      { label: "20", previous: 0, current: 84 },
      { label: "21", previous: 0, current: 65 },
      { label: "24", previous: 0, current: 55 },
      { label: "25", previous: 0, current: 60 },
      { label: "26", previous: 0, current: 60 },
      { label: "27", previous: 0, current: 60 },
      { label: "28", previous: 0, current: 60 },
      { label: "31", previous: 0, current: 55 },
    ],
    chartTitleAcal: "Lucro por bloco (ago) × julho",
    dailyAcalNote: "Blocos ago no cofrinho · julho por semana cheia no eixo previous",
    dailyAcalRevenueCompare: [
      { label: "03–08", previous: 105, current: 363.5 },
      { label: "10–14", previous: 221, current: 296 },
      { label: "17–21", previous: 294, current: 355.5 },
      { label: "24–28", previous: 0, current: 295 },
      { label: "31", previous: 0, current: 55 },
    ],
    channels: [
      {
        name: "Acal (fat aprox.)",
        previousRevenue: 765,
        currentRevenue: 1613.5,
        previousProfit: 497,
        currentProfit: 0,
      },
      {
        name: "Henrique (fat)",
        previousRevenue: 175,
        currentRevenue: 560,
        previousProfit: 67.5,
        currentProfit: 0,
      },
      {
        name: "Unifor (fat)",
        previousRevenue: 0,
        currentRevenue: 110,
        previousProfit: 0,
        currentProfit: 0,
      },
    ],
    volumeRows: [
      { metric: "Un. vendidas", previous: "191", current: "456", delta: "+265" },
      { metric: "Un. perdidas", previous: "3", current: "11", delta: "+8" },
      { metric: "Invest. compra", previous: "R$ 656,00", current: "R$ 1.596,00", delta: "+R$ 940" },
      { metric: "Capital próprio", previous: "R$ 233,50", current: "R$ 970,00", delta: "+R$ 736,50" },
      { metric: "Dias com diário", previous: "12", current: "22", delta: "+10" },
      {
        metric: "Meta lucro / Realista / Ambicioso",
        previous: "— / — / —",
        current: "1.200 ✓ / 1.265 ✓ / 1.633 ✗",
        delta: "1.365 feito",
      },
    ],
    footerNote:
      "Agosto canônico no cofrinho = R$ 1.365 (R$ 1.301 op + R$ 64 bônus). Cofrinho prático Mon–Fri exclui sáb 08/08 (−R$ 20) → R$ 1.345. Projeção Jul→Ago validada ~3/08: Conservador ~R$ 996 · Realista ~R$ 1.265 · Ambicioso ~R$ 1.633. Pendentes abertos: Ismael 24/08 R$5 · Jose Maclaurem Rodrigues 31/08 R$5. Sobra 31/08: 6 un. sem perda lançada.",
  },
};

async function main() {
  if (process.env.CONFIRM_RETRATO !== "1") {
    console.log("Dry-run. Defina CONFIRM_RETRATO=1 para gravar.");
    console.log(
      JSON.stringify(
        {
          periodKey: AGOSTO.periodKey,
          title: AGOSTO.title,
          headline: AGOSTO.headline,
          lucro: AGOSTO.metricsSnapshot.current.diaryProfit,
          fat: AGOSTO.metricsSnapshot.current.revenue,
          nextGoals: AGOSTO.nextGoals,
        },
        null,
        2,
      ),
    );
    return;
  }
  const review = await upsertPeriodReview(AGOSTO);
  console.log("OK Retrato publicado:", review.id, review.periodKey, review.title);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
