import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "lucas-business-os.db"));

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all();

const required = [
  "operations",
  "operation_payloads",
  "operation_interpretations",
  "effect_records",
  "domain_events",
];

const tableNames = tables.map((t) => t.name);
const missing = required.filter((t) => !tableNames.includes(t));
console.log("TABLES_OK:", missing.length === 0);
console.log("MISSING:", missing.join(", ") || "none");
console.log("TABLES:", tableNames.join(", "));

const ops = db
  .prepare(
    "SELECT id, status, operation_type, source FROM operations ORDER BY created_at DESC LIMIT 3",
  )
  .all();
console.log("OPERATIONS:", JSON.stringify(ops));

const events = db
  .prepare(
    "SELECT id, event_type, operation_id FROM domain_events ORDER BY occurred_at DESC LIMIT 3",
  )
  .all();
console.log("DOMAIN_EVENTS:", JSON.stringify(events));

const effects = db
  .prepare(
    "SELECT entity_type, entity_id, action FROM effect_records ORDER BY created_at DESC LIMIT 5",
  )
  .all();
console.log("EFFECTS:", JSON.stringify(effects));
