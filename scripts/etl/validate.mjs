#!/usr/bin/env node
/** Compara contagens SQLite (readonly) vs PostgreSQL. Requer DATABASE_URL. */
import Database from "better-sqlite3";
import path from "path";
import postgres from "postgres";

const DB_PATH = path.join(process.cwd(), "data", "lucas-business-os.db");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

  const sqlite = {
    businesses: db.prepare("SELECT COUNT(*) c FROM business_units").get().c,
    products: db.prepare("SELECT COUNT(*) c FROM products").get().c,
    clients: db.prepare("SELECT COUNT(*) c FROM clients").get().c,
    sales: db.prepare("SELECT COUNT(*) c FROM sales").get().c,
    sale_items: db.prepare("SELECT COUNT(*) c FROM sale_items").get().c,
    goals: db.prepare("SELECT COUNT(*) c FROM goals").get().c,
    app_settings: db.prepare("SELECT COUNT(*) c FROM settings").get().c,
    diary_entries: db
      .prepare("SELECT COUNT(*) c FROM notes WHERE entity_type = 'operational_diary'")
      .get().c,
    daily_investments: db.prepare("SELECT COUNT(*) c FROM investments").get().c,
    daily_purchases: db.prepare("SELECT COUNT(*) c FROM daily_purchases").get().c,
    cash_flow_events: db.prepare("SELECT COUNT(*) c FROM cash_flow").get().c,
    stock_movements: db.prepare("SELECT COUNT(*) c FROM stock_movements").get().c,
    operational_actions: db.prepare("SELECT COUNT(*) c FROM operational_actions").get().c,
    product_hypotheses: db.prepare("SELECT COUNT(*) c FROM product_hypotheses").get().c,
    operational_lessons: db.prepare("SELECT COUNT(*) c FROM operational_lessons").get().c,
  };

  const money = db
    .prepare("SELECT SUM(total_amount) revenue, SUM(profit) profit FROM sales")
    .get();
  sqlite.revenue_total = money.revenue;
  sqlite.profit_total = money.profit;
  sqlite.stock_total = db.prepare("SELECT SUM(stock_quantity) t FROM products").get().t;
  sqlite.cash_flow_total = db.prepare("SELECT SUM(amount) t FROM cash_flow").get().t;

  const rows = await sql`
    SELECT 'businesses' entity, COUNT(*)::int c FROM businesses
    UNION ALL SELECT 'products', COUNT(*)::int FROM products
    UNION ALL SELECT 'clients', COUNT(*)::int FROM clients
    UNION ALL SELECT 'sales', COUNT(*)::int FROM sales
    UNION ALL SELECT 'sale_items', COUNT(*)::int FROM sale_items
    UNION ALL SELECT 'goals', COUNT(*)::int FROM goals
    UNION ALL SELECT 'app_settings', COUNT(*)::int FROM app_settings
    UNION ALL SELECT 'diary_entries', COUNT(*)::int FROM diary_entries
    UNION ALL SELECT 'daily_investments', COUNT(*)::int FROM daily_investments
    UNION ALL SELECT 'daily_purchases', COUNT(*)::int FROM daily_purchases
    UNION ALL SELECT 'cash_flow_events', COUNT(*)::int FROM cash_flow_events
    UNION ALL SELECT 'stock_movements', COUNT(*)::int FROM stock_movements
    UNION ALL SELECT 'operational_actions', COUNT(*)::int FROM operational_actions
    UNION ALL SELECT 'product_hypotheses', COUNT(*)::int FROM product_hypotheses
    UNION ALL SELECT 'operational_lessons', COUNT(*)::int FROM operational_lessons
  `;

  const pg = Object.fromEntries(rows.map((r) => [r.entity, r.c]));
  const fin = await sql`
    SELECT COALESCE(SUM(total_amount::numeric),0) revenue,
           COALESCE(SUM(profit::numeric),0) profit
    FROM sales
  `;
  const stock = await sql`SELECT COALESCE(SUM(stock_quantity),0)::int stock FROM products`;
  const cash = await sql`SELECT COALESCE(SUM(amount::numeric),0) cash FROM cash_flow_events`;

  console.log("| Entidade | SQLite | PostgreSQL | Status |");
  console.log("|----------|-------:|-----------:|:------:|");
  for (const key of Object.keys(sqlite).filter((k) => !k.includes("_total"))) {
    const ok = sqlite[key] === pg[key] ? "✅" : "❌";
    console.log(`| ${key} | ${sqlite[key]} | ${pg[key] ?? 0} | ${ok} |`);
  }

  console.log("\n| KPI | SQLite | PostgreSQL | Status |");
  console.log("|-----|-------:|-----------:|:------:|");
  console.log(
    `| Receita total | ${sqlite.revenue_total} | ${Number(fin[0].revenue)} | ${Math.abs(Number(fin[0].revenue) - sqlite.revenue_total) < 0.01 ? "✅" : "❌"} |`,
  );
  console.log(
    `| Lucro total | ${sqlite.profit_total} | ${Number(fin[0].profit)} | ${Math.abs(Number(fin[0].profit) - sqlite.profit_total) <= 0.02 ? "✅" : "❌"} |`,
  );
  console.log(`| Estoque (soma) | ${sqlite.stock_total} | ${stock[0].stock} | ${sqlite.stock_total === stock[0].stock ? "✅" : "❌"} |`);
  console.log(`| Fluxo de caixa | ${sqlite.cash_flow_total} | ${Number(cash[0].cash)} | ${sqlite.cash_flow_total === Number(cash[0].cash) ? "✅" : "❌"} |`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
