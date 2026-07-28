/**
 * Sprint 3.2.6 — Auditoria fonte única de dados
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

console.log("=== SALES BY DATE (salgados) ===");
console.table(
  db
    .prepare(
      "SELECT date, COUNT(*) as vendas, ROUND(SUM(total_amount),2) as receita FROM sales WHERE business_id='salgados' GROUP BY date ORDER BY date DESC",
    )
    .all(),
);

console.log("\n=== SALES 2026-07-20 (all businesses) ===");
console.table(
  db
    .prepare(
      "SELECT id, business_id, date, time, total_amount, payment_method, profit FROM sales WHERE date='2026-07-20'",
    )
    .all(),
);

console.log("\n=== PRODUCTS salgados ===");
console.table(
  db
    .prepare(
      "SELECT name, stock_quantity, sold_quantity, price, cost FROM products WHERE business_id='salgados' ORDER BY name",
    )
    .all(),
);

console.log("\n=== SALE_ITEMS by product (salgados all time) ===");
console.table(
  db
    .prepare(`
    SELECT si.product_name, SUM(si.quantity) as qty, ROUND(SUM(si.subtotal),2) as receita
    FROM sale_items si JOIN sales s ON s.id = si.sale_id
    WHERE s.business_id='salgados'
    GROUP BY si.product_name ORDER BY qty DESC
  `).all(),
);

console.log("\n=== DIARY 20/07 ===");
const diary = db
  .prepare("SELECT content FROM notes WHERE entity_id='salgados:2026-07-20'")
  .get();
if (diary) {
  const e = JSON.parse(diary.content);
  console.log({
    date: e.date,
    revenue: e.revenue,
    profit: e.profit,
    qtySold: e.quantitySold,
    qtyLost: e.quantityLost,
    investment: e.purchase?.investment,
    products: e.purchase?.products,
    sales: e.sales,
  });
} else {
  console.log("NOT FOUND");
}

console.log("\n=== FINANCIAL: investments salgados ===");
console.table(
  db
    .prepare(
      "SELECT type, amount, date, description FROM investments WHERE business_id='salgados' ORDER BY date",
    )
    .all(),
);

db.close();
