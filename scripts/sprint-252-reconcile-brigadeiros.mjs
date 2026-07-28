/**
 * Sprint 2.5.2 — Reconciliação operacional Brigadeiros (modo simplificado).
 * Remove vendas/clientes/horários detalhados e reconstrói 3 registros agregados oficiais.
 */
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db");
const BUSINESS_ID = "brigadeiros";

const OFFICIAL_LOTS = [
  {
    id: "brig-lote-001-2026-07-10",
    date: "2026-07-10",
    label: "LOTE 001",
    produced: 15,
    sold: 15,
    lost: 0,
    revenue: 44,
    profit: 44,
    cost: 0,
    notes: `LOTE 001 — 10/07/2026
Produto: Brigadeiro | Produção: 15 unidades | Preço unitário: R$ 3,00
Receita: R$ 44,00 | Lucro: R$ 44,00 | Custos: R$ 0,00
Observação: Uma venda foi realizada por R$ 5,00 para duas unidades, reduzindo o faturamento total de R$ 45,00 para R$ 44,00.`,
  },
  {
    id: "brig-lote-002-2026-07-18",
    date: "2026-07-18",
    label: "LOTE 002",
    produced: 30,
    sold: 25,
    lost: 2,
    revenue: 75,
    profit: 75,
    cost: 0,
    notes: `LOTE 002 — 18/07/2026
Produto: Brigadeiro | Produção: 30 unidades | Vendidos: 25 | Perdidos: 2
Receita: R$ 75,00 | Lucro: R$ 75,00 | Custos: R$ 0,00
Observação: Os ingredientes foram pagos pelo pai do proprietário. Dois brigadeiros foram perdidos durante o armazenamento.`,
  },
  {
    id: "brig-lote-002-fim-2026-07-19",
    date: "2026-07-19",
    label: "FINALIZAÇÃO LOTE 002",
    produced: 0,
    sold: 3,
    lost: 0,
    revenue: 9,
    profit: 9,
    cost: 0,
    notes: `FINALIZAÇÃO LOTE 002 — 19/07/2026
Vendidos: 3 unidades | Receita: R$ 9,00 | Lucro: R$ 9,00 | Custos: R$ 0,00
Observação: Venda das três unidades restantes do lote produzido em 18/07.`,
  },
];

const EXPECTED = {
  totalRevenue: 128,
  lote001Profit: 44,
  lote002Profit: 84,
  totalProfit: 128,
  produced: 45,
  sold: 43,
  lost: 2,
  remaining: 0,
};

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

const product = db
  .prepare("SELECT id, name FROM products WHERE business_id = ? AND name = 'Brigadeiro'")
  .get(BUSINESS_ID);

if (!product) {
  console.error("Produto Brigadeiro não encontrado.");
  process.exit(1);
}

const productId = product.id;
const now = new Date().toISOString();

console.log("=== Antes ===");
console.log("Vendas:", db.prepare("SELECT COUNT(*) AS c FROM sales WHERE business_id = ?").get(BUSINESS_ID));
console.log(
  "Com cliente:",
  db.prepare("SELECT COUNT(*) AS c FROM sales WHERE business_id = ? AND client_id IS NOT NULL").get(BUSINESS_ID),
);

