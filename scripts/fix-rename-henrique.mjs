/** Renomeia venda ao pai → Henrique (cliente + diário + venda 20/07). */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const OP_DATE = "2026-07-20";
const ENTITY_ID = "salgados:2026-07-20";
const CLIENT_NAME = "Henrique";

db.transaction(() => {
  let client = db.prepare("SELECT id FROM clients WHERE name = ? LIMIT 1").get(CLIENT_NAME);
  if (!client) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO clients (id, name, sector, company, phone, notes, created_at, updated_at)
       VALUES (?, ?, 'ACAL', NULL, NULL, ?, ?, ?)`,
    ).run(id, CLIENT_NAME, "Comprador — operação Salgados.", now, now);
    client = { id };
    console.log("Cliente criado:", id);
  }

  const sale = db
    .prepare(
      `SELECT id FROM sales WHERE date = ? AND business_id = 'salgados'
       AND (notes LIKE '%pai%' OR notes LIKE '%Henrique%' OR total_amount = 15)
       ORDER BY total_amount DESC LIMIT 1`,
    )
    .get(OP_DATE);

  if (sale) {
    db.prepare(
      `UPDATE sales SET client_id = ?, notes = ?, updated_at = ? WHERE id = ?`,
    ).run(
      client.id,
      "Venda — Henrique — 3 unidades (R$ 15,00).",
      new Date().toISOString(),
      sale.id,
    );
    console.log("Venda atualizada:", sale.id);
  }

  const diary = db.prepare("SELECT id, content FROM notes WHERE entity_id = ?").get(ENTITY_ID);
  if (diary) {
    const entry = JSON.parse(diary.content);
    if (entry.sales?.fatherSale) {
      entry.sales.fatherSale.buyerName = CLIENT_NAME;
    }
    db.prepare("UPDATE notes SET content = ? WHERE id = ?").run(JSON.stringify(entry), diary.id);
    console.log("Diário atualizado");
  }
})();

const check = db
  .prepare(
    `SELECT c.name, s.total_amount, s.notes FROM sales s
     LEFT JOIN clients c ON c.id = s.client_id
     WHERE s.date = ? AND s.total_amount = 15`,
  )
  .get(OP_DATE);
console.table(check);
db.close();
