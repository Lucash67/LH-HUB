import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "lucas-business-os.db");
const db = new Database(dbPath, { readonly: true });

const testProducts = db
  .prepare("SELECT COUNT(*) as c FROM products WHERE name LIKE '__TEST__%' OR name LIKE '__VALIDATE__%'")
  .get();
const testClients = db
  .prepare("SELECT COUNT(*) as c FROM clients WHERE name LIKE '__TEST__%' OR name LIKE '__VALIDATE__%'")
  .get();

console.log(`test_products:${testProducts.c}`);
console.log(`test_clients:${testClients.c}`);
db.close();
