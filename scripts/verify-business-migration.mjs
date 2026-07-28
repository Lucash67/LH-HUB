import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "lucas-business-os.db");
const db = new Database(dbPath);

const units = db.prepare("SELECT id, name FROM business_units").all();
const salesCount = db.prepare("SELECT business_id, COUNT(*) as c FROM sales GROUP BY business_id").all();
const productsCount = db.prepare("SELECT business_id, COUNT(*) as c FROM products GROUP BY business_id").all();

console.log(JSON.stringify({ units, salesCount, productsCount }, null, 2));
