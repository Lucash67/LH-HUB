#!/usr/bin/env node
/**
 * ETL SQLite → PostgreSQL (Lucas Business OS)
 *
 * Uso:
 *   DATABASE_URL=... node scripts/etl/migrate.mjs
 *   node scripts/etl/migrate.mjs --dry-run
 *   node scripts/etl/migrate.mjs --phase=1
 *   node scripts/etl/migrate.mjs --sql-only > scripts/etl/output.sql
 */
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import postgres from "postgres";
import {
  ETL_NAMESPACE,
  businessUuid,
  ensureUuid,
  operationDayUuid,
  sqlStr,
  sqlNum,
  sqlJson,
  sqlTextArray,
  parseIsoTimestamp,
  parseTags,
  chunkArray,
} from "./lib/helpers.mjs";

const DB_PATH = path.join(process.cwd(), "data", "lucas-business-os.db");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sqlOnly = args.includes("--sql-only");
const phaseArg = args.find((a) => a.startsWith("--phase="));
const onlyPhase = phaseArg ? Number(phaseArg.split("=")[1]) : null;

const idMap = new Map();
function mapId(original) {
  if (!original) return null;
  if (!idMap.has(original)) idMap.set(original, ensureUuid(original));
  return idMap.get(original);
}

function collectOperationDayKeys(db) {
  const keys = new Set();
  const add = (businessId, date) => {
    if (businessId && date) keys.add(`${businessId}:${date}`);
  };

  for (const row of db.prepare("SELECT business_id, date FROM sales").all()) {
    add(row.business_id, row.date);
  }
  for (const row of db.prepare("SELECT business_id, date FROM daily_purchases").all()) {
    add(row.business_id, row.date);
  }
  for (const row of db.prepare("SELECT business_id, date FROM investments").all()) {
    add(row.business_id, row.date);
  }
  for (const row of db
    .prepare("SELECT business_id, date FROM operational_actions")
    .all()) {
    add(row.business_id, row.date);
  }
  for (const row of db
    .prepare("SELECT business_id, date FROM product_hypotheses")
    .all()) {
    add(row.business_id, row.date);
  }
  for (const row of db
    .prepare("SELECT business_id, date FROM operational_lessons")
    .all()) {
    add(row.business_id, row.date);
  }
  for (const row of db
    .prepare("SELECT business_id, date FROM operational_losses")
    .all()) {
    add(row.business_id, row.date);
  }
  for (const row of db
    .prepare("SELECT entity_id FROM notes WHERE entity_type = 'operational_diary'")
    .all()) {
    const idx = row.entity_id.indexOf(":");
    if (idx > 0) add(row.entity_id.slice(0, idx), row.entity_id.slice(idx + 1));
  }

  return [...keys].sort();
}

