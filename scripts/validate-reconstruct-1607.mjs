/**
 * Sprint A.3.1 — Validação pós-reconstrução 16/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const DATE = "2026-07-16";
const BUSINESS = "salgados";

function fail(msg) {
  console.error("✗", msg);
  process.exitCode = 1;
}
function ok(msg) {
  console.log("✓", msg);
}

const tx = db.prepare(`SELECT COUNT(*) as c FROM sales WHERE date=? AND business_id=?`).get(DATE, BUSINESS);
const units = db
  .prepare(
    `SELECT SUM(si.quantity) as u FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.date=? AND s.business_id=?`,
  )
  .get(DATE, BUSINESS);
const fin = db
  .prepare(
    `SELECT ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit,
     SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
     FROM sales WHERE date=? AND business_id=?`,
  )
  .get(DATE, BUSINESS);

if (tx.c === 8 && units.u === 9 && fin.rev === 45 && fin.profit === 13.5 && fin.pending === 0) {
  ok("8 vendas · 9 un · R$ 45 · lucro R$ 13,50 · 0 pendentes");
} else {
  fail(`Totais: tx=${tx.c} u=${units.u} rev=${fin.rev} profit=${fin.profit}`);
}

const inv = db.prepare(`SELECT amount FROM investments WHERE date=? AND business_id=?`).get(DATE, BUSINESS);
if (inv?.amount === 31.5) ok("Investimento R$ 31,50");
else fail(`Investimento: ${inv?.amount}`);

const diary = db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${BUSINESS}:${DATE}`);
if (diary) {
  const e = JSON.parse(diary.content);
  if (e.lessonsLearned?.includes("APRENDIZADO 01") && e.quantitySold === 9) {
    ok("Diário operacional estruturado");
  } else fail("Diário incompleto");
} else fail("Diário ausente");

const purchase = db.prepare(`SELECT total_units FROM daily_purchases WHERE business_id=? AND date=?`).get(BUSINESS, DATE);
if (purchase?.total_units === 9) ok("Compra diária: 9 un");
else fail("Compra diária ausente");

const legacy = db
  .prepare(`SELECT COUNT(*) as c FROM notes WHERE entity_type='operation_day' AND entity_id=?`)
  .get(DATE);
if (legacy.c === 0) ok("Notas legadas removidas");
else fail(`Notas legadas: ${legacy.c}`);

const times = db
  .prepare(
    `SELECT s.time, c.name FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date=? ORDER BY s.time, c.name`,
  )
  .all(DATE);
console.log("\nCronologia:");
console.table(times);

db.close();
if (process.exitCode) process.exit(1);
console.log("\nValidação A.3.1 OK — 16/07 homologado.");
