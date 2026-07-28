/**
 * Sprint A.3.1.a — Registra fonte do investimento 16/07/2026
 * Apenas o investimento do dia 16/07 é alterado.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(ROOT, "data", "lucas-business-os.db");
const DATE = "2026-07-16";
const BUSINESS = "salgados";

const db = new Database(DB_PATH);

// Aplica migration se colunas ainda não existirem (scripts rodam fora do initTables)
const cols = db.prepare("PRAGMA table_info(investments)").all();
const existing = new Set(cols.map((c) => c.name));
if (!existing.has("source_type")) db.exec("ALTER TABLE investments ADD COLUMN source_type TEXT");
if (!existing.has("source_name")) db.exec("ALTER TABLE investments ADD COLUMN source_name TEXT");

const before = db
  .prepare(
    `SELECT id, amount, source_type, source_name FROM investments WHERE business_id = ? AND date = ?`,
  )
  .all(BUSINESS, DATE);

if (before.length === 0) {
  console.error("✗ Investimento 16/07 não encontrado");
  process.exit(1);
}

const result = db
  .prepare(
    `UPDATE investments SET source_type = ?, source_name = ?
     WHERE business_id = ? AND date = ?`,
  )
  .run("family", "Henrique", BUSINESS, DATE);

const after = db
  .prepare(
    `SELECT id, amount, source_type, source_name, description FROM investments WHERE business_id = ? AND date = ?`,
  )
  .all(BUSINESS, DATE);

console.log("=== Sprint A.3.1.a — Fonte investimento 16/07 ===");
console.log("Antes:", before);
console.log("Depois:", after);
console.log(`Registros alterados: ${result.changes}`);

db.close();
