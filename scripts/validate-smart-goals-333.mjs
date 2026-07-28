/**
 * Sprint 3.3.3 — Validação Metas Inteligentes
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

function fail(msg) {
  console.error("✗", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("✓", msg);
}

const salesCount = db
  .prepare(`SELECT COUNT(*) as c FROM sales WHERE business_id = 'salgados'`)
  .get().c;
if (salesCount === 0) fail("Sem vendas Salgados para calcular metas");
else ok(`${salesCount} vendas Salgados no banco`);

const days = db
  .prepare(
    `SELECT date, COUNT(*) as tx, ROUND(SUM(COALESCE(amount_received, total_amount)), 2) as rev
     FROM sales WHERE business_id = 'salgados'
     GROUP BY date ORDER BY date`,
  )
  .all();
ok(`${days.length} dias operacionais com vendas`);

const items = db
  .prepare(
    `SELECT SUM(si.quantity) as units FROM sale_items si
     JOIN sales s ON s.id = si.sale_id WHERE s.business_id = 'salgados'`,
  )
  .get();
ok(`${items.units ?? 0} unidades vendidas no histórico`);

const diary = db
  .prepare(
    `SELECT content FROM notes WHERE entity_type = 'operational_diary' AND entity_id LIKE 'salgados:%' ORDER BY created_at DESC LIMIT 1`,
  )
  .get();
if (diary) {
  try {
    const parsed = JSON.parse(diary.content);
    if (parsed.dailyGoalUnits) ok(`Diário com meta manual: ${parsed.dailyGoalUnits} un.`);
  } catch {
    fail("Diário corrupto");
  }
} else {
  ok("Diário opcional — metas usarão histórico puro");
}

const pending = db
  .prepare(
    `SELECT COUNT(*) as c FROM sales WHERE business_id = 'salgados' AND payment_status = 'pending'`,
  )
  .get().c;
if (pending > 0) ok(`${pending} venda(s) pendente(s) — recomendação de cobrança disponível`);

console.log("\n--- Resumo operacional ---");
for (const d of days) {
  console.log(`  ${d.date}: ${d.tx} vendas · R$ ${d.rev}`);
}

console.log("\nValidação estrutural concluída. Execute pnpm exec tsc --noEmit para TypeScript.");
