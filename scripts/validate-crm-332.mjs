/**
 * Sprint 3.3.2 — Validação CRM Inteligente
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

const clientsWithSales = db
  .prepare(
    `SELECT c.id, c.name, COUNT(s.id) as purchases, ROUND(COALESCE(SUM(COALESCE(s.amount_received, s.total_amount)), 0), 2) as spent
     FROM clients c
     LEFT JOIN sales s ON s.client_id = c.id AND s.business_id = 'salgados'
     GROUP BY c.id
     HAVING purchases > 0
     ORDER BY spent DESC`,
  )
  .all();

if (clientsWithSales.length === 0) fail("Nenhum cliente com compras");
else ok(`${clientsWithSales.length} clientes com histórico de compras`);

const mikely = clientsWithSales.find((c) => c.name.toLowerCase().includes("mikely"));
if (mikely) {
  const pending = db
    .prepare(`SELECT payment_status FROM sales WHERE client_id = ? AND payment_status = 'pending'`)
    .get(mikely.id);
  if (pending) ok("Mikely identificada com venda pendente (ação sugerida disponível)");
}

const topClient = clientsWithSales[0];
if (topClient && topClient.spent >= 10) {
  ok(`Cliente top faturamento: ${topClient.name} · R$ ${topClient.spent}`);
}

const saleItemsJoin = db
  .prepare(
    `SELECT COUNT(*) as c FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     WHERE s.client_id IS NOT NULL`,
  )
  .get();
if (saleItemsJoin.c > 0) ok(`Timeline pode exibir ${saleItemsJoin.c} linhas de produto`);

db.close();
if (process.exitCode) {
  console.log("\nValidação CRM FALHOU.");
  process.exit(1);
}
console.log("\nValidação CRM OK.");
