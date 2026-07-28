import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"));

console.log("=== INVESTMENTS ===");
console.log(db.prepare("SELECT id, description, amount, type, date FROM investments ORDER BY date").all());

console.log("\n=== BRIGADEIROS SALES BY DATE ===");
console.log(
  db.prepare(`
    SELECT s.date,
           COUNT(*) AS sales_cnt,
           SUM(s.total_amount) AS revenue,
           SUM(s.profit) AS profit,
           (SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si WHERE si.sale_id IN (SELECT id FROM sales WHERE business_id='brigadeiros' AND date=s.date)) AS units
    FROM sales s
    WHERE s.business_id = 'brigadeiros'
    GROUP BY s.date
    ORDER BY s.date
  `).all(),
);

console.log("\n=== BRIGADEIROS PRODUCT ===");
console.log(db.prepare("SELECT id, name, price, cost FROM products WHERE business_id = 'brigadeiros'").all());

console.log("\n=== CLIENTS BY OPERATION (via sales) ===");
console.log(
  db.prepare(`
    SELECT s.business_id, c.name, COUNT(*) AS purchases
    FROM sales s
    JOIN clients c ON c.id = s.client_id
    GROUP BY s.business_id, c.id
    ORDER BY s.business_id, c.name
  `).all(),
);

db.close();
