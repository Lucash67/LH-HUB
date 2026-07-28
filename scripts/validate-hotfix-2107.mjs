/**
 * Hotfix homologação — Validação 21/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const B = "salgados";
const D = "2026-07-21";
let failures = 0;

function fail(msg) {
  console.error("✗", msg);
  failures++;
}
function ok(msg) {
  console.log("✓", msg);
}

const fin = {
  tx: db.prepare(`SELECT COUNT(*) c FROM sales WHERE date=? AND business_id=?`).get(D, B).c,
  u: db
    .prepare(
      `SELECT SUM(si.quantity) u FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.date=? AND s.business_id=?`,
    )
    .get(D, B).u,
  rev: db.prepare(`SELECT ROUND(SUM(total_amount),2) r FROM sales WHERE date=? AND business_id=?`).get(D, B).r,
  profit: db.prepare(`SELECT ROUND(SUM(profit),2) p FROM sales WHERE date=? AND business_id=?`).get(D, B).p,
  clients: db
    .prepare(`SELECT COUNT(DISTINCT client_id) c FROM sales WHERE date=? AND business_id=?`)
    .get(D, B).c,
  pending: db
    .prepare(`SELECT SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) p FROM sales WHERE date=? AND business_id=?`)
    .get(D, B).p,
};

if (fin.tx === 10 && fin.u === 12 && fin.rev === 60 && fin.profit === 16 && fin.clients === 10 && fin.pending === 0) {
  ok("Operação: 10 tx · 12 un · R$ 60 · lucro R$ 16 · 10 clientes · 0 pendências");
} else fail(`Operação: ${JSON.stringify(fin)}`);

const margin = Math.round((fin.profit / fin.rev) * 10000) / 100;
if (margin === 26.67) ok("Margem 26,67%");
else fail(`Margem: ${margin}%`);

const inv = db.prepare(`SELECT amount, source_type, source_name FROM investments WHERE business_id=? AND date=?`).get(B, D);
if (inv?.amount === 44 && inv.source_type === "family" && inv.source_name === "Henrique") {
  ok("Investimento R$ 44 · Familiar · Henrique");
} else fail(`Investimento: ${JSON.stringify(inv)}`);

const cf = db
  .prepare(
    `SELECT COUNT(*) c, ROUND(SUM(amount),2) total FROM cash_flow
     WHERE date=? AND category='recebimento_venda_anterior'`,
  )
  .get(D);
if (cf.c === 2 && cf.total === 10) ok("Recebimentos dia 20: R$ 10 (2 PIX — não vendas do 21)");
else fail(`Cash flow: ${JSON.stringify(cf)}`);

// Vendas 21 não devem incluir payment_date diferente do dia (liquidações ficam no cash_flow)
const wrongPay = db
  .prepare(
    `SELECT COUNT(*) c FROM sales WHERE date=? AND business_id=? AND payment_date IS NOT NULL AND payment_date != date`,
  )
  .get(D, B);
if (wrongPay.c === 0) ok("Vendas 21/07 sem liquidações do dia 20 misturadas");
else fail(`Vendas com payment_date divergente: ${wrongPay.c}`);

const diary = db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${B}:${D}`);
if (diary?.content.includes("RECEBIMENTOS DO DIA 20")) ok("Diário distingue vendas vs recebimentos");
else fail("Diário sem separação recebimentos");

for (const [date, tx, rev, profit] of [
  ["2026-07-16", 8, 45, 13.5],
  ["2026-07-17", 12, 60, 18],
  ["2026-07-20", 11, 75, 22.5],
]) {
  const row = db
    .prepare(
      `SELECT COUNT(*) c, ROUND(SUM(total_amount),2) r, ROUND(SUM(profit),2) p FROM sales WHERE date=? AND business_id=?`,
    )
    .get(date, B);
  if (row.c === tx && row.r === rev && row.p === profit) ok(`${date} inalterado`);
  else fail(`${date} alterado: ${JSON.stringify(row)}`);
}

db.close();
if (failures) process.exit(1);
console.log("\nValidação hotfix 21/07 OK");
