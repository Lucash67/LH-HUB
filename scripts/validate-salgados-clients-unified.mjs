import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const checks = [
  { label: "Vanderson Dias", expect: { compras: 2, total: 15 } },
  { label: "Lucas Moraes", expect: { compras: 2, total: 10 } },
  { label: "Maria Mikelly", expect: { compras: 2, total: 10 } },
  { label: "Dayanna Kelly", expect: { compras: 2, total: 10 } },
  { label: "Jackson Mendes", expect: { compras: 2, total: 20 } },
  { label: "Raimunda", expect: { compras: 3, total: 15 } },
];

for (const check of checks) {
  const rows = db
    .prepare(
      `SELECT c.name, COUNT(s.id) as compras, ROUND(SUM(s.total_amount),2) as total,
              GROUP_CONCAT(s.date || ' ' || s.time ORDER BY s.date, s.time) as timeline
       FROM clients c
       JOIN sales s ON s.client_id = c.id AND s.business_id = 'salgados'
       WHERE lower(c.name) LIKE lower(?)
       GROUP BY c.id`,
    )
    .all(`%${check.label}%`);

  console.log(`\n${check.label}:`);
  console.table(rows);
  if (rows.length !== 1) {
    console.error(`  ✗ esperado 1 registro, got ${rows.length}`);
    process.exitCode = 1;
  } else if (rows[0].compras < check.expect.compras) {
    console.error(`  ✗ esperado ≥${check.expect.compras} compras`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ OK`);
  }
}

db.close();
