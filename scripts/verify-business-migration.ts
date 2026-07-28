import { getSqlite } from "../src/platform/db";

const db = getSqlite();
const units = db.prepare("SELECT id, name FROM business_units").all();
const salesCount = db.prepare("SELECT business_id, COUNT(*) as c FROM sales GROUP BY business_id").all();
const productsCount = db.prepare("SELECT business_id, COUNT(*) as c FROM products GROUP BY business_id").all();
const goalsCount = db.prepare("SELECT business_id, COUNT(*) as c FROM goals GROUP BY business_id").all();

console.log(JSON.stringify({ units, salesCount, productsCount, goalsCount }, null, 2));
