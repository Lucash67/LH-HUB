/**
 * Sprint 2.5.1 — Renomeia produto Brigadeiro Gourmet → Brigadeiro em todo o banco.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const before = db
  .prepare("SELECT id, name FROM products WHERE business_id = 'brigadeiros'")
  .all();
console.log("Antes:", before);

const r = db
  .prepare("UPDATE products SET name = 'Brigadeiro', updated_at = datetime('now') WHERE business_id = 'brigadeiros' AND name = 'Brigadeiro Gourmet'")
  .run();

const after = db
  .prepare("SELECT id, name FROM products WHERE business_id = 'brigadeiros'")
  .all();
console.log("Depois:", after);
console.log(`Linhas atualizadas: ${r.changes}`);
db.close();
