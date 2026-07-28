/** Detail checks — writes to homologacao-result.json (no console secrets) */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BASE = process.env.LBO_API_BASE ?? "http://localhost:3001";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = path.join(__dirname, "..", "data", "lucas-business-os.db");
const OUT = path.join(__dirname, "..", "homologacao-result.json");

async function api(urlPath) {
  const r = await fetch(`${BASE}${urlPath}`);
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok && !json.error, status: r.status, data: json };
}

async function main() {
  const db = new Database(DB, { readonly: true });
  const result = { checks: [], goals: {}, stock: {}, dashboard: {} };

  result.goals.db = db.prepare("SELECT business_id, type, target_amount FROM goals").all();
  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/goals" : `/api/goals?businessId=${scope}`;
    const res = await api(q);
    result.goals[scope] = {
      ok: res.ok,
      count: Array.isArray(res.data) ? res.data.length : null,
      types: Array.isArray(res.data) ? res.data.map((g) => g.type) : [],
    };
  }

  const brigMoves = db
    .prepare(
      `SELECT sm.type, sm.quantity, sm.balance_after, sm.created_at, p.stock_quantity
       FROM stock_movements sm JOIN products p ON p.id=sm.product_id
       WHERE p.business_id='brigadeiros' ORDER BY sm.created_at`,
    )
    .all();
  const brigProduct = db
    .prepare("SELECT stock_quantity, sold_quantity FROM products WHERE business_id='brigadeiros'")
    .get();
  result.stock = {
    productStock: brigProduct?.stock_quantity,
    productSold: brigProduct?.sold_quantity,
    movements: brigMoves.length,
    lastBalance: brigMoves.at(-1)?.balance_after,
    produced: brigMoves.filter((m) => m.type === "entry").reduce((s, m) => s + m.quantity, 0),
    exited: brigMoves.filter((m) => m.type === "exit").reduce((s, m) => s + m.quantity, 0),
  };
  result.stock.balanceMatchesProduct =
    result.stock.lastBalance === result.stock.productStock;

  for (const scope of ["salgados", "brigadeiros", "all"]) {
    const q = scope === "all" ? "/api/stock" : `/api/stock?businessId=${scope}`;
    const res = await api(q);
    const products = res.data?.products ?? [];
    result.stock[`api_${scope}`] = {
      totalStock: products.reduce((s, p) => s + (p.stockQuantity || 0), 0),
      totalSold: products.reduce((s, p) => s + (p.soldQuantity || 0), 0),
    };
  }

  db.close();
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
