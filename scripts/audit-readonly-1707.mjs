/**
 * Sprint A.3.2 — Auditoria READ-ONLY do dia 17/07/2026
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const DATE = "2026-07-17";
const BUSINESS = "salgados";
const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
  { readonly: true },
);

const report = {
  sales: db.prepare(
    `SELECT s.time, c.name, s.total_amount, s.profit, s.payment_status, s.amount_received, s.payment_method
     FROM sales s LEFT JOIN clients c ON c.id = s.client_id
     WHERE s.date = ? AND s.business_id = ? ORDER BY s.time, c.name`,
  ).all(DATE, BUSINESS),
  products: db.prepare(
    `SELECT p.name, SUM(si.quantity) as qty FROM sale_items si
     JOIN sales s ON s.id = si.sale_id JOIN products p ON p.id = si.product_id
     WHERE s.date = ? AND s.business_id = ? GROUP BY p.name`,
  ).all(DATE, BUSINESS),
  totals: db.prepare(
    `SELECT COUNT(*) as tx, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit,
     SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
     FROM sales WHERE date = ? AND business_id = ?`,
  ).get(DATE, BUSINESS),
  units: db.prepare(
    `SELECT SUM(si.quantity) as u FROM sale_items si JOIN sales s ON s.id = si.sale_id
     WHERE s.date = ? AND s.business_id = ?`,
  ).get(DATE, BUSINESS),
  uniqueClients: db.prepare(
    `SELECT COUNT(DISTINCT s.client_id) as c FROM sales s WHERE s.date = ? AND s.business_id = ?`,
  ).get(DATE, BUSINESS),
  investment: db.prepare(`SELECT * FROM investments WHERE date = ? AND business_id = ?`).all(DATE, BUSINESS),
  diaryStructured: db.prepare(
    `SELECT content FROM notes WHERE entity_type = 'operational_diary' AND entity_id = ?`,
  ).get(`${BUSINESS}:${DATE}`),
  diaryLegacy: db.prepare(
    `SELECT entity_type, entity_id FROM notes WHERE entity_id LIKE ? OR entity_id = ?`,
  ).all(`%${DATE}%`, DATE),
  purchase: db.prepare(`SELECT * FROM daily_purchases WHERE business_id = ? AND date = ?`).get(BUSINESS, DATE),
  clientsDay: db.prepare(
    `SELECT DISTINCT c.name FROM clients c JOIN sales s ON s.client_id = c.id
     WHERE s.date = ? AND s.business_id = ? ORDER BY c.name`,
  ).all(DATE, BUSINESS),
};

console.log(JSON.stringify(report, null, 2));
db.close();
