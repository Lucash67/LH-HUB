/**
 * Sprint 3.2 — Validação dos KPIs executivos
 */
import { computeExecutiveKpis } from "../src/lib/analytics-engine/kpis/index.ts";

const scopes = ["salgados", "brigadeiros", "all"];
const expected = {
  salgados: { revenue: 105, champion: "Croissant" },
  brigadeiros: { revenue: 128, champion: "Brigadeiro" },
  all: { revenue: 233, champion: "Brigadeiro" },
};

const issues = [];
const ok = [];

for (const scope of scopes) {
  const kpis = computeExecutiveKpis(scope);
  const exp = expected[scope];

  if (Math.abs(kpis.revenue.total - exp.revenue) > 0.01) {
    issues.push(`${scope} revenue ${kpis.revenue.total} != ${exp.revenue}`);
  } else ok.push(`${scope} revenue OK (${kpis.revenue.total})`);

  if (kpis.products.champion?.name !== exp.champion) {
    issues.push(`${scope} champion ${kpis.products.champion?.name} != ${exp.champion}`);
  } else ok.push(`${scope} champion OK`);

  if (scope !== "all" && kpis.operations.participation.length !== 1) {
    issues.push(`${scope} should have 1 operation entry`);
  } else if (scope !== "all") ok.push(`${scope} operation scoped OK`);

  if (scope === "all" && kpis.operations.participation.length < 2) {
    issues.push("all should have 2+ operations");
  } else if (scope === "all") ok.push(`all operations OK (${kpis.operations.participation.length})`);

  const hasBrigadeiro = kpis.products.shares.some((s) =>
    s.name.toLowerCase().includes("brigadeiro"),
  );
  if (scope === "salgados" && hasBrigadeiro) {
    issues.push("salgados has brigadeiro product in shares");
  } else if (scope === "salgados") ok.push("salgados products isolated OK");

  if (scope === "brigadeiros" && !hasBrigadeiro) {
    issues.push("brigadeiros missing brigadeiro product");
  } else if (scope === "brigadeiros") ok.push("brigadeiros products OK");

  if (kpis.products.abcCurve.A + kpis.products.abcCurve.B + kpis.products.abcCurve.C === 0 && kpis.revenue.total > 0) {
    issues.push(`${scope} ABC curve empty`);
  } else ok.push(`${scope} ABC OK (A=${kpis.products.abcCurve.A})`);

  if (kpis.clients.unique < 0) issues.push(`${scope} clients invalid`);
  else ok.push(`${scope} clients unique=${kpis.clients.unique} recurring=${kpis.clients.recurring}`);

  if (kpis.goals.entries.length < 4) issues.push(`${scope} goals count ${kpis.goals.entries.length}`);
  else ok.push(`${scope} goals OK (${kpis.goals.entries.length})`);

  ok.push(`${scope} ticket=${kpis.performance.averageItemsPerSale.toFixed(2)} items/sale`);
}

console.log(JSON.stringify({ ok, issues, passed: issues.length === 0 }, null, 2));
if (issues.length) process.exit(1);
