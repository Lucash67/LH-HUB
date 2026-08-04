/** Audita os números de cada módulo contra a base diário-primeiro (dashboard por dia). */
import "./load-env";
import {
  buildOperationalDayMetrics,
  sortOperationalDays,
} from "../src/lib/operational-day-metrics";
import { getFinancialSummary, getGoalsWithProgress } from "../src/lib/analytics";
import { getPerformanceView } from "../src/lib/performance-service";
import { getSmartGoalsView } from "../src/lib/smart-goals-service";

const BIZ = "salgados";
const fmt = (n: number) => `R$${n.toFixed(2)}`;

async function main(): Promise<void> {
  const metricsMap = await buildOperationalDayMetrics(BIZ);
  const days = sortOperationalDays(metricsMap);

  console.log("\n===== BASE OFICIAL (diário por dia — igual à dashboard do dia) =====");
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalCosts = 0;
  let totalUnits = 0;
  for (const d of days) {
    console.log(
      `${d.date} | receita ${fmt(d.revenue)} | lucro ${fmt(d.profit)} | custo ${fmt(d.costs)} | un ${d.units ?? "?"} | fonte ${d.source}`,
    );
    totalRevenue += d.revenue;
    totalProfit += d.profit;
    totalCosts += d.costs;
    totalUnits += d.units ?? 0;
  }
  console.log(
    `TOTAL: receita ${fmt(totalRevenue)} | lucro ${fmt(totalProfit)} | custo ${fmt(totalCosts)} | un ${totalUnits} | dias ${days.length}`,
  );

  console.log("\n===== FINANCEIRO (geral) =====");
  const fin = await getFinancialSummary(BIZ);
  console.log(`grossRevenue: ${fmt(fin.grossRevenue)} (esperado ${fmt(totalRevenue)})`);
  console.log(`operationalProfit: ${fmt(fin.operationalProfit)} (esperado ${fmt(totalProfit)})`);
  console.log(`workingCapital: ${fmt(fin.workingCapital)}`);
  console.log(`netRevenue: ${fmt(fin.netRevenue)}`);
  console.log(`initialInvestment (total investimentos): ${fmt(fin.initialInvestment)}`);
  console.log(`cashFlow: entrada ${fmt(fin.cashFlow.income)} | saída ${fmt(fin.cashFlow.expenses)} | saldo ${fmt(fin.cashFlow.balance)}`);
  console.log(`operatorFinance.owner: ${JSON.stringify(fin.operatorFinance?.owner ?? null)}`);
  console.log(`operatorFinance.operator: ${JSON.stringify(fin.operatorFinance?.operator ?? null)}`);

  console.log("\n===== FINANCEIRO (dia 2026-07-31) =====");
  const finDay = await getFinancialSummary(BIZ, { viewMode: "day", date: "2026-07-31" });
  console.log(`grossRevenue: ${fmt(finDay.grossRevenue)} | operationalProfit: ${fmt(finDay.operationalProfit)}`);

  console.log("\n===== DESEMPENHO =====");
  for (const period of ["weekly", "monthly"] as const) {
    for (const offset of [0, -1]) {
      const view = await getPerformanceView(BIZ, period, offset);
      const expected = days.filter((d) => d.date >= view.range.start && d.date <= view.range.end);
      const expRev = expected.reduce((s, d) => s + d.revenue, 0);
      const expProf = expected.reduce((s, d) => s + d.profit, 0);
      console.log(
        `${period} offset ${offset} (${view.range.start}..${view.range.end}): receita ${fmt(view.metrics.revenue)} (esp ${fmt(expRev)}) | lucro ${fmt(view.metrics.profit)} (esp ${fmt(expProf)}) | un ${view.metrics.itemsSold} | vendas ${view.metrics.salesCount}`,
      );
    }
  }

  console.log("\n===== METAS (smart goals) =====");
  const goalsView = await getSmartGoalsView(BIZ);
  if (goalsView) {
    console.log(`referência: ${goalsView.referenceDate}`);
    console.log(
      `daily: alvo ${goalsView.daily.targetUnits} un | feito ${goalsView.daily.achievedUnits} un | receita ${fmt(goalsView.daily.achievedRevenue)} | lucro ${fmt(goalsView.daily.achievedProfit)} | ${goalsView.daily.progressPercent.toFixed(0)}%`,
    );
    console.log(
      `weekly: alvo ${goalsView.weekly.targetUnits} un | feito ${goalsView.weekly.achievedUnits} un | receita ${fmt(goalsView.weekly.achievedRevenue)} | ${goalsView.weekly.progressPercent.toFixed(0)}%`,
    );
    console.log(
      `monthly: alvo ${goalsView.monthly.targetUnits} un | feito ${goalsView.monthly.achievedUnits} un | receita ${fmt(goalsView.monthly.achievedRevenue)} | ${goalsView.monthly.progressPercent.toFixed(0)}%`,
    );
  } else {
    console.log("sem view");
  }

  console.log("\n===== METAS (goals com progresso) =====");
  const goals = await getGoalsWithProgress(BIZ);
  for (const g of goals) {
    console.log(
      `${g.type}: alvo ${fmt(g.targetAmount)} | atual ${fmt(g.current)} | ${g.progress.toFixed(0)}% | período ${g.periodStart}..${g.periodEnd}`,
    );
  }

  const { getProfitBankView } = await import("../src/lib/profit-bank-service");
  console.log("\n===== BANCO DE LUCRO =====");
  const bank = await getProfitBankView(BIZ);
  console.log(JSON.stringify(bank.summary ?? bank, null, 2).slice(0, 1200));

  const { getPeriodProjectionView } = await import("../src/lib/period-projections-service");
  console.log("\n===== PROJEÇÕES (weekly offset 0) =====");
  const proj = await getPeriodProjectionView(BIZ, "weekly", 0);
  console.log(JSON.stringify(proj, null, 2).slice(0, 1500));

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
