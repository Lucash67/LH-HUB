import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "lucas-business-os.db"));

db.prepare("DELETE FROM effect_records WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
db.prepare("DELETE FROM domain_events WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
db.prepare("DELETE FROM operation_interpretations WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
db.prepare("DELETE FROM operation_payloads WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
db.prepare("DELETE FROM operations WHERE date(created_at) = date('now')").run();
db.prepare("DELETE FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
db.prepare("DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
db.prepare("DELETE FROM sales WHERE date = date('now')").run();
db.prepare("DELETE FROM clients WHERE name LIKE '__VALIDATE__%' OR name LIKE '__TEST__%'").run();
db.prepare("DELETE FROM products WHERE name LIKE '__VALIDATE__%' OR name LIKE '__TEST__%'").run();
db.close();
console.log("Cleanup done.");
