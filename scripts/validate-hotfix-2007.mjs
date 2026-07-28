/**
 * Hotfix homologação — Validação 20/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const B = "salgados";
const D = "2026-07-20";
let failures = 0;

function fail(msg) {
  console.error("✗", msg);
  failures++;
}
function ok(msg) {
  console.log("✓", msg);
}

const tx = db.prepare(`SELECT COUNT(*) c FROM sales WHERE date=? AND business_id=?`).get(D, B).c;
const u = db
  .prepare(
    `SELECT SUM(si.quantity) u FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.date=? AND s.business_id=?`,
  )
  .get(D, B).u;
const rev = db.prepare(`SELECT ROUND(SUM(total_amount),2) r FROM sales WHERE date=? AND business_id=?`).get(D, B).r;
const profit = db.prepare(`SELECT ROUND(SUM(profit),2) p FROM sales WHERE date=? AND business_id=?`).get(D, B).p;
const pending = db
  .prepare(`SELECT SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) p FROM sales WHERE date=? AND business_id=?`)
  .get(D, B).p;

if (tx === 11 && u === 15 && rev === 75 && profit === 22.5 && pending === 0) {
  ok("Operação: 11 vendas · 15 un · R$ 75 · lucro R$ 22,50 · 0 pendentes");
} else fail(`Operação: tx=${tx} u=${u} rev=${rev} profit=${profit} pending=${pending}`);

const inv = db.prepare(`SELECT amount, source_type, source_name FROM investments WHERE business_id=? AND date=?`).get(B, D);
if (inv?.amount === 52.5 && inv.source_type === "family" && inv.source_name === "Henrique") {
  ok("Investimento R$ 52,50 · Familiar · Henrique");
} else fail(`Investimento: ${JSON.stringify(inv)}`);

const henrique = db
  .prepare(
    `SELECT s.time, SUM(si.quantity) q FROM sales s JOIN clients c ON c.id=s.client_id
     JOIN sale_items si ON si.sale_id=s.id WHERE s.date=? AND c.name='Henrique' GROUP BY s.id`,
  )
  .get(D);
if (henrique?.time === "21:00" && henrique?.q === 3) ok("Henrique 21:00 · 3 Croissants (sobras)");
else fail(`Henrique: ${JSON.stringify(henrique)}`);

const mikely = db
  .prepare(
    `SELECT payment_status, payment_date, amount_received FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date=? AND c.name LIKE '%Mikelly%'`,
  )
  .get(D);
if (mikely?.payment_status === "paid" && mikely?.payment_date === "2026-07-21" && mikely?.amount_received === 5) {
  ok("Mikely: venda 20/07 · PAID · payment_date 21/07");
} else fail(`Mikely: ${JSON.stringify(mikely)}`);

const anselmo = db
  .prepare(
    `SELECT payment_status, payment_date FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date=? AND c.name LIKE '%Anselmo%'`,
  )
  .get(D);
if (anselmo?.payment_status === "paid" && anselmo?.payment_date === "2026-07-21") {
  ok("Anselmo: venda 20/07 · recebimento 21/07");
} else fail(`Anselmo: ${JSON.stringify(anselmo)}`);

const cf = db
  .prepare(
    `SELECT COUNT(*) c, ROUND(SUM(amount),2) t FROM cash_flow WHERE date='2026-07-21' AND category='recebimento_venda_anterior'`,
  )
  .get();
if (cf.c === 2 && cf.t === 10) ok("Cash flow 21/07: R$ 10 recebimentos dia 20");
else fail(`Cash flow: ${JSON.stringify(cf)}`);

const losses = db.prepare(`SELECT COUNT(*) c FROM operational_losses WHERE business_id=? AND date=?`).get(B, D).c;
if (losses === 0) ok("0 perdas operacionais");
else fail(`Perdas: ${losses}`);

const diary = db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${B}:${D}`);
if (diary?.content.includes("Lucro operacional R$ 22,50")) ok("Diário com lucro oficial");
else fail("Diário incompleto");

for (const [date, t, r, p] of [
  ["2026-07-16", 8, 45, 13.5],
  ["2026-07-17", 12, 60, 18],
  ["2026-07-21", 10, 60, 16],
]) {
  const row = db
    .prepare(
      `SELECT COUNT(*) c, ROUND(SUM(total_amount),2) r, ROUND(SUM(profit),2) p FROM sales WHERE date=? AND business_id=?`,
    )
    .get(date, B);
  if (row.c === t && row.r === r && row.p === p) ok(`${date} inalterado`);
  else fail(`${date} alterado: ${JSON.stringify(row)}`);
}

const times = db
  .prepare(
    `SELECT s.time, c.name, s.total_amount, s.payment_date FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date=? ORDER BY s.time, c.name`,
  )
  .all(D);
console.log("\nCronologia 20/07:");
console.table(times);

db.close();
if (failures) process.exit(1);
console.log("\nValidação hotfix 20/07 OK");
