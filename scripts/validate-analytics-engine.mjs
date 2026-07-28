/**
 * Valida Sprint 3.1 — compara métricas pós-refatoração com baseline esperado
 */
import {
  computeDashboardMetrics,
  computeDayReport,
  computeRankings,
  computeProjections,
} from "../src/lib/analytics-engine/index.ts";
import { generateInsights } from "../src/lib/insights-engine.ts";

const scopes = ["salgados", "brigadeiros", "all"] as const;
const expected = {
  salgados: { revenue: 105, sales: 20, items: 21, topProduct: "Croissant" },
  brigadeiros: { revenue: 128, sales: 3, items: 43, topProduct: "Brigadeiro" },
  all: { revenue: 233, sales: 23, items: 64, topProduct: "Brigadeiro" },
};

const issues = [];
const ok = [];

for (const scope of scopes) {
  const rankings = computeRankings(scope);
  const report = computeDayReport("2026-07-01", scope);
  void report;
  const monthStart = "2026-07-01";
  const monthEnd = "2026-07-31";
  let totalRevenue = 0;
  let totalSales = 0;
  let totalItems = 0;
  for (let d = 1; d <= 31; d++) {
    const date = `2026-07-${String(d).padStart(2, "0")}`;
    const day = computeDayReport(date, scope);
    totalRevenue += day.revenue;
    totalSales += day.salesCount;
    totalItems += day.itemsSold;
  }
  const exp = expected[scope];
  if (Math.abs(totalRevenue - exp.revenue) > 0.01) {
    issues.push(`${scope} revenue ${totalRevenue} != ${exp.revenue}`);
  } else ok.push(`${scope} revenue OK`);
  if (totalSales !== exp.sales) issues.push(`${scope} sales ${totalSales} != ${exp.sales}`);
  else ok.push(`${scope} sales OK`);
  if (totalItems !== exp.items) issues.push(`${scope} items ${totalItems} != ${exp.items}`);
  else ok.push(`${scope} items OK`);
  if (rankings.topProducts[0]?.name !== exp.topProduct) {
    issues.push(`${scope} top ${rankings.topProducts[0]?.name} != ${exp.topProduct}`);
  } else ok.push(`${scope} top product OK`);

  const dash = computeDashboardMetrics(scope);
  if (dash.revenueMonth < exp.revenue) {
    issues.push(`${scope} dashboard month revenue ${dash.revenueMonth}`);
  } else ok.push(`${scope} dashboard metrics OK`);

  const projections = computeProjections(scope);
  if (projections.length !== 7) issues.push(`${scope} projections count`);
  else ok.push(`${scope} projections OK`);

  const insights = generateInsights(scope);
  ok.push(`${scope} insights ${insights.length}`);
}

console.log(JSON.stringify({ ok, issues, passed: issues.length === 0 }, null, 2));
if (issues.length) process.exit(1);