db.transaction(() => {
  const saleIds = db
    .prepare("SELECT id FROM sales WHERE business_id = ?")
    .all(BUSINESS_ID)
    .map((r) => r.id);

  if (saleIds.length > 0) {
    const placeholders = saleIds.map(() => "?").join(",");
    db.prepare(`DELETE FROM payments WHERE sale_id IN (${placeholders})`).run(...saleIds);
    db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${placeholders})`).run(...saleIds);
    db.prepare(`DELETE FROM sales WHERE business_id = ?`).run(BUSINESS_ID);
  }

  db.prepare("DELETE FROM stock_movements WHERE product_id = ?").run(productId);

  const insertSale = db.prepare(`
    INSERT INTO sales (id, business_id, date, time, client_id, department, payment_method,
      total_amount, total_cost, profit, notes, created_at, updated_at)
    VALUES (?, ?, ?, '00:00', NULL, 'Brigadeiros', 'pix', ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (id, sale_id, method, amount, created_at)
    VALUES (?, ?, 'pix', ?, ?)
  `);

  const insertMovement = db.prepare(`
    INSERT INTO stock_movements (id, product_id, type, quantity, balance_after, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let balance = 0;

  for (const lot of OFFICIAL_LOTS) {
    if (lot.produced > 0) {
      balance += lot.produced;
      insertMovement.run(
        randomUUID(),
        productId,
        "entry",
        lot.produced,
        balance,
        `${lot.label} — produção ${lot.date} (${lot.produced} unidades).`,
        now,
      );
    }

    if (lot.lost > 0) {
      balance -= lot.lost;
      insertMovement.run(
        randomUUID(),
        productId,
        "adjustment",
        lot.lost,
        balance,
        `${lot.label} — ${lot.lost} unidades perdidas no armazenamento.`,
        now,
      );
    }

    if (lot.sold > 0) {
      const saleId = lot.id;
      const itemId = `${saleId}-item`;
      const paymentId = `${saleId}-pay`;
      const unitPrice = lot.revenue / lot.sold;

      insertSale.run(
        saleId,
        BUSINESS_ID,
        lot.date,
        lot.revenue,
        lot.cost,
        lot.profit,
        lot.notes,
        now,
        now,
      );

      insertItem.run(
        itemId,
        saleId,
        productId,
        lot.sold,
        unitPrice,
        lot.cost / lot.sold,
        lot.revenue,
        lot.profit,
      );

      insertPayment.run(paymentId, saleId, lot.revenue, now);

      balance -= lot.sold;
      insertMovement.run(
        randomUUID(),
        productId,
        "exit",
        lot.sold,
        balance,
        `${lot.label} — venda agregada ${lot.date} (${lot.sold} unidades, ${lot.revenue.toFixed(2)}).`,
        now,
      );
    }
  }

  db.prepare(
    `UPDATE products SET stock_quantity = ?, sold_quantity = ?, updated_at = ? WHERE id = ?`,
  ).run(EXPECTED.remaining, EXPECTED.sold, now, productId);
})();

const totals = db.prepare(`
  SELECT
    COALESCE(SUM(total_amount), 0) AS revenue,
    COALESCE(SUM(profit), 0) AS profit,
    COUNT(*) AS sales_cnt,
    SUM(CASE WHEN client_id IS NOT NULL THEN 1 ELSE 0 END) AS with_client
  FROM sales WHERE business_id = ?
`).get(BUSINESS_ID);

const lote001 = db.prepare("SELECT profit FROM sales WHERE id = ?").get("brig-lote-001-2026-07-10");
const lote002 = db.prepare(`
  SELECT COALESCE(SUM(profit), 0) AS profit FROM sales
  WHERE business_id = ? AND id IN ('brig-lote-002-2026-07-18', 'brig-lote-002-fim-2026-07-19')
`).get(BUSINESS_ID);

const units = db.prepare(`
  SELECT COALESCE(SUM(si.quantity), 0) AS sold
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE s.business_id = ?
`).get(BUSINESS_ID);

const prod = db.prepare("SELECT stock_quantity, sold_quantity FROM products WHERE id = ?").get(productId);

const lost = db.prepare(`
  SELECT COALESCE(SUM(quantity), 0) AS lost FROM stock_movements
  WHERE product_id = ? AND type = 'adjustment' AND reason LIKE '%perdidas%'
`).get(productId);

const produced = db.prepare(`
  SELECT COALESCE(SUM(quantity), 0) AS produced FROM stock_movements
  WHERE product_id = ? AND type = 'entry'
`).get(productId);

console.log("\n=== Depois ===");
console.log({ totals, lote001, lote002, units, prod, lost, produced });

const checks = [
  ["Lucro total R$ 128", totals.profit === EXPECTED.totalProfit],
  ["Lote 001 R$ 44", lote001.profit === EXPECTED.lote001Profit],
  ["Lote 002 R$ 84", lote002.profit === EXPECTED.lote002Profit],
  ["Receita R$ 128", totals.revenue === EXPECTED.totalRevenue],
  ["43 vendidas", units.sold === EXPECTED.sold],
  ["45 produzidas", produced.produced === EXPECTED.produced],
  ["2 perdidas", lost.lost === EXPECTED.lost],
  ["0 restantes", prod.stock_quantity === EXPECTED.remaining],
  ["3 vendas agregadas", totals.sales_cnt === 3],
  ["Sem clientes", totals.with_client === 0],
];

console.log("\n=== Validação ===");
for (const [label, pass] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${label}`);
}

db.close();
if (checks.some(([, pass]) => !pass)) process.exit(1);
console.log("\nReconciliação concluída.");
