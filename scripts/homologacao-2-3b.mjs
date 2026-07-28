/**
 * Sprint 2.3B — Homologação operacional (validação read-only)
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const BASE = process.env.LBO_API_BASE ?? "http://localhost:3001";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = path.join(__dirname, "..", "data", "lucas-business-os.db");

const issues = [];
const approved = [];
const warnings = [];

function check(name, ok, detail, level = "error") {
  const item = { name, detail };
  if (ok) approved.push(item);
  else if (level === "warn") warnings.push(item);
  else issues.push(item);
}

async function api(urlPath) {
  const r = await fetch(`${BASE}${urlPath}`);
  const json = await r.json().catch(() => ({}));
  if (!r.ok || json.error) throw new Error(`${urlPath} → ${json.error || r.status}`);
  return json;
}

function sum(arr, fn) {
  return arr.reduce((s, x) => s + fn(x), 0);
}

function unitsFromSales(sales) {
  return sum(sales, (s) => sum(s.items || [], (i) => i.quantity || 0));
}

function revFromSales(sales) {
  return sum(sales, (s) => s.totalAmount || 0);
}

function uniqueClients(sales) {
  return new Set(sales.map((s) => s.clientId).filter(Boolean)).size;
}

async function main() {
  const db = new Database(DB, { readonly: true });

  const dbSales = db.prepare(`
    SELECT s.id, s.business_id, s.date, s.total_amount, s.profit, s.payment_method, s.client_id,
           (SELECT COALESCE(SUM(si.quantity),0) FROM sale_items si WHERE si.sale_id = s.id) as units
    FROM sales s
  `).all();

  const dbProducts = db.prepare(`
    SELECT id, name, business_id, price, cost, stock_quantity, sold_quantity, status FROM products
  `).all();

  const dbClientsCount = db.prepare("SELECT COUNT(*) as c FROM clients").get().c;
  const dbGoals = db.prepare("SELECT business_id, type, target_amount FROM goals").all();
  const dbMovements = db.prepare(`
    SELECT sm.type, sm.quantity, sm.balance_after, sm.created_at, p.business_id, p.name as product_name
    FROM stock_movements sm JOIN products p ON p.id = sm.product_id ORDER BY sm.created_at
  `).all();

  const salgadosDb = dbSales.filter((s) => s.business_id === "salgados");
  const brigDb = dbSales.filter((s) => s.business_id === "brigadeiros");

  const expected = {
    salgados: {
      sales: salgadosDb.length,
      revenue: sum(salgadosDb, (s) => s.total_amount),
      units: sum(salgadosDb, (s) => s.units),
      profit: sum(salgadosDb, (s) => s.profit),
    },
    brigadeiros: {
      sales: brigDb.length,
      revenue: sum(brigDb, (s) => s.total_amount),
      units: sum(brigDb, (s) => s.units),
      profit: sum(brigDb, (s) => s.profit),
      stock: dbProducts.find((p) => p.business_id === "brigadeiros")?.stock_quantity,
      soldQty: dbProducts.find((p) => p.business_id === "brigadeiros")?.sold_quantity,
    },
    all: {
      sales: dbSales.length,
      revenue: sum(dbSales, (s) => s.total_amount),
      units: sum(dbSales, (s) => s.units),
    },
  };

  // Expected Brigadeiros official totals (Sprint 2.3)
  check(
    "Brigadeiros receita oficial R$122",
    Math.abs(expected.brigadeiros.revenue - 122) < 0.01,
    `DB=${expected.brigadeiros.revenue}`,
  );
  check(
    "Brigadeiros 41 unidades vendidas",
    expected.brigadeiros.units === 41,
    `DB=${expected.brigadeiros.units}`,
  );
  check(
    "Brigadeiros 15 transações",
    expected.brigadeiros.sales === 15,
    `DB=${expected.brigadeiros.sales}`,
  );
  check(
    "Brigadeiros estoque 2",
    expected.brigadeiros.stock === 2,
    `stock=${expected.brigadeiros.stock}, sold_qty=${expected.brigadeiros.soldQty}`,
  );
  check(
    "Levi sem venda Brigadeiros",
    brigDb.filter((s) => {
      const c = db.prepare("SELECT name FROM clients WHERE id = ?").get(s.client_id);
      return c?.name === "Levi";
    }).length === 0,
    "OK",
  );

  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const url =
      scope === "all" ? "/api/sales" : `/api/sales?businessId=${scope}`;
    const sales = await api(url);
    const dbSlice =
      scope === "all" ? dbSales : dbSales.filter((s) => s.business_id === scope);

    check(
      `API vendas ${scope}`,
      sales.length === dbSlice.length,
      `API=${sales.length} DB=${dbSlice.length}`,
    );
    check(
      `API receita ${scope}`,
      Math.abs(revFromSales(sales) - sum(dbSlice, (s) => s.total_amount)) < 0.01,
      `API=${revFromSales(sales)} DB=${sum(dbSlice, (s) => s.total_amount)}`,
    );
    check(
      `API unidades ${scope}`,
      unitsFromSales(sales) === sum(dbSlice, (s) => s.units),
      `API=${unitsFromSales(sales)} DB=${sum(dbSlice, (s) => s.units)}`,
    );

    for (const s of sales) {
      if (scope !== "all" && s.businessId !== scope) {
        issues.push({
          name: `Venda em operação errada (${scope})`,
          detail: `sale ${s.id} businessId=${s.businessId}`,
        });
      }
    }
  }

  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/products" : `/api/products?businessId=${scope}`;
    const products = await api(q);
    const dbSlice =
      scope === "all" ? dbProducts : dbProducts.filter((p) => p.business_id === scope);
    check(`API produtos ${scope}`, products.length === dbSlice.length, `${products.length}/${dbSlice.length}`);
  }

  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/stock" : `/api/stock?businessId=${scope}`;
    const stock = await api(q);
    const dbSlice =
      scope === "all" ? dbProducts : dbProducts.filter((p) => p.business_id === scope);
    const apiStock = sum(stock.products || [], (p) => p.stockQuantity);
    const dbStock = sum(dbSlice, (p) => p.stock_quantity);
    check(`API estoque saldo ${scope}`, apiStock === dbStock, `API=${apiStock} DB=${dbStock}`);
  }

  const clients = await api("/api/clients");
  check("Clientes globais API=DB", clients.length === dbClientsCount, `${clients.length}/${dbClientsCount}`);

  // Financial scope
  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/financial" : `/api/financial?businessId=${scope}`;
    const fin = await api(q);
    const dbSlice =
      scope === "all" ? dbSales : dbSales.filter((s) => s.business_id === scope);
    const monthRev = sum(dbSlice, (s) => s.total_amount);
    check(
      `Financeiro grossRevenue ${scope}`,
      Math.abs((fin.grossRevenue || 0) - monthRev) < 0.01 || fin.grossRevenue <= monthRev,
      `fin=${fin.grossRevenue} (nota: filtra mês corrente)`,
      "warn",
    );
  }

  // Goals per operation
  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/goals" : `/api/goals?businessId=${scope}`;
    const goals = await api(q);
    check(`Metas carregam ${scope}`, Array.isArray(goals) && goals.length >= 1, `${goals.length} metas`);
  }

  // Calendar brigadeiros July
  const calBrig = await api("/api/calendar?year=2026&month=7&businessId=brigadeiros");
  const brigDates = [...new Set(brigDb.map((s) => s.date))].sort();
  for (const d of brigDates) {
    const dayRev = sum(brigDb.filter((s) => s.date === d), (s) => s.total_amount);
    const calRev = calBrig.dayData?.[d]?.revenue ?? 0;
    check(`Calendário ${d} brigadeiros`, Math.abs(calRev - dayRev) < 0.01, `cal=${calRev} db=${dayRev}`);
  }

  // Modules WITHOUT business scope (expected pendency)
  const rankings = await api("/api/rankings");
  const insights = await api("/api/insights");
  const projections = await api("/api/projections");
  check(
    "Rankings escopo global (pendência conhecida)",
    rankings !== undefined,
    "Não filtra por operação — documentado Sprint 2.2B",
    "warn",
  );
  check(
    "Insights escopo global (pendência conhecida)",
    Array.isArray(insights),
    "Não filtra por operação — documentado Sprint 2.2B",
    "warn",
  );
  check(
    "Projeções escopo global (pendência conhecida)",
    Array.isArray(projections),
    "Não filtra por operação — documentado Sprint 2.2B",
    "warn",
  );

  // Stock movement integrity brigadeiros
  const brigProduct = dbProducts.find((p) => p.business_id === "brigadeiros");
  if (brigProduct) {
    const moves = dbMovements.filter((m) => m.business_id === "brigadeiros");
    let simulated = 0;
    for (const m of moves) {
      if (m.type === "entry") simulated += m.quantity;
      else if (m.type === "exit") simulated -= m.quantity;
      else simulated = m.quantity;
      check(
        `Movimento estoque saldo ${m.created_at}`,
        m.balance_after === simulated,
        `expected=${simulated} recorded=${m.balance_after}`,
      );
    }
    check(
      "Brigadeiros estoque final vs produto",
      brigProduct.stock_quantity === simulated,
      `product=${brigProduct.stock_quantity} simulated=${simulated}`,
    );
  }

  // Gabi combo R$5
  const gabiSales = db.prepare(`
    SELECT s.total_amount FROM sales s
    JOIN clients c ON c.id = s.client_id
    WHERE s.business_id = 'brigadeiros' AND c.name = 'Gabi' AND s.date = '2026-07-10'
  `).all();
  check(
    "Combo Gabi Lote001 R$5",
    gabiSales.length === 1 && Math.abs(gabiSales[0].total_amount - 5) < 0.01,
    JSON.stringify(gabiSales),
  );

  db.close();

  console.log(
    JSON.stringify(
      {
        expected,
        approved: approved.length,
        issues,
        warnings,
        summary: {
          salgados: expected.salgados,
          brigadeiros: expected.brigadeiros,
          consolidated: expected.all,
          clients: dbClientsCount,
          goalsRows: dbGoals.length,
        },
      },
      null,
      2,
    ),
  );

  if (issues.length) process.exit(1);
}

main().catch((e) => {
  console.error("FALHA:", e.message);
  process.exit(1);
});
