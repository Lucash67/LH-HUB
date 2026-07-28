import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const zero = db
  .prepare(
    `SELECT c.name, c.business_id FROM clients c
     WHERE NOT EXISTS (SELECT 1 FROM sales s WHERE s.client_id = c.id)
     ORDER BY c.name`,
  )
  .all();

console.log("Clientes sem nenhuma venda vinculada:", zero.length);
console.table(zero);

const brigNames = db
  .prepare(
    `SELECT DISTINCT c.name FROM clients c
     JOIN sales s ON s.client_id = c.id AND s.business_id = 'brigadeiros'
     ORDER BY c.name`,
  )
  .all();

console.log("\nClientes com vendas brigadeiros:", brigNames.length);

db.close();
