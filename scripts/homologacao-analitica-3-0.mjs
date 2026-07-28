/**
 * Sprint 3.0 — Homologação da camada analítica multioperação
 */
const BASE = process.env.LBO_API_BASE ?? "http://localhost:3001";

async function api(path) {
  const r = await fetch(`${BASE}${path}`);
  const json = await r.json().catch(() => ({}));
  if (!r.ok || json.error) throw new Error(`${path} → ${json.error || r.status}`);
  return json;
}

function sumSalesRevenue(sales) {
  return sales.reduce((s, v) => s + (v.totalAmount || 0), 0);
}

function topProductName(rankings) {
  return rankings.topProducts?.[0]?.name ?? null;
}

async function main() {
  const issues = [];
  const ok = [];

  const salgadosSales = await api("/api/sales?businessId=salgados");
  const brigSales = await api("/api/sales?businessId=brigadeiros");
  const allSales = await api("/api/sales");

  const salgadosRev = sumSalesRevenue(salgadosSales);
  const brigRev = sumSalesRevenue(brigSales);
  const allRev = sumSalesRevenue(allSales);

  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const rankings = await api(
      scope === "all" ? "/api/rankings" : `/api/rankings?businessId=${scope}`,
    );
    const report = await api(
      scope === "all" ? "/api/reports?type=monthly" : `/api/reports?type=monthly&businessId=${scope}`,
    );
    const projections = await api(
      scope === "all" ? "/api/projections" : `/api/projections?businessId=${scope}`,
    );
    const insights = await api(
      scope === "all" ? "/api/insights" : `/api/insights?businessId=${scope}`,
    );

    const expectedRev = scope === "salgados" ? salgadosRev : scope === "brigadeiros" ? brigRev : allRev;
    const reportRev = report.totalRevenue ?? report.revenue ?? 0;

    if (Math.abs(reportRev - expectedRev) > 0.01) {
      issues.push(`${scope} report revenue mismatch: ${reportRev} vs ${expectedRev}`);
    } else {
      ok.push(`${scope} reports revenue OK`);
    }

    if (!Array.isArray(projections) || projections.length === 0) {
      issues.push(`${scope} projections empty`);
    } else {
      ok.push(`${scope} projections OK (${projections.length})`);
    }

    if (!Array.isArray(insights)) {
      issues.push(`${scope} insights invalid`);
    } else {
      ok.push(`${scope} insights OK (${insights.length})`);
    }

    if (!rankings.topProducts) {
      issues.push(`${scope} rankings invalid`);
    } else {
      ok.push(`${scope} rankings OK (${rankings.topProducts.length} products)`);
    }
  }

  const rankSalgados = await api("/api/rankings?businessId=salgados");
  const rankBrig = await api("/api/rankings?businessId=brigadeiros");
  const rankAll = await api("/api/rankings");

  const salgadosTop = topProductName(rankSalgados);
  const brigTop = topProductName(rankBrig);

  if (salgadosTop && salgadosTop.toLowerCase().includes("brigadeiro")) {
    issues.push("Salgados ranking contains brigadeiro product");
  } else {
    ok.push("Salgados ranking excludes brigadeiros products");
  }

  if (brigTop && !brigTop.toLowerCase().includes("brigadeiro")) {
    issues.push(`Brigadeiros ranking top product unexpected: ${brigTop}`);
  } else {
    ok.push("Brigadeiros ranking scoped correctly");
  }

  if (rankAll.topProducts.length < Math.max(rankSalgados.topProducts.length, rankBrig.topProducts.length)) {
    issues.push("All rankings should consolidate both operations");
  } else {
    ok.push("All rankings consolidates operations");
  }

  const projSalgados = await api("/api/projections?businessId=salgados");
  const projBrig = await api("/api/projections?businessId=brigadeiros");
  if (projSalgados[0]?.monthlyRevenue === projBrig[0]?.monthlyRevenue && salgadosRev !== brigRev) {
    issues.push("Projections identical across operations with different catalogs");
  } else {
    ok.push("Projections differ by operation catalog");
  }

  console.log(JSON.stringify({ ok, issues, passed: issues.length === 0 }, null, 2));
  if (issues.length) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
