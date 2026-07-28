import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"));

for (const date of ["2026-07-18", "2026-07-19"]) {
  console.log(`\n=== ${date} ===`);
  const rows = db.prepare(`
    SELECT s.id, s.time, s.total_amount, s.profit, c.name AS client,
           (SELECT SUM(quantity) FROM sale_items WHERE sale_id = s.id) AS qty
    FROM sales s
    LEFT JOIN clients c ON c.id = s.client_id
    WHERE s.business_id = 'brigadeiros' AND s.date = ?
    ORDER BY s.time
  `).all(date);
  console.table(rows);
}

db.close();
