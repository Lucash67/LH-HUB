/**
 * Aplica migrações de inteligência operacional e sincroniza diários → tabelas relacionais.
 * Idempotente — seguro reexecutar.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const BUSINESS_ID = "salgados";
const DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db");
const BACKFILL_KEY = "operational_intelligence_backfill_v1";

const db = new Database(DB_PATH);

function migrateSchema() {
  const salesCols = new Set(
    db.prepare("PRAGMA table_info(sales)").all().map((c) => c.name),
  );
  if (!salesCols.has("payment_status")) {
    db.exec(`ALTER TABLE sales ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'paid'`);
  }
  if (!salesCols.has("amount_received")) {
    db.exec(`ALTER TABLE sales ADD COLUMN amount_received REAL`);
  }

  db.exec(`
    UPDATE sales SET amount_received = total_amount
    WHERE amount_received IS NULL AND payment_status = 'paid';
    UPDATE sales SET payment_status = 'pending', amount_received = 0
    WHERE payment_status = 'paid'
      AND (
        LOWER(COALESCE(notes, '')) LIKE '%fiado%'
        OR LOWER(COALESCE(notes, '')) LIKE '%devendo%'
        OR LOWER(COALESCE(notes, '')) LIKE '%pendente%'
      );
  `);

  const clientCols = new Set(
    db.prepare("PRAGMA table_info(clients)").all().map((c) => c.name),
  );
  if (!clientCols.has("business_id")) {
    db.exec(`ALTER TABLE clients ADD COLUMN business_id TEXT NOT NULL DEFAULT '${BUSINESS_ID}'`);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS operational_losses (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_purchases (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      total_units INTEGER NOT NULL,
      investment REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost REAL
    );
    CREATE TABLE IF NOT EXISTS operational_actions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      source TEXT NOT NULL DEFAULT 'diary',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_hypotheses (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      flavor TEXT NOT NULL,
      hypothesis TEXT NOT NULL,
      confirmed INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS operational_lessons (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_purchases_business_date_unique ON daily_purchases(business_id, date);
  `);
}

function syncDiaryRow(content) {
  const entry = JSON.parse(content);
  const now = new Date().toISOString();
  const { businessId, date } = entry;

  if (entry.dailyGoalUnits) {
    db.prepare(
      `UPDATE goals SET target_units = ?, updated_at = ? WHERE business_id = ? AND type = 'daily'`,
    ).run(entry.dailyGoalUnits, now, businessId);
  }

  db.prepare(`DELETE FROM operational_losses WHERE business_id = ? AND date = ?`).run(businessId, date);
  if (entry.quantityLost > 0) {
    db.prepare(
      `INSERT INTO operational_losses (id, business_id, date, product_id, product_name, quantity, reason, created_at, updated_at)
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      businessId,
      date,
      "Não especificado",
      entry.quantityLost,
      entry.lossReason ?? null,
      now,
      now,
    );
  }

  const existingPurchase = db
    .prepare(`SELECT id FROM daily_purchases WHERE business_id = ? AND date = ?`)
    .get(businessId, date);

  if (entry.purchase) {
    const purchaseId = existingPurchase?.id ?? uuidv4();
    if (existingPurchase) {
      db.prepare(
        `UPDATE daily_purchases SET total_units = ?, investment = ?, updated_at = ? WHERE id = ?`,
      ).run(entry.purchase.totalUnits, entry.purchase.investment, now, purchaseId);
      db.prepare(`DELETE FROM daily_purchase_items WHERE purchase_id = ?`).run(purchaseId);
    } else {
      db.prepare(
        `INSERT INTO daily_purchases (id, business_id, date, total_units, investment, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        purchaseId,
        businessId,
        date,
        entry.purchase.totalUnits,
        entry.purchase.investment,
        now,
        now,
      );
    }
    const unitCost =
      entry.purchase.totalUnits > 0 ? entry.purchase.investment / entry.purchase.totalUnits : null;
    for (const line of entry.purchase.products) {
      db.prepare(
        `INSERT INTO daily_purchase_items (id, purchase_id, product_id, product_name, quantity, unit_cost)
         VALUES (?, ?, NULL, ?, ?, ?)`,
      ).run(uuidv4(), purchaseId, line.name, line.quantity, unitCost);
    }
  } else if (existingPurchase) {
    db.prepare(`DELETE FROM daily_purchase_items WHERE purchase_id = ?`).run(existingPurchase.id);
    db.prepare(`DELETE FROM daily_purchases WHERE id = ?`).run(existingPurchase.id);
  }

  db.prepare(`DELETE FROM operational_actions WHERE business_id = ? AND date = ?`).run(businessId, date);
  for (const action of entry.suggestedActions ?? []) {
    db.prepare(
      `INSERT INTO operational_actions (id, business_id, date, title, description, status, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'diary', ?, ?)`,
    ).run(action.id, businessId, date, action.title, action.description, action.status, now, now);
  }

  db.prepare(`DELETE FROM product_hypotheses WHERE business_id = ? AND date = ?`).run(businessId, date);
  for (const h of entry.productHypotheses ?? []) {
    db.prepare(
      `INSERT INTO product_hypotheses (id, business_id, date, flavor, hypothesis, confirmed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      businessId,
      date,
      h.flavor,
      h.hypothesis,
      h.confirmed === null ? null : h.confirmed ? 1 : 0,
      now,
      now,
    );
  }

  db.prepare(`DELETE FROM operational_lessons WHERE business_id = ? AND date = ?`).run(businessId, date);
  if (entry.lessonsLearned?.trim()) {
    db.prepare(
      `INSERT INTO operational_lessons (id, business_id, date, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      businessId,
      date,
      entry.lessonsLearned.trim(),
      entry.tags ? JSON.stringify(entry.tags) : null,
      now,
      now,
    );
  }
}

function backfillDiaries() {
  const done = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(BACKFILL_KEY);
  if (done) {
    console.log("Backfill já executado — sincronizando diários novamente.");
  }

  const rows = db
    .prepare(`SELECT content FROM notes WHERE entity_type = 'operational_diary'`)
    .all();
  for (const row of rows) {
    syncDiaryRow(row.content);
  }

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, 'done', ?)
     ON CONFLICT(key) DO UPDATE SET value = 'done', updated_at = excluded.updated_at`,
  ).run(BACKFILL_KEY, now);
}

migrateSchema();
backfillDiaries();
console.log("✓ Migração de inteligência operacional concluída.");
db.close();
