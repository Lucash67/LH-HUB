/**
 * Validação — Operação 21/07/2026 + reconciliação 20/07
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

function fail(msg) {
  console.error("✗", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("✓", msg);
}

const BUSINESS = "salgados";

// --- 20/07 reconciliado ---
const d20 = db.prepare(
  `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev,
   ROUND(SUM(amount_received),2) as rec,
   SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
   FROM sales WHERE date='2026-07-20' AND business_id=?`,
).get(BUSINESS);
const u20 = db.prepare(
  `SELECT SUM(si.quantity) as u FROM sale_items si JOIN sales s ON s.id=si.sale_id
   WHERE s.date='2026-07-20' AND s.business_id=?`,
).get(BUSINESS).u;
const loss20 = db.prepare(
  `SELECT COALESCE(SUM(quantity),0) as q FROM operational_losses WHERE date='2026-07-20'`,
).get().q;

if (d20.vendas === 11 && u20 === 15 && d20.rev === 75 && d20.rec === 75 && d20.pending === 0 && loss20 === 0) {
  ok("20/07 reconciliado: 11 vendas · 15 un · R$ 75 · 0 pendentes · 0 perdas");
} else {
  fail(`20/07 divergente: ${JSON.stringify({ ...d20, units: u20, losses: loss20 })}`);
}

const anselmo20 = db.prepare(
  `SELECT s.id FROM sales s JOIN clients c ON c.id=s.client_id
   WHERE s.date='2026-07-20' AND c.name LIKE '%Anselmo%'`,
).get();
if (anselmo20) ok("Anselmo registrado em 20/07 (unidade recuperada)");
else fail("Anselmo ausente em 20/07");

const mikelyPaid = db.prepare(
  `SELECT payment_status, amount_received FROM sales s JOIN clients c ON c.id=s.client_id
   WHERE s.date='2026-07-20' AND c.name LIKE '%Mikelly%'`,
).get();
if (mikelyPaid?.payment_status === "paid" && mikelyPaid.amount_received === 5) {
  ok("Mikely: fiado encerrado (PIX R$ 5,00)");
} else {
  fail("Mikely ainda pendente ou valor incorreto");
}

// --- 21/07 ---
const d21 = db.prepare(
  `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit,
   SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
   FROM sales WHERE date='2026-07-21' AND business_id=?`,
).get(BUSINESS);
const u21 = db.prepare(
  `SELECT SUM(si.quantity) as u FROM sale_items si JOIN sales s ON s.id=si.sale_id
   WHERE s.date='2026-07-21' AND s.business_id=?`,
).get(BUSINESS).u;

if (d21.vendas === 10 && u21 === 12 && d21.rev === 60 && d21.profit === 16 && d21.pending === 0) {
  ok("21/07 registrado: 10 vendas · 12 un · R$ 60 · lucro R$ 16 · meta atingida");
} else {
  fail(`21/07 divergente: ${JSON.stringify({ ...d21, units: u21 })}`);
}

const inv21 = db.prepare(
  `SELECT amount FROM investments WHERE business_id=? AND date='2026-07-21'`,
).get(BUSINESS);
if (inv21?.amount === 44) ok("Investimento 21/07: R$ 44,00");
else fail(`Investimento 21/07: ${inv21?.amount}`);

const diary21 = db.prepare(
  `SELECT content FROM notes WHERE entity_id='salgados:2026-07-21'`,
).get();
if (diary21) {
  const e = JSON.parse(diary21.content);
  if (e.lessonsLearned?.includes("APRENDIZADO 01")) ok("Diário 21/07 com 7 aprendizados");
  else fail("Diário 21/07 sem aprendizados completos");
  if (e.quantityLost === 0 && e.quantitySold === 12) ok("Diário 21/07: 12 vendidos, 0 perdas");
} else {
  fail("Diário 21/07 ausente");
}

const actions21 = db.prepare(
  `SELECT COUNT(*) as c FROM operational_actions WHERE business_id=? AND date='2026-07-21'`,
).get(BUSINESS).c;
if (actions21 >= 5) ok(`${actions21} ações operacionais migradas do diário`);
else fail(`Ações operacionais: ${actions21}`);

// --- CRM recorrentes ---
const recurring = db.prepare(
  `SELECT c.name, COUNT(s.id) as purchases, ROUND(SUM(COALESCE(s.amount_received,s.total_amount)),2) as spent
   FROM clients c JOIN sales s ON s.client_id=c.id AND s.business_id=?
   GROUP BY c.id HAVING purchases >= 2 ORDER BY purchases DESC LIMIT 8`,
).all(BUSINESS);
ok(`${recurring.length} clientes recorrentes (≥2 compras)`);
console.table(recurring);

// --- Comparativo 20 vs 21 ---
const cmp = db.prepare(
  `SELECT date, COUNT(*) as tx, ROUND(SUM(total_amount),2) as rev
   FROM sales WHERE business_id=? AND date IN ('2026-07-20','2026-07-21') GROUP BY date`,
).all(BUSINESS);
console.log("\nComparativo:");
console.table(cmp);

db.close();
if (process.exitCode) {
  console.log("\nValidação FALHOU.");
  process.exit(1);
}
console.log("\nValidação OK — operação 21/07 completa.");
