/**
 * Sprint 2.5.2 — Validação reconciliação Brigadeiros.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const checks = [];
function ok(name, pass, detail = "") {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const totals = db.prepare(`
  SELECT SUM(total_amount) AS rev, SUM(profit) AS prof, COUNT(*) AS cnt,
         SUM(CASE WHEN client_id IS NOT NULL THEN 1 ELSE 0 END) AS clients
  FROM sales WHERE business_id = 'brigadeiros'
`).get();

ok("Lucro total R$ 128", totals.prof === 128);
ok("Receita total R$ 128", totals.rev === 128);
ok("3 registros agregados", totals.cnt === 3);
ok("Sem clientes", totals.clients === 0);

const l001 = db.prepare("SELECT profit FROM sales WHERE id = 'brig-lote-001-2026-07-10'").get();
ok("Lote 001 R$ 44", l001?.profit === 44);

const l002 = db.prepare(`
  SELECT SUM(profit) AS p FROM sales
  WHERE id IN ('brig-lote-002-2026-07-18', 'brig-lote-002-fim-2026-07-19')
`).get();
ok("Lote 002 R$ 84", l002.p === 84);

const times = db.prepare(`
  SELECT COUNT(*) AS c FROM sales WHERE business_id = 'brigadeiros' AND time != '00:00'
`).get();
ok("Sem horários detalhados", times.c === 0, "time=00:00 modo simplificado");

const units = db.prepare(`
  SELECT SUM(si.quantity) AS sold FROM sale_items si
  JOIN sales s ON s.id = si.sale_id WHERE s.business_id = 'brigadeiros'
`).get();
ok("43 unidades vendidas", units.sold === 43);

const prod = db.prepare(`
  SELECT p.stock_quantity, p.sold_quantity FROM products p
  WHERE p.business_id = 'brigadeiros' AND p.name = 'Brigadeiro'
`).get();
ok("Estoque zerado", prod.stock_quantity === 0 && prod.sold_quantity === 43);

db.close();
if (checks.some((c) => !c.pass)) process.exit(1);
console.log(`\n${checks.length}/${checks.length} OK`);
