/**
 * Corrige business_id e remove cadastros órfãos duplicados (sem vendas).
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const reassigned = db
  .prepare(
    `UPDATE clients SET business_id = 'brigadeiros', updated_at = datetime('now')
     WHERE id IN (
       SELECT c.id FROM clients c
       WHERE EXISTS (
         SELECT 1 FROM sales s WHERE s.client_id = c.id AND s.business_id = 'brigadeiros'
       )
       AND NOT EXISTS (
         SELECT 1 FROM sales s WHERE s.client_id = c.id AND s.business_id = 'salgados'
       )
     )`,
  )
  .run();

console.log(`✓ ${reassigned.changes} clientes marcados como brigadeiros`);

const orphansRemoved = db
  .prepare(
    `DELETE FROM clients
     WHERE id IN (
       SELECT c.id FROM clients c
       WHERE NOT EXISTS (SELECT 1 FROM sales s WHERE s.client_id = c.id)
         AND EXISTS (
           SELECT 1 FROM clients c2
           JOIN sales s2 ON s2.client_id = c2.id AND s2.business_id = 'brigadeiros'
           WHERE lower(c2.name) = lower(c.name)
         )
     )`,
  )
  .run();

console.log(`✓ ${orphansRemoved.changes} cadastros órfãos duplicados removidos`);

const salgadosVisible = db
  .prepare(
    `SELECT c.name FROM clients c
     WHERE EXISTS (
       SELECT 1 FROM sales s WHERE s.client_id = c.id AND s.business_id = 'salgados'
     )
     ORDER BY c.name`,
  )
  .all();

console.log(`✓ ${salgadosVisible.length} clientes com compras em Salgados`);
db.close();
