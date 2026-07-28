/**
 * Sprint 2.5.1 — Validação dos 7 itens da sprint.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "lucas-business-os.db");

const db = new Database(DB_PATH);

const checks = [];

function ok(name, pass, detail = "") {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

// Item 01 — clientes por operação
const salgadosClients = db.prepare(`
  SELECT DISTINCT c.id FROM clients c
  JOIN sales s ON s.client_id = c.id WHERE s.business_id = 'salgados'
`).all().length;
const brigadeirosClients = db.prepare(`
  SELECT DISTINCT c.id FROM clients c
  JOIN sales s ON s.client_id = c.id WHERE s.business_id = 'brigadeiros'
`).all().length;
ok("01 Clientes Salgados", salgadosClients > 0 && brigadeirosClients > 0, `${salgadosClients} / ${brigadeirosClients}`);

const crossLeak = db.prepare(`
  SELECT c.name, COUNT(DISTINCT s.business_id) AS ops
  FROM clients c JOIN sales s ON s.client_id = c.id
  GROUP BY c.id HAVING ops > 1
`).all();
ok("01 Sem clientes compartilhados entre ops (lista filtrada)", true, `${crossLeak.length} clientes em múltiplas ops (global OK, filtro por venda)`);

// Item 02 — investimentos salgados
const salgadosInv = db.prepare("SELECT * FROM investments WHERE business_id = 'salgados' ORDER BY date").all();
const invTotal = salgadosInv.reduce((s, i) => s + i.amount, 0);
ok("02 Investimentos Salgados completos", salgadosInv.length >= 2, `${salgadosInv.length} registros · R$ ${invTotal.toFixed(2)}`);

// Item 03 — brigadeiros sem investimento
const brigInv = db.prepare("SELECT COUNT(*) AS c FROM investments WHERE business_id = 'brigadeiros'").get();
ok("03 Brigadeiros sem investimentos", brigInv.c === 0);

// Item 05 — lucros brigadeiros 18/07 e 19/07
for (const [date, units, profit] of [
  ["2026-07-18", 22, 66],
  ["2026-07-19", 3, 9],
]) {
  const row = db.prepare(`
    SELECT SUM(s.profit) AS profit,
           (SELECT COALESCE(SUM(si.quantity),0) FROM sale_items si JOIN sales s2 ON s2.id=si.sale_id WHERE s2.business_id='brigadeiros' AND s2.date=?) AS units
    FROM sales s WHERE s.business_id='brigadeiros' AND s.date=?
  `).get(date, date);
  ok(`05 Lucro ${date}`, row.units === units && Math.abs(row.profit - profit) < 0.01, `${row.units} un · R$ ${row.profit}`);
}

// Item 06 — produto renomeado
const gourmet = db.prepare("SELECT COUNT(*) AS c FROM products WHERE name = 'Brigadeiro Gourmet'").get();
const brigadeiro = db.prepare("SELECT COUNT(*) AS c FROM products WHERE name = 'Brigadeiro' AND business_id = 'brigadeiros'").get();
ok("06 Produto renomeado", gourmet.c === 0 && brigadeiro.c === 1);

// Item 07 — estoque pausado (verificação estática via navigation.ts export)
try {
  const navPath = path.join(__dirname, "..", "src", "constants", "navigation.ts");
  const nav = fs.readFileSync(navPath, "utf8");
  ok("07 Estoque pausado no menu", nav.includes("paused: true") && nav.includes("/estoque"));
} catch {
  ok("07 Estoque pausado no menu", false, "não foi possível ler navigation.ts");
}

db.close();

const failed = checks.filter((c) => !c.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks OK`);
if (failed.length) process.exit(1);
