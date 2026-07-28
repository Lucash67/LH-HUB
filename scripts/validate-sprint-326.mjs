/**
 * Sprint 3.2.6 — Validação fonte única de dados
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const DATE = "2026-07-20";
const BUSINESS = "salgados";

function fail(msg) {
  console.error("✗", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("✓", msg);
}

const diary = db.prepare("SELECT content FROM notes WHERE entity_id = ?").get(`${BUSINESS}:${DATE}`);
if (!diary) fail("Diário 20/07 ausente");
else ok("Diário 20/07 presente");

const official = diary ? JSON.parse(diary.content) : null;

const daySales = db
  .prepare(
    "SELECT COUNT(*) as c, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit FROM sales WHERE date = ? AND business_id = ?",
  )
  .get(DATE, BUSINESS);

if (daySales.c === 0) fail("Dashboard: zero vendas em 20/07");
else ok(`Dashboard: ${daySales.c} vendas em 20/07 (esperado: 10)`);
if (daySales.c !== 10) fail(`Contagem de vendas: ${daySales.c} (esperado 10)`);

if (official && daySales.rev !== official.revenue.total) {
  fail(`Receita diverge: sales=${daySales.rev} diary=${official.revenue.total}`);
} else {
  ok(`Receita total alinhada: R$ ${daySales.rev}`);
}

const received = db
  .prepare(
    `SELECT ROUND(COALESCE(SUM(amount_received), 0), 2) as rev
     FROM sales WHERE date = ? AND business_id = ?`,
  )
  .get(DATE, BUSINESS);

if (official && received.rev !== official.revenue.received) {
  fail(`Receita recebida diverge: sales=${received.rev} diary=${official.revenue.received}`);
} else {
  ok(`Receita recebida: R$ ${received.rev}`);
}

const pending = db
  .prepare(
    `SELECT COUNT(*) as c FROM sales WHERE date = ? AND business_id = ? AND payment_status = 'pending'`,
  )
  .get(DATE, BUSINESS);
if (pending.c !== 1) fail(`Fiado: ${pending.c} vendas pendentes (esperado 1)`);
else ok("Fiado Mikely: payment_status pending");

const purchase = db
  .prepare("SELECT total_units, investment FROM daily_purchases WHERE business_id = ? AND date = ?")
  .get(BUSINESS, DATE);
if (official?.purchase) {
  if (!purchase) fail("Compra diária não migrada para daily_purchases");
  else if (purchase.total_units !== official.purchase.totalUnits) {
    fail(`Compra unidades: ${purchase.total_units} vs ${official.purchase.totalUnits}`);
  } else {
    ok(`Compra diária: ${purchase.total_units} un · R$ ${purchase.investment}`);
  }
}

const losses = db
  .prepare("SELECT SUM(quantity) as q FROM operational_losses WHERE business_id = ? AND date = ?")
  .get(BUSINESS, DATE);
if (official && (losses?.q ?? 0) !== official.quantityLost) {
  fail(`Perdas divergem: ${losses?.q} vs ${official.quantityLost}`);
} else if (official) {
  ok(`Perdas operacionais: ${losses?.q ?? 0}`);
}

const actions = db
  .prepare("SELECT COUNT(*) as c FROM operational_actions WHERE business_id = ? AND date = ?")
  .get(BUSINESS, DATE);
if (official?.suggestedActions?.length && actions.c < 1) {
  fail("Ações sugeridas não migradas");
} else if (official?.suggestedActions?.length) {
  ok(`Ações operacionais: ${actions.c}`);
}

const hypotheses = db
  .prepare("SELECT COUNT(*) as c FROM product_hypotheses WHERE business_id = ? AND date = ?")
  .get(BUSINESS, DATE);
if (official?.productHypotheses?.length && hypotheses.c < 1) {
  fail("Hipóteses de produto não migradas");
} else if (official?.productHypotheses?.length) {
  ok(`Hipóteses de produto: ${hypotheses.c}`);
}

const goalUnits = db
  .prepare("SELECT target_units FROM goals WHERE business_id = ? AND type = 'daily'")
  .get(BUSINESS);
if (official?.dailyGoalUnits && goalUnits?.target_units !== official.dailyGoalUnits) {
  fail(`Meta unidades: ${goalUnits?.target_units} vs ${official.dailyGoalUnits}`);
} else if (official?.dailyGoalUnits) {
  ok(`Meta diária em unidades: ${goalUnits?.target_units}`);
}

const items = db
  .prepare(
    `SELECT p.name, SUM(si.quantity) as qty
     FROM sale_items si JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE s.date = ? AND s.business_id = ?
     GROUP BY p.name ORDER BY qty DESC`,
  )
  .all(DATE, BUSINESS);

const totalQty = items.reduce((s, r) => s + r.qty, 0);
if (official && totalQty !== official.quantitySold) {
  fail(`Unidades vendidas divergem: sales=${totalQty} diary=${official.quantitySold}`);
} else {
  ok(`Unidades vendidas: ${totalQty}`);
}

const allTime = db
  .prepare(
    `SELECT p.name, SUM(si.quantity) as qty
     FROM sale_items si JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE s.business_id = ?
     GROUP BY p.name ORDER BY name`,
  )
  .all(BUSINESS);

console.log("\nProdutos (sale_items — fonte única):");
console.table(allTime);

const inv = db
  .prepare("SELECT amount FROM investments WHERE date = ? AND business_id = ?")
  .get(DATE, BUSINESS);
if (official && inv?.amount === official.purchase.investment) {
  ok(`Investimento 20/07: R$ ${inv.amount}`);
} else if (official) {
  fail(`Investimento diverge: ${inv?.amount} vs ${official.purchase.investment}`);
}

db.close();
if (process.exitCode) {
  console.log("\nValidação FALHOU.");
  process.exit(1);
}
console.log("\nValidação OK.");
