/**
 * Hotfix homologação — Auditoria read-only 21/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const DATE = "2026-07-21";
const BUSINESS = "salgados";
const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const report = {
  sales: db.prepare(
    `SELECT s.id, s.time, c.name, s.total_amount, s.profit, s.total_cost, s.payment_status, s.payment_date, s.notes,
     GROUP_CONCAT(p.name || ' x' || si.quantity) as products, SUM(si.quantity) as units
     FROM sales s LEFT JOIN clients c ON c.id = s.client_id
     JOIN sale_items si ON si.sale_id = s.id JOIN products p ON p.id = si.product_id
     WHERE s.date = ? AND s.business_id = ? GROUP BY s.id ORDER BY s.time, c.name`,
  ).all(DATE, BUSINESS),
  totals: db.prepare(
    `SELECT COUNT(*) as tx, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit,
     SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending,
     COUNT(DISTINCT client_id) as clients
     FROM sales WHERE date = ? AND business_id = ?`,
  ).get(DATE, BUSINESS),
  units: db.prepare(
    `SELECT SUM(si.quantity) as u FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.date=? AND s.business_id=?`,
  ).get(DATE, BUSINESS),
  investment: db.prepare(`SELECT * FROM investments WHERE business_id=? AND date=?`).get(BUSINESS, DATE),
  cashFlow21: db.prepare(`SELECT * FROM cash_flow WHERE date=?`).all(DATE),
  diary: db.prepare(`SELECT content FROM notes WHERE entity_id=?`).get(`${BUSINESS}:${DATE}`),
  purchase: db.prepare(`SELECT * FROM daily_purchases WHERE business_id=? AND date=?`).get(BUSINESS, DATE),
  // vendas 20/07 com payment_date 21
  deferredFrom20: db.prepare(
    `SELECT s.time, c.name, s.total_amount, s.payment_date FROM sales s JOIN clients c ON c.id=s.client_id
     WHERE s.date='2026-07-20' AND s.payment_date='2026-07-21' AND s.business_id=?`,
  ).all(BUSINESS),
};

console.log(JSON.stringify(report, null, 2));
db.close();
