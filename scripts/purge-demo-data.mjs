/**
 * Purge all demonstration seed data. Single transaction — rollback on any error.
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, "data", "lucas-business-os.db");
const BACKUP_DIR = path.join(ROOT, "backups");

const TABLES_IN_ORDER = [
  "effect_records",
  "domain_events",
  "operation_interpretations",
  "operation_payloads",
  "operations",
  "payments",
  "sale_items",
  "sales",
  "stock_movements",
  "clients",
  "products",
  "goals",
  "settings",
];

const VALIDATE_TABLES = [
  ["products", "Products"],
  ["clients", "Clients"],
  ["sales", "Sales"],
  ["operations", "Operations"],
  ["effect_records", "Effect Records"],
  ["domain_events", "Domain Events"],
  ["goals", "Goals"],
  ["settings", "Business Settings"],
];

function countTable(db, table) {
  return db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
}

function main() {
  const started = Date.now();

  if (!fs.existsSync(DB_PATH)) {
    console.error("DB not found:", DB_PATH);
    process.exit(1);
  }

  const backups = fs.existsSync(BACKUP_DIR)
    ? fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith("backup-") && f.endsWith(".db"))
    : [];
  console.log("BACKUP_PRESERVED:", backups.length > 0 ? backups.join(", ") : "none found");

  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");

  const removed = {};

  const purge = db.transaction(() => {
    for (const table of TABLES_IN_ORDER) {
      const before = countTable(db, table);
      db.prepare(`DELETE FROM ${table}`).run();
      const after = countTable(db, table);
      removed[table] = before - after;
      if (after !== 0) {
        throw new Error(`Table ${table} still has ${after} rows after DELETE`);
      }
    }
  });

  try {
    purge();
  } catch (error) {
    console.error("ROLLBACK: transaction failed — no changes committed.");
    console.error(error);
    db.close();
    process.exit(1);
  }

  console.log("\n=== REMOVED BY TABLE ===");
  let totalRemoved = 0;
  for (const table of TABLES_IN_ORDER) {
    console.log(`${table}: ${removed[table]}`);
    totalRemoved += removed[table];
  }
  console.log(`TOTAL_REMOVED: ${totalRemoved}`);

  console.log("\n=== VALIDATION ===");
  let valid = true;
  for (const [table, label] of VALIDATE_TABLES) {
    const c = countTable(db, table);
    const dots = ".".repeat(Math.max(1, 18 - label.length));
    console.log(`${label}${dots}${c}`);
    if (c !== 0) valid = false;
  }

  const elapsed = Date.now() - started;
  console.log(`\nELAPSED_MS: ${elapsed}`);
  console.log(`DB_PATH: ${DB_PATH}`);

  db.close();

  if (!valid) {
    console.error("VALIDATION FAILED");
    process.exit(1);
  }

  console.log("PURGE_OK");
}

main();
