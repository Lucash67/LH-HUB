/**
 * Sprint 2.5.1 — Aplica migração business_id em investments + seed R$42 Salgados.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const cols = db.prepare("PRAGMA table_info(investments)").all();
if (!cols.some((c) => c.name === "business_id")) {
  db.exec(`ALTER TABLE investments ADD COLUMN business_id TEXT NOT NULL DEFAULT 'salgados'`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_investments_business ON investments(business_id)`);
}

db.exec(`UPDATE investments SET business_id = 'salgados' WHERE business_id IS NULL OR business_id = ''`);

const existing = db
  .prepare("SELECT id FROM investments WHERE business_id = 'salgados' AND date = '2026-07-17' AND amount = 42")
  .get();
if (!existing) {
  db.prepare(
    `INSERT INTO investments (id, business_id, description, amount, type, date, created_at)
     VALUES (?, 'salgados', ?, 42, 'additional', '2026-07-17', datetime('now'))`,
  ).run(
    "acal-inv-2026-07-17-42",
    "Investimento R$42,00 (pai do operador) — aquisição de produtos ACAL. Dia 17/07/2026.",
  );
}

console.log("Investments:", db.prepare("SELECT date, amount, type, business_id FROM investments ORDER BY date").all());
db.close();
