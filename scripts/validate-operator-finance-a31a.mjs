/**
 * Sprint A.3.1.a — Validação modelagem operação × operador
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new Database(path.join(ROOT, "data", "lucas-business-os.db"), { readonly: true });

// Garante colunas existem (readonly abre DB — migration já aplicada pelo app ou register script)
const DATE = "2026-07-16";
const BUSINESS = "salgados";
let failures = 0;

function fail(msg) {
  console.error("✗", msg);
  failures++;
}
function ok(msg) {
  console.log("✓", msg);
}

// 1. Investimento 16/07 com fonte
const inv16 = db
  .prepare(`SELECT source_type, source_name, amount FROM investments WHERE business_id=? AND date=?`)
  .get(BUSINESS, DATE);
if (inv16?.source_type === "family" && inv16?.source_name === "Henrique" && inv16?.amount === 31.5) {
  ok("Fonte investimento 16/07: Familiar · Henrique · R$ 31,50");
} else {
  fail(`Fonte 16/07: ${JSON.stringify(inv16)}`);
}

// 2. Lucro operacional 16/07 preservado
const fin16 = db
  .prepare(
    `SELECT ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit FROM sales WHERE business_id=? AND date=?`,
  )
  .get(BUSINESS, DATE);
if (fin16?.rev === 45 && fin16?.profit === 13.5) {
  ok("Lucro operacional 16/07 preservado: R$ 13,50");
} else {
  fail(`Lucro 16/07: rev=${fin16?.rev} profit=${fin16?.profit}`);
}

// 3. Outros dias inalterados (lucro operacional)
const fin20 = db
  .prepare(`SELECT COUNT(*) as c, ROUND(SUM(profit),2) as profit FROM sales WHERE business_id=? AND date='2026-07-20'`)
  .get(BUSINESS);
const fin21 = db
  .prepare(`SELECT COUNT(*) as c, ROUND(SUM(profit),2) as profit FROM sales WHERE business_id=? AND date='2026-07-21'`)
  .get(BUSINESS);
if (fin20?.c === 11 && fin20?.profit === 22.5) ok("Dia 20/07 inalterado");
else fail(`Dia 20/07: ${JSON.stringify(fin20)}`);
if (fin21?.c === 10 && fin21?.profit === 16) ok("Dia 21/07 inalterado");
else fail(`Dia 21/07: ${JSON.stringify(fin21)}`);

// 4. Investimento 17/07 sem fonte (não alterado nesta sprint)
const inv17 = db
  .prepare(`SELECT source_type FROM investments WHERE business_id=? AND date='2026-07-17'`)
  .get(BUSINESS);
if (inv17?.source_type == null) ok("Investimento 17/07 sem alteração de fonte");
else fail(`17/07 source_type deveria ser null: ${inv17?.source_type}`);

// 5. Cálculo dual inline (sem depender de TS import)
const sales16 = db
  .prepare(
    `SELECT date, total_amount, profit, total_cost, payment_status, amount_received, payment_date
     FROM sales WHERE business_id=? AND date=?`,
  )
  .all(BUSINESS, DATE);
const invRows = db
  .prepare(`SELECT id, amount, type, date, description, source_type, source_name, business_id FROM investments WHERE business_id=? AND date=?`)
  .all(BUSINESS, DATE)
  .map((r) => ({
    id: r.id,
    amount: r.amount,
    type: r.type,
    date: r.date,
    description: r.description,
    sourceType: r.source_type,
    sourceName: r.source_name,
    businessId: r.business_id,
  }));

const revenue = sales16.reduce((s, v) => s + v.total_amount, 0);
const profit = sales16.reduce((s, v) => s + v.profit, 0);
const cashIn = sales16.reduce((s, v) => s + (v.amount_received ?? v.total_amount), 0);
const thirdParty = invRows.filter((i) => i.sourceType && i.sourceType !== "own_capital").reduce((s, i) => s + i.amount, 0);
const ownInv = invRows.filter((i) => i.sourceType === "own_capital").reduce((s, i) => s + i.amount, 0);
const operatorNet = cashIn - ownInv;

if (revenue === 45 && profit === 13.5) ok("Operação: receita R$ 45 · lucro R$ 13,50");
else fail(`Operação: rev=${revenue} profit=${profit}`);

if (thirdParty === 31.5 && ownInv === 0 && cashIn === 45 && operatorNet === 45) {
  ok("Operador: invest. terceiros R$ 31,50 · caixa in R$ 45 · out R$ 0 · ganho R$ 45");
} else {
  fail(`Operador: third=${thirdParty} own=${ownInv} in=${cashIn} net=${operatorNet}`);
}

const margin = Math.round((profit / revenue) * 100);
if (margin === 30) ok("Margem operacional 30%");
else fail(`Margem: ${margin}%`);

db.close();

if (failures > 0) {
  console.error(`\n${failures} falha(s)`);
  process.exit(1);
}
console.log("\nValidação A.3.1.a OK");