function buildPhases(db) {
  const phases = [];
  const operationDayKeys = collectOperationDayKeys(db);
  const operationDayIdByKey = new Map(
    operationDayKeys.map((key) => {
      const [businessSlug, date] = key.split(":");
      return [key, operationDayUuid(businessSlug, date)];
    }),
  );

  // Phase 1 — businesses, settings, goals
  {
    const statements = [];
    for (const row of db.prepare("SELECT * FROM business_units").all()) {
      const id = businessUuid(row.id);
      statements.push(`
        INSERT INTO businesses (id, slug, name, status, created_at, updated_at)
        VALUES (${sqlStr(id)}, ${sqlStr(row.slug)}, ${sqlStr(row.name)}, ${sqlStr(row.status)}, ${sqlStr(parseIsoTimestamp(row.created_at))}, ${sqlStr(parseIsoTimestamp(row.updated_at))})
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    for (const row of db.prepare("SELECT * FROM settings").all()) {
      let jsonValue;
      try {
        jsonValue = JSON.parse(row.value);
      } catch {
        jsonValue = row.value;
      }
      statements.push(`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (${sqlStr(row.key)}, ${sqlJson(jsonValue)}, ${sqlStr(parseIsoTimestamp(row.updated_at))})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      `);
    }

    for (const row of db.prepare("SELECT * FROM goals").all()) {
      const id = mapId(row.id);
      statements.push(`
        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          ${sqlStr(id)},
          ${sqlStr(businessUuid(row.business_id))},
          ${sqlStr(row.type)},
          ${sqlNum(row.target_amount)},
          ${row.target_units == null ? "NULL" : sqlNum(row.target_units)},
          ${sqlStr(row.period_start)},
          ${sqlStr(row.period_end)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    phases.push({ phase: 1, name: "businesses_settings_goals", statements });
  }

  // Phase 2 — products, clients
  {
    const statements = [];
    for (const row of db.prepare("SELECT * FROM products").all()) {
      const id = mapId(row.id);
      statements.push(`
        INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          ${sqlStr(id)},
          ${sqlStr(businessUuid(row.business_id))},
          ${sqlStr(row.name)},
          ${sqlStr(row.category)},
          ${sqlNum(row.price)},
          ${sqlNum(row.cost)},
          ${sqlNum(row.stock_quantity)},
          ${sqlNum(row.min_stock)},
          ${sqlStr(row.image_url)},
          ${sqlStr(row.status)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    for (const row of db.prepare("SELECT * FROM clients").all()) {
      const id = mapId(row.id);
      statements.push(`
        INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          ${sqlStr(id)},
          ${sqlStr(row.name)},
          ${sqlStr(row.sector)},
          ${sqlStr(row.company)},
          ${sqlStr(row.phone)},
          ${sqlStr(row.notes)},
          ${sqlStr(businessUuid(row.business_id))},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    phases.push({ phase: 2, name: "products_clients", statements });
  }

  // Phase 3 — operation days, purchases, investments, diary
  {
    const statements = [];

    for (const key of operationDayKeys) {
      const [businessSlug, date] = key.split(":");
      const id = operationDayIdByKey.get(key);
      statements.push(`
        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          ${sqlStr(id)},
          ${sqlStr(businessUuid(businessSlug))},
          ${sqlStr(date)},
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      `);
    }

    // INV-03: investments must exist before daily_purchases insert
    for (const row of db.prepare("SELECT * FROM investments").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;
      statements.push(`
        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${sqlNum(row.amount)},
          ${sqlStr(row.type)},
          ${sqlStr(row.source_type ?? "other")},
          ${sqlStr(row.source_name)},
          ${sqlStr(row.description)},
          ${sqlStr(parseIsoTimestamp(row.created_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM daily_purchases").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      const purchaseId = mapId(row.id);
      statements.push(`
        INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          ${sqlStr(purchaseId)},
          ${sqlStr(operationDayId)},
          ${sqlNum(row.total_units)},
          ${sqlNum(row.investment)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
      `);

      for (const item of db
        .prepare("SELECT * FROM daily_purchase_items WHERE purchase_id = ?")
        .all(row.id)) {
        statements.push(`
          INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            ${sqlStr(mapId(item.id))},
            ${sqlStr(purchaseId)},
            ${item.product_id ? sqlStr(mapId(item.product_id)) : "NULL"},
            ${sqlStr(item.product_name)},
            ${sqlNum(item.quantity)},
            ${item.unit_cost == null ? "NULL" : sqlNum(item.unit_cost)}
          )
          ON CONFLICT (id) DO NOTHING;
        `);
      }
    }

    for (const row of db
      .prepare("SELECT * FROM notes WHERE entity_type = 'operational_diary'")
      .all()) {
      const idx = row.entity_id.indexOf(":");
      if (idx <= 0) continue;
      const businessSlug = row.entity_id.slice(0, idx);
      const date = row.entity_id.slice(idx + 1);
      const opKey = `${businessSlug}:${date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;

      let entry;
      try {
        entry = JSON.parse(row.content);
      } catch {
        continue;
      }

      const narrative = {
        sales: entry.sales ?? null,
        lossReason: entry.lossReason ?? null,
      };

      statements.push(`
        UPDATE operation_days SET daily_goal_units = ${entry.dailyGoalUnits == null ? "NULL" : sqlNum(entry.dailyGoalUnits)}, updated_at = NOW()
        WHERE id = ${sqlStr(operationDayId)};
      `);

      statements.push(`
        INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${sqlNum(entry.version ?? 1)},
          ${sqlNum(entry.revenue?.received ?? 0)},
          ${sqlNum(entry.revenue?.pending ?? 0)},
          ${sqlNum(entry.revenue?.total ?? 0)},
          ${sqlNum(entry.profit ?? 0)},
          ${sqlNum(entry.quantitySold ?? 0)},
          ${sqlNum(entry.quantityLost ?? 0)},
          ${sqlStr(entry.observations ?? null)},
          ${sqlStr(entry.manualInsights ?? null)},
          ${sqlJson(entry.commercialIntelligence ?? null)},
          ${sqlTextArray(entry.tags ?? [])},
          ${sqlJson(narrative)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.created_at))}
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          revenue_received = EXCLUDED.revenue_received,
          revenue_pending = EXCLUDED.revenue_pending,
          revenue_total = EXCLUDED.revenue_total,
          operational_profit = EXCLUDED.operational_profit,
          quantity_sold = EXCLUDED.quantity_sold,
          quantity_lost = EXCLUDED.quantity_lost,
          observations = EXCLUDED.observations,
          manual_insights = EXCLUDED.manual_insights,
          commercial_intelligence = EXCLUDED.commercial_intelligence,
          tags = EXCLUDED.tags,
          narrative = EXCLUDED.narrative,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    phases.push({ phase: 3, name: "operation_days_diary", statements });
  }

  // Phase 4 — sales, sale items, cash flow, stock movements
  {
    const statements = [];

    for (const row of db.prepare("SELECT * FROM sales").all()) {
      const saleId = mapId(row.id);
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      const saleTime = row.time?.length === 5 ? `${row.time}:00` : row.time ?? "12:00:00";

      statements.push(`
        INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          ${sqlStr(saleId)},
          ${sqlStr(businessUuid(row.business_id))},
          ${sqlStr(operationDayId)},
          ${row.client_id ? sqlStr(mapId(row.client_id)) : "NULL"},
          ${sqlStr(row.date)},
          ${sqlStr(saleTime)},
          ${sqlStr(row.department)},
          ${sqlStr(row.payment_method)},
          ${sqlStr(row.payment_status)},
          ${sqlNum(row.amount_received ?? row.total_amount)},
          ${sqlStr(row.payment_date)},
          ${sqlNum(row.total_amount)},
          ${sqlNum(row.total_cost)},
          ${sqlNum(row.profit)},
          ${sqlStr(row.notes)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
      `);
    }

    for (const row of db.prepare("SELECT * FROM sale_items").all()) {
      statements.push(`
        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(mapId(row.sale_id))},
          ${sqlStr(mapId(row.product_id))},
          ${sqlNum(row.quantity)},
          ${sqlNum(row.unit_price)},
          ${sqlNum(row.unit_cost)},
          ${sqlNum(row.subtotal)},
          ${sqlNum(row.profit)}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM cash_flow").all()) {
      const opKey = `salgados:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey) ?? null;
      statements.push(`
        INSERT INTO cash_flow_events (id, business_id, operation_day_id, event_type, category, description, amount, event_date, created_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(businessUuid("salgados"))},
          ${operationDayId ? sqlStr(operationDayId) : "NULL"},
          ${sqlStr(row.type)},
          ${sqlStr(row.category)},
          ${sqlStr(row.description)},
          ${sqlNum(row.amount)},
          ${sqlStr(row.date)},
          ${sqlStr(parseIsoTimestamp(row.created_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM stock_movements").all()) {
      statements.push(`
        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(mapId(row.product_id))},
          ${sqlStr(row.type)},
          ${sqlNum(row.quantity)},
          ${sqlNum(row.balance_after)},
          ${sqlStr(row.reason)},
          ${sqlStr(parseIsoTimestamp(row.created_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    phases.push({ phase: 4, name: "sales_cashflow_stock", statements });
  }

  // Phase 5 — operational relational tables
  {
    const statements = [];

    for (const row of db.prepare("SELECT * FROM operational_losses").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;
      statements.push(`
        INSERT INTO operational_losses (id, operation_day_id, product_id, product_name, quantity, reason, created_at, updated_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${row.product_id ? sqlStr(mapId(row.product_id)) : "NULL"},
          ${sqlStr(row.product_name)},
          ${sqlNum(row.quantity)},
          ${sqlStr(row.reason)},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM operational_actions").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;
      statements.push(`
        INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${sqlStr(row.id)},
          ${sqlStr(row.title)},
          ${sqlStr(row.description)},
          ${sqlStr(row.status)},
          ${sqlStr(row.source ?? "diary")},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM product_hypotheses").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;
      statements.push(`
        INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${sqlStr(row.flavor)},
          ${sqlStr(row.hypothesis)},
          ${row.confirmed == null ? "NULL" : row.confirmed ? "TRUE" : "FALSE"},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    for (const row of db.prepare("SELECT * FROM operational_lessons").all()) {
      const opKey = `${row.business_id}:${row.date}`;
      const operationDayId = operationDayIdByKey.get(opKey);
      if (!operationDayId) continue;
      statements.push(`
        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          ${sqlStr(mapId(row.id))},
          ${sqlStr(operationDayId)},
          ${sqlStr(row.content)},
          ${sqlTextArray(parseTags(row.tags))},
          ${sqlStr(parseIsoTimestamp(row.created_at))},
          ${sqlStr(parseIsoTimestamp(row.updated_at))}
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    phases.push({ phase: 5, name: "operational_remaining", statements });
  }

  return { phases, operationDayKeys, idMap };
}

function sqliteStats(db) {
  const tables = {
    businesses: "business_units",
    products: "products",
    clients: "clients",
    sales: "sales",
    sale_items: "sale_items",
    goals: "goals",
    app_settings: "settings",
    daily_purchases: "daily_purchases",
    daily_purchase_items: "daily_purchase_items",
    investments: "investments",
    diary_notes: "notes",
    operational_actions: "operational_actions",
    product_hypotheses: "product_hypotheses",
    operational_lessons: "operational_lessons",
    stock_movements: "stock_movements",
    cash_flow: "cash_flow",
  };

  const stats = {};
  for (const [key, table] of Object.entries(tables)) {
    if (key === "diary_notes") {
      stats[key] = db
        .prepare("SELECT COUNT(*) c FROM notes WHERE entity_type = 'operational_diary'")
        .get().c;
      continue;
    }
    stats[key] = db.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c;
  }

  const money = db
    .prepare("SELECT SUM(total_amount) revenue, SUM(profit) profit, COUNT(*) sales FROM sales")
    .get();

  stats.revenue_total = money.revenue ?? 0;
  stats.profit_total = money.profit ?? 0;
  stats.sales_count = money.sales ?? 0;
  stats.stock_total = db.prepare("SELECT SUM(stock_quantity) t FROM products").get().t ?? 0;
  stats.cash_flow_total = db.prepare("SELECT SUM(amount) t FROM cash_flow").get().t ?? 0;

  return stats;
}

async function executePhase(sql, phase) {
  const batches = chunkArray(phase.statements, 1);
  for (const batch of batches) {
    await sql.unsafe(batch.join("\n"));
  }
}

async function fetchPgStats(sql) {
  const rows = await sql`
    SELECT 'businesses' as entity, COUNT(*)::int as count FROM businesses
    UNION ALL SELECT 'products', COUNT(*)::int FROM products
    UNION ALL SELECT 'clients', COUNT(*)::int FROM clients
    UNION ALL SELECT 'sales', COUNT(*)::int FROM sales
    UNION ALL SELECT 'sale_items', COUNT(*)::int FROM sale_items
    UNION ALL SELECT 'goals', COUNT(*)::int FROM goals
    UNION ALL SELECT 'app_settings', COUNT(*)::int FROM app_settings
    UNION ALL SELECT 'operation_days', COUNT(*)::int FROM operation_days
    UNION ALL SELECT 'diary_entries', COUNT(*)::int FROM diary_entries
    UNION ALL SELECT 'daily_investments', COUNT(*)::int FROM daily_investments
    UNION ALL SELECT 'daily_purchases', COUNT(*)::int FROM daily_purchases
    UNION ALL SELECT 'cash_flow_events', COUNT(*)::int FROM cash_flow_events
    UNION ALL SELECT 'stock_movements', COUNT(*)::int FROM stock_movements
    UNION ALL SELECT 'operational_actions', COUNT(*)::int FROM operational_actions
  `;

  const money = await sql`
    SELECT COALESCE(SUM(total_amount::numeric),0) as revenue,
           COALESCE(SUM(profit::numeric),0) as profit,
           COUNT(*)::int as sales
    FROM sales
  `;

  const stock = await sql`SELECT COALESCE(SUM(stock_quantity),0)::int as stock FROM products`;
  const cash = await sql`SELECT COALESCE(SUM(amount::numeric),0) as total FROM cash_flow_events`;

  return {
    counts: Object.fromEntries(rows.map((r) => [r.entity, r.count])),
    revenue_total: Number(money[0].revenue),
    profit_total: Number(money[0].profit),
    sales_count: Number(money[0].sales),
    stock_total: Number(stock[0].stock),
    cash_flow_total: Number(cash[0].total),
  };
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error("SQLite database not found:", DB_PATH);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  const sqlite = sqliteStats(db);
  const { phases } = buildPhases(db);

  const selectedPhases = onlyPhase
    ? phases.filter((p) => p.phase === onlyPhase)
    : phases;

  if (sqlOnly) {
    for (const phase of selectedPhases) {
      console.log(`-- Phase ${phase.phase}: ${phase.name}`);
      console.log(phase.statements.join("\n"));
    }
    return;
  }

  console.log("SQLite stats:", sqlite);
  console.log(`Phases to run: ${selectedPhases.map((p) => p.phase).join(", ")}`);

  if (dryRun) {
    for (const phase of selectedPhases) {
      console.log(`Phase ${phase.phase} (${phase.name}): ${phase.statements.length} statements`);
    }
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required for live ETL. Use --dry-run or --sql-only.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    for (const phase of selectedPhases) {
      console.log(`\n=== Phase ${phase.phase}: ${phase.name} ===`);
      await executePhase(sql, phase);
      console.log(`Inserted/updated ${phase.statements.length} statements`);
    }

    const pg = await fetchPgStats(sql);
    console.log("\nPostgreSQL stats:", pg);

    const report = {
      sqlite,
      postgres: pg,
      idMappings: idMap.size,
      nonUuidMappings: [...idMap.entries()].filter(([k, v]) => k !== v),
    };

    fs.writeFileSync(
      path.join(process.cwd(), "scripts", "etl", "last-run-report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log("\nReport written to scripts/etl/last-run-report.json");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
