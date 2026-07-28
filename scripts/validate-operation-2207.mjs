/**
 * Validação — Operação oficial 22/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const B = "salgados";
const D = "2026-07-22";
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
};

if (fin.tx === 11 && fin.u === 14 && fin.rev === 70 && fin.profit === 17.5) {
  ok("Operação: 11 tx · 14 un · R$ 70 · lucro R$ 17,50");
} else {
  fail(`Operação: tx=${fin.tx} u=${fin.u} rev=${fin.rev} profit=${fin.profit}`);
}

const margin = fin.rev > 0 ? Math.round((fin.profit / fin.rev) * 10000) / 100 : 0;
if (margin === 25) ok("Margem 25%");
else fail(`Margem: ${margin}%`);

const inv = db
  .prepare(
    `SELECT ROUND(SUM(amount),2) total,
     ROUND(SUM(CASE WHEN source_type='own_capital' THEN amount ELSE 0 END),2) own,
     ROUND(SUM(CASE WHEN source_type='family' THEN amount ELSE 0 END),2) third
     FROM investments WHERE business_id=? AND date=?`,
  )
  .get(B, D);
if (inv.total === 52.5 && inv.own === 22.5 && inv.third === 30) {
  ok("Investimento R$ 52,50 (próprio R$ 22,50 + Henrique R$ 30,00)");
} else {
  fail(`Investimento: ${JSON.stringify(inv)}`);
}

const henrique = db
  .prepare(
    `SELECT SUM(si.quantity) u FROM sale_items si
     JOIN sales s ON s.id=si.sale_id
     JOIN clients c ON c.id=s.client_id
     WHERE s.date=? AND s.business_id=? AND c.name LIKE '%Trabalho do Henrique%'`,
  )
  .get(D, B);
if (henrique.u === 3) ok("Trabalho do Henrique: 3 Croissant");
else fail(`Henrique: ${henrique.u} un`);

const cash = db
  .prepare(
    `SELECT COUNT(*) c FROM sales WHERE date=? AND business_id=? AND payment_method='cash'`,
  )
  .get(D, B);
if (cash.c === 1) ok("1 venda em dinheiro (2 un — cliente não identificado)");
else fail(`Vendas cash: ${cash.c}`);

const unknown = db
  .prepare(
    `SELECT SUM(si.quantity) u FROM sale_items si
     JOIN sales s ON s.id=si.sale_id
     JOIN products p ON p.id=si.product_id
     WHERE s.date=? AND s.business_id=? AND p.name LIKE '%sabor não identificado%'`,
  )
  .get(D, B);
if (unknown.u === 3) ok("3 unidades com sabor não identificado registradas");
else fail(`Sabor não identificado: ${unknown.u} un`);

const diary = db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${B}:${D}`);
if (diary?.content.includes("pastel em investigação")) ok("Diário — pastel em investigação");
else fail("Diário sem pendência de investigação");

if (diary?.content.includes('"profit":17.5') || diary?.content.includes('"profit":17.50')) {
  ok("Diário — lucro R$ 17,50");
} else {
  fail("Diário — lucro incorreto");
}

const purchase = db
  .prepare(`SELECT total_units, investment FROM daily_purchases WHERE business_id=? AND date=?`)
  .get(B, D);
if (purchase?.total_units === 15 && purchase?.investment === 52.5) ok("Daily purchase: 15 un · R$ 52,50");
else fail(`Daily purchase: ${JSON.stringify(purchase)}`);

const losses = db
  .prepare(`SELECT COUNT(*) c FROM operational_losses WHERE business_id=? AND date=?`)
  .get(B, D);
if (losses.c === 0) ok("0 perdas operacionais (pastel em investigação, não perda)");
else fail(`Perdas: ${losses.c}`);

const actions = db
  .prepare(`SELECT COUNT(*) c FROM operational_actions WHERE business_id=? AND date=?`)
  .get(B, D);
if (actions.c >= 3) ok(`${actions.c} ações operacionais registradas`);
else fail(`Ações: ${actions.c}`);

for (const [date, tx, rev, profit] of [
  ["2026-07-16", 8, 45, 13.5],
  ["2026-07-17", 12, 60, 18],
  ["2026-07-20", 11, 75, 22.5],
  ["2026-07-21", 10, 60, 16],
]) {
  const row = db
    .prepare(
      `SELECT COUNT(*) c, ROUND(SUM(total_amount),2) r, ROUND(SUM(profit),2) p FROM sales WHERE date=? AND business_id=?`,
    )
    .get(date, B);
  if (row.c === tx && row.r === rev && row.p === profit) ok(`${date} baseline inalterado`);
  else fail(`${date} alterado: ${JSON.stringify(row)}`);
}

const newClients = db
  .prepare(
    `SELECT COUNT(*) c FROM clients WHERE name IN ('Alexandre Soares de Souza','Francisco Anderson das Chagas','Bernardo Ferreira Domingo')`,
  )
  .get();
if (newClients.c >= 3) ok("Clientes novos registrados");
else fail(`Clientes novos: ${newClients.c}`);

db.close();
if (failures) process.exit(1);
console.log("\nValidação operação 22/07/2026 OK");
