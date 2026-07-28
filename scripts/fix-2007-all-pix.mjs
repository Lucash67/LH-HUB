/** Corrige venda ao pai 20/07 — pagamento foi PIX, não dinheiro. */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const sale = db
  .prepare(
    "SELECT id, payment_method, total_amount FROM sales WHERE date = '2026-07-20' AND notes LIKE '%pai%' LIMIT 1",
  )
  .get();

if (!sale) {
  console.error("Venda ao pai não encontrada.");
  process.exit(1);
}

db.transaction(() => {
  db.prepare("UPDATE sales SET payment_method = 'pix', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    sale.id,
  );
  db.prepare("UPDATE payments SET method = 'pix' WHERE sale_id = ?").run(sale.id);
})();

const breakdown = db
  .prepare(
    `SELECT payment_method, ROUND(SUM(total_amount),2) as total
     FROM sales WHERE date = '2026-07-20' AND business_id = 'salgados'
     GROUP BY payment_method`,
  )
  .all();

console.log("Corrigido:", sale.id);
console.table(breakdown);
db.close();
