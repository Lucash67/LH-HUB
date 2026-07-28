import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { format, subDays } from "date-fns";

const dbPath = path.join(process.cwd(), "data", "lucas-business-os.db");

console.log("=== DB PATH ===");
console.log("path:", dbPath);
console.log("exists:", fs.existsSync(dbPath));
if (fs.existsSync(dbPath)) {
  const st = fs.statSync(dbPath);
  console.log("size_bytes:", st.size);
  console.log("mtime:", st.mtime.toISOString());
  console.log("birthtime:", st.birthtime.toISOString());
}

const db = new Database(dbPath, { readonly: true });

const tables = [
  "products",
  "clients",
  "sales",
  "operations",
  "effect_records",
  "domain_events",
  "goals",
  "settings",
];

console.log("\n=== RECORD COUNTS ===");
for (const t of tables) {
  const r = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get();
  console.log(`${t}: ${r.c}`);
}

// Replicate getWeekRange / getMonthRange from utils
const now = new Date();
const day = now.getDay();
const weekStart = format(subDays(now, day === 0 ? 6 : day - 1), "yyyy-MM-dd");
const monthStart = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
const today = format(now, "yyyy-MM-dd");

console.log("\n=== DATE RANGES (analytics logic) ===");
console.log("today:", today);
console.log("weekStart:", weekStart);
console.log("monthStart:", monthStart);

const revenueWeek = db
  .prepare("SELECT COALESCE(SUM(total_amount),0) as s, COUNT(*) as c FROM sales WHERE date >= ?")
  .get(weekStart);
const revenueMonth = db
  .prepare("SELECT COALESCE(SUM(total_amount),0) as s, COUNT(*) as c FROM sales WHERE date >= ?")
  .get(monthStart);
const revenueAll = db
  .prepare("SELECT COALESCE(SUM(total_amount),0) as s, COUNT(*) as c FROM sales")
  .get();
const stock = db
  .prepare("SELECT COALESCE(SUM(stock_quantity),0) as s FROM products")
  .get();

console.log("\n=== DASHBOARD METRICS (computed from DB) ===");
console.log("revenueWeek:", revenueWeek.s, `(${revenueWeek.c} sales in period)`);
console.log("revenueMonth:", revenueMonth.s, `(${revenueMonth.c} sales in period)`);
console.log("revenueAllTime:", revenueAll.s, `(${revenueAll.c} total sales)`);
console.log("currentStock:", stock.s);

const dateRange = db.prepare("SELECT MIN(date) as minD, MAX(date) as maxD FROM sales").get();
console.log("sales_date_range:", dateRange.minD, "to", dateRange.maxD);

console.log("\n=== SAMPLE PRODUCTS (all) ===");
const products = db.prepare("SELECT id, name, stock_quantity, created_at FROM products ORDER BY created_at").all();
for (const p of products) console.log(JSON.stringify(p));

console.log("\n=== SAMPLE CLIENTS (all) ===");
const clients = db.prepare("SELECT id, name, created_at FROM clients ORDER BY created_at").all();
for (const c of clients) console.log(JSON.stringify(c));

console.log("\n=== GOALS ===");
const goals = db.prepare("SELECT type, target_amount, created_at FROM goals").all();
for (const g of goals) console.log(JSON.stringify(g));

console.log("\n=== SETTINGS ===");
const settings = db.prepare("SELECT key, value, updated_at FROM settings").all();
for (const s of settings) console.log(JSON.stringify(s));

console.log("\n=== SALES BY MONTH ===");
const byMonth = db
  .prepare("SELECT substr(date,1,7) as ym, COUNT(*) as c, SUM(total_amount) as total FROM sales GROUP BY ym ORDER BY ym")
  .all();
for (const row of byMonth) console.log(JSON.stringify(row));

console.log("\n=== TEST MARKERS ===");
const testP = db
  .prepare("SELECT COUNT(*) c FROM products WHERE name LIKE '__TEST__%' OR name LIKE '__VALIDATE__%'")
  .get();
const testC = db
  .prepare("SELECT COUNT(*) c FROM clients WHERE name LIKE '__TEST__%' OR name LIKE '__VALIDATE__%'")
  .get();
console.log("test_products:", testP.c);
console.log("test_clients:", testC.c);

console.log("\n=== FIRST/ LAST SALE ===");
const firstSale = db.prepare("SELECT id, date, total_amount, created_at FROM sales ORDER BY created_at ASC LIMIT 1").get();
const lastSale = db.prepare("SELECT id, date, total_amount, created_at FROM sales ORDER BY created_at DESC LIMIT 1").get();
console.log("first:", JSON.stringify(firstSale));
console.log("last:", JSON.stringify(lastSale));

db.close();
