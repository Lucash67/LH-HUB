/**
 * Captura snapshot de métricas antes/depois da Sprint 3.1
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BASE = process.env.LBO_API_BASE ?? "http://localhost:3001";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "analytics-baseline.json");

async function api(urlPath) {
  const r = await fetch(`${BASE}${urlPath}`);
  const json = await r.json().catch(() => ({}));
  if (!r.ok || json.error) throw new Error(`${urlPath} → ${json.error || r.status}`);
  return json;
}

async function main() {
  const scopes = ["salgados", "brigadeiros", "all"];
  const snapshot = { capturedAt: new Date().toISOString(), scopes: {} };

  for (const scope of scopes) {
    const q = scope === "all" ? "" : `?businessId=${scope}`;
    const rankings = await api(`/api/rankings${q}`);
    const report = await api(`/api/reports?type=monthly${scope === "all" ? "" : `&businessId=${scope}`}`);
    const projections = await api(`/api/projections${q}`);
    const insights = await api(`/api/insights${q}`);

    snapshot.scopes[scope] = {
      rankings: {
        topProduct: rankings.topProducts?.[0]?.name,
        topQty: rankings.topProducts?.[0]?.quantity,
        topClient: rankings.topClients?.[0]?.name,
      },
      report: {
        totalRevenue: report.totalRevenue,
        totalProfit: report.totalProfit,
        totalItems: report.totalItems,
        totalSales: report.totalSales,
      },
      projectionsFirst: projections[0],
      insightsCount: insights.length,
      insightIds: insights.map((i) => i.id).sort(),
    };
  }

  fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log("Baseline saved to", OUT);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
