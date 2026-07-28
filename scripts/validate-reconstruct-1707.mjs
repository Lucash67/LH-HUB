/**
 * Sprint A.3.2 — Validação pós-reconstrução 17/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const DATE = "2026-07-17";
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
     SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending,
     COUNT(DISTINCT client_id) as clients
     FROM sales WHERE date=? AND business_id=?`,
  )
  .get(DATE, BUSINESS);

if (tx.c === 12 && units.u === 12 && fin.rev === 60 && fin.profit === 18 && fin.pending === 0 && fin.clients === 11) {
  ok("12 vendas · 12 un · R$ 60 · lucro R$ 18 · 11 clientes · 0 pendentes");
} else {
  fail(`Totais: tx=${tx.c} u=${units.u} rev=${fin.rev} profit=${fin.profit} pending=${fin.pending} clients=${fin.clients}`);
}

const inv = db
  .prepare(`SELECT amount, source_type, source_name FROM investments WHERE date=? AND business_id=?`)
  .get(DATE, BUSINESS);
if (inv?.amount === 42 && inv?.source_type === "family" && inv?.source_name === "Henrique") {
  ok("Investimento R$ 42 · Familiar · Henrique");
} else {
  fail(`Investimento: ${JSON.stringify(inv)}`);
}

const diary = db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${BUSINESS}:${DATE}`);
if (diary) {
  const e = JSON.parse(diary.content);
  if (e.lessonsLearned?.includes("APRENDIZADO 01") && e.quantitySold === 12 && e.profit === 18) {
    ok("Diário operacional estruturado ROO-0002");
  } else fail("Diário incompleto");
} else fail("Diário ausente");

const purchase = db.prepare(`SELECT total_units FROM daily_purchases WHERE business_id=? AND date=?`).get(BUSINESS, DATE);
if (purchase?.total_units === 12) ok("Compra diária: 12 un");
else fail("Compra diária ausente");

const raimunda = db
  .prepare(
    `SELECT COUNT(*) as c FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date=? AND c.name='Raimunda Raimunda Sousa'`,
  )
  .get(DATE);
if (raimunda?.c === 2) ok("Raimunda recorrente (2 compras)");
else fail(`Raimunda: ${raimunda?.c} compras`);

// Dias homologados inalterados
const d16 = db
  .prepare(`SELECT COUNT(*) c, ROUND(SUM(profit),2) p FROM sales WHERE date='2026-07-16' AND business_id=?`)
  .get(BUSINESS);
const d20 = db
  .prepare(`SELECT COUNT(*) c, ROUND(SUM(profit),2) p FROM sales WHERE date='2026-07-20' AND business_id=?`)
  .get(BUSINESS);
const d21 = db
  .prepare(`SELECT COUNT(*) c, ROUND(SUM(profit),2) p FROM sales WHERE date='2026-07-21' AND business_id=?`)
  .get(BUSINESS);
if (d16?.c === 8 && d16?.p === 13.5) ok("Dia 16/07 inalterado");
else fail(`16/07: ${JSON.stringify(d16)}`);
if (d20?.c === 11 && d20?.p === 22.5) ok("Dia 20/07 inalterado");
else fail(`20/07: ${JSON.stringify(d20)}`);
if (d21?.c === 10 && d21?.p === 16) ok("Dia 21/07 inalterado");
else fail(`21/07: ${JSON.stringify(d21)}`);

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
console.log("\nValidação A.3.2 OK — 17/07 homologado. Consolidação Histórica concluída.");
