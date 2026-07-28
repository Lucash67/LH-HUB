import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "lucas-business-os.db");
const db = new Database(DB_PATH, { readonly: true });

console.log("business", db.prepare("SELECT id, slug FROM business_units").all());
console.log("product sample", db.prepare("SELECT id, business_id FROM products LIMIT 2").all());
console.log("sale sample", db.prepare("SELECT id, business_id, date FROM sales LIMIT 2").all());
console.log("investment", db.prepare("SELECT id, business_id, date, amount FROM investments").all());
console.log(
  "notes diary",
  db
    .prepare("SELECT entity_id FROM notes WHERE entity_type = 'operational_diary'")
    .all(),
);
console.log("revenue", db.prepare("SELECT SUM(total_amount) t, SUM(profit) p FROM sales").get());
