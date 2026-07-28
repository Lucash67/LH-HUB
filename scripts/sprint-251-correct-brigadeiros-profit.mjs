/**
 * Sprint 2.5.1 — Corrige lucros oficiais Lote 002 (valores homologados).
 * 18/07: 22 unidades · R$ 66,00 lucro
 * 19/07: 3 unidades · R$ 9,00 lucro
 *
 * Usa recalculate-sale-amounts para manter sales, sale_items, payments e produto consistentes.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db");

const SALES_18_MANUELA = "0db4d185-f6e6-44b1-a6ea-70f3d09bcd68";
const SALES_19_MARIA_CLARA = "c1308c17-d7bc-4c4d-a0eb-65fef75dd37b";
const SALES_19_LUIZ = "259431d6-82e2-4017-a5c6-86e571b35326";
const SALES_19_REMOVE = [
  "bd30e0f2-4ff9-4b56-b198-946d9b224cc9",
  "121b8154-dd2c-49c8-b248-b5f60ea60982",
];

function recalculate(db, saleId, quantity) {
  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(saleId);
  if (!sale) throw new Error(`Venda não encontrada: ${saleId}`);

  const item = db.prepare("SELECT * FROM sale_items WHERE sale_id = ?").get(saleId);
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(item.product_id);
  const qtyDelta = quantity - item.quantity;
  const subtotal = product.price * quantity;
  const cost = product.cost * quantity;
  const profit = subtotal - cost;
  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(
      "UPDATE sale_items SET quantity = ?, subtotal = ?, profit = ?, unit_price = ?, unit_cost = ? WHERE id = ?",
    ).run(quantity, subtotal, profit, product.price, product.cost, item.id);
    db.prepare(
      "UPDATE sales SET total_amount = ?, total_cost = ?, profit = ?, updated_at = ? WHERE id = ?",
    ).run(subtotal, cost, profit, now, saleId);
    db.prepare("UPDATE payments SET amount = ? WHERE sale_id = ?").run(subtotal, saleId);
    if (qtyDelta !== 0) {
      db.prepare(
        "UPDATE products SET sold_quantity = MAX(0, sold_quantity + ?), stock_quantity = MAX(0, stock_quantity - ?), updated_at = ? WHERE id = ?",
      ).run(qtyDelta, qtyDelta, now, product.id);
    }
  })();
}

function removeSale(db, saleId) {
  const item = db.prepare("SELECT * FROM sale_items WHERE sale_id = ?").get(saleId);
  const product = item
    ? db.prepare("SELECT * FROM products WHERE id = ?").get(item.product_id)
    : null;
  const now = new Date().toISOString();

  db.transaction(() => {
    if (item && product) {
      db.prepare(
        "UPDATE products SET sold_quantity = MAX(0, sold_quantity - ?), stock_quantity = stock_quantity + ?, updated_at = ? WHERE id = ?",
      ).run(item.quantity, item.quantity, now, product.id);
    }
    db.prepare("DELETE FROM payments WHERE sale_id = ?").run(saleId);
    db.prepare("DELETE FROM sale_items WHERE sale_id = ?").run(saleId);
    db.prepare("DELETE FROM sales WHERE id = ?").run(saleId);
  })();
}

function dayTotals(db, date) {
  return db.prepare(`
    SELECT COUNT(*) AS sales_cnt,
           SUM(s.profit) AS profit,
           (SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si JOIN sales s2 ON s2.id = si.sale_id WHERE s2.business_id = 'brigadeiros' AND s2.date = ?) AS units
    FROM sales s WHERE s.business_id = 'brigadeiros' AND s.date = ?
  `).get(date, date);
}

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

console.log("Antes:", {
  "2026-07-18": dayTotals(db, "2026-07-18"),
  "2026-07-19": dayTotals(db, "2026-07-19"),
});

recalculate(db, SALES_18_MANUELA, 8);
recalculate(db, SALES_19_MARIA_CLARA, 2);
recalculate(db, SALES_19_LUIZ, 1);
for (const id of SALES_19_REMOVE) removeSale(db, id);

console.log("Depois:", {
  "2026-07-18": dayTotals(db, "2026-07-18"),
  "2026-07-19": dayTotals(db, "2026-07-19"),
});

db.close();
console.log("OK — lucros Lote 002 corrigidos.");
