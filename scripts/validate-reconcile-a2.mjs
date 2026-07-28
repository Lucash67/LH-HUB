/**
 * Sprint A.2 — Validação pós-reconciliação 20/07 → 21/07
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

function fail(msg) {
  console.error("✗", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("✓", msg);
}

const BUSINESS = "salgados";
const DATE_20 = "2026-07-20";
const DATE_21 = "2026-07-21";

function getSale(clientLike, time) {
  return db
    .prepare(
      `SELECT s.*, c.name FROM sales s JOIN clients c ON c.id = s.client_id
       WHERE s.business_id = ? AND s.date = ? AND c.name LIKE ? AND s.time = ?`,
    )
    .get(BUSINESS, DATE_20, clientLike, time);
}

const mikely = getSale("%Mikelly%", "10:55");
if (
  mikely?.payment_status === "paid" &&
  mikely.amount_received === 5 &&
  mikely.payment_date === DATE_21
) {
  ok("Venda Mikely reconciliada (paid · R$ 5 · payment_date 21/07)");
} else {
  fail(`Mikely: ${JSON.stringify(mikely)}`);
}

const anselmo = getSale("%Anselmo%", "16:00");
if (
  anselmo?.payment_status === "paid" &&
  anselmo.amount_received === 5 &&
  anselmo.payment_date === DATE_21
) {
  ok("Venda Anselmo reconciliada (paid · R$ 5 · payment_date 21/07)");
} else {
  fail(`Anselmo: ${JSON.stringify(anselmo)}`);
}

const d20 = db.prepare(
  `SELECT COUNT(DISTINCT s.id) as vendas, SUM(si.quantity) as units,
   (SELECT ROUND(SUM(amount_received),2) FROM sales WHERE date = ? AND business_id = ?) as rec,
   (SELECT COUNT(*) FROM sales WHERE date = ? AND business_id = ? AND payment_status='pending') as pending
   FROM sales s JOIN sale_items si ON si.sale_id = s.id
   WHERE s.date = ? AND s.business_id = ?`,
).get(DATE_20, BUSINESS, DATE_20, BUSINESS, DATE_20, BUSINESS);

const losses = db
  .prepare(`SELECT COALESCE(SUM(quantity),0) as q FROM operational_losses WHERE date = ?`)
  .get(DATE_20).q;

if (d20.vendas === 11 && d20.units === 15 && d20.rec === 75 && d20.pending === 0 && losses === 0) {
  ok("Dia 20 corrigido: 11 vendas · 15 un · R$ 75 recebido · 0 perdas");
} else {
  fail(`Dia 20: ${JSON.stringify({ ...d20, losses })}`);
}

const d21 = db
  .prepare(
    `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev,
     SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
     FROM sales WHERE date = ? AND business_id = ?`,
  )
  .get(DATE_21, BUSINESS);

if (d21.vendas === 10 && d21.rev === 60 && d21.pending === 0) {
  ok("Dia 21 permanece inalterado");
} else {
  fail(`Dia 21 alterado: ${JSON.stringify(d21)}`);
}

const cf = db
  .prepare(
    `SELECT COUNT(*) as c, ROUND(SUM(amount),2) as total FROM cash_flow
     WHERE date = ? AND category = 'recebimento_venda_anterior'`,
  )
  .get(DATE_21);

if (cf.c === 2 && cf.total === 10) {
  ok(`Cash Flow 21/07: R$ ${cf.total} em recebimentos de vendas anteriores`);
} else {
  fail(`Cash flow: ${JSON.stringify(cf)}`);
}

const mikelyCrm = db
  .prepare(
    `SELECT COUNT(s.id) as purchases, ROUND(SUM(COALESCE(s.amount_received,0)),2) as received,
     ROUND(SUM(s.total_amount - COALESCE(s.amount_received,0)),2) as pending
     FROM sales s JOIN clients c ON c.id = s.client_id
     WHERE c.name LIKE '%Mikelly%' AND s.business_id = ?`,
  )
  .get(BUSINESS);

if (mikelyCrm.purchases === 3 && mikelyCrm.received === 15 && mikelyCrm.pending === 0) {
  ok("CRM Mikely: 3 compras · R$ 15 recebido · R$ 0 pendente");
} else {
  fail(`CRM Mikely: ${JSON.stringify(mikelyCrm)}`);
}

const pendingSalgados20 = db
  .prepare(
    `SELECT COUNT(*) as c FROM sales WHERE business_id = ? AND date = ? AND payment_status = 'pending'`,
  )
  .get(BUSINESS, DATE_20).c;

if (pendingSalgados20 === 0) {
  ok("Nenhuma pendência fantasma em 20/07");
} else {
  fail(`${pendingSalgados20} pendência(s) restante(s) em 20/07`);
}

db.close();
if (process.exitCode) {
  console.log("\nValidação A.2 FALHOU.");
  process.exit(1);
}
console.log("\nValidação A.2 OK — dias 20 e 21 homologados.");
