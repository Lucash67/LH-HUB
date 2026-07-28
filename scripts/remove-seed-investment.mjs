import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "lucas-business-os.db"));
const r = db
  .prepare("DELETE FROM investments WHERE id = '0bac6724-a451-43bd-853d-29d4693ecb62'")
  .run();
console.log("deleted_seed_investment:", r.changes);
console.log("investments:", db.prepare("SELECT id, amount, date, description FROM investments").all());
db.close();
