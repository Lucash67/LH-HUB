import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { getDb } from "../src/platform/db";
import { products, clients } from "../src/lib/db/schema";
import { executeSaleOperation } from "../src/domains/sales/sale-operation-handler";
import { getDashboardMetrics, getFinancialSummary, getClientDetails } from "../src/lib/analytics";
import { getBusinessEngine } from "../src/core/engine";
import { DEFAULT_BUSINESS_ID } from "../src/core/contracts";
import { generateCorrelationId } from "../src/shared/ids/generate-id";

const DB_PATH = path.join(process.cwd(), "data", "lucas-business-os.db");
const failures: string[] = [];

function check(label: string, ok: boolean, detail = "") {
  console.log(ok ? `✓ ${label}` : `✗ ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

async function main() {
  const db = getDb();
  const productId = uuidv4();
  const clientId = uuidv4();
  const now = new Date().toISOString();

  db.insert(products).values({
    id: productId,
    businessId: "salgados",
    name: "__VALIDATE__ Croissant",
    category: "Salgados",
    price: 8,
    cost: 3.5,
    supplierId: null,
    stockQuantity: 20,
    soldQuantity: 0,
    minStock: 5,
    imageUrl: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(clients).values({
    id: clientId,
    name: "__VALIDATE__ Ana",
    sector: "RH",
    company: null,
    phone: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
  }).run();

  const sale = executeSaleOperation({
    productId,
    quantity: 2,
    clientId,
    paymentMethod: "pix",
  });

  check("sale created", Boolean(sale.saleId));

  const metrics = getDashboardMetrics();
  check("dashboard revenue today", metrics.revenueToday >= 16, String(metrics.revenueToday));

  const productAfter = db.select().from(products).where(eq(products.id, productId)).get();
  check("stock after sale", productAfter?.stockQuantity === 18, String(productAfter?.stockQuantity));

  const fin = getFinancialSummary();
  check("financial gross revenue", fin.grossRevenue >= 16, String(fin.grossRevenue));

  const details = getClientDetails(clientId);
  check("client purchase count", details?.purchaseCount === 1);
  check("client total spent", details?.totalSpent === 16, String(details?.totalSpent));

  const engine = getBusinessEngine();
  const opResult = await engine.process("1 Croissant Ana pix", {
    businessId: DEFAULT_BUSINESS_ID,
    correlationId: generateCorrelationId(),
    source: "api",
    options: { force: true, dryRun: false },
  });
  check("business engine executed", opResult.status === "executed", opResult.status);

  const sqlite = new Database(DB_PATH);
  const opCount = sqlite.prepare("SELECT COUNT(*) as c FROM operations WHERE status = 'executed'").get() as { c: number };
  check("operations table", opCount.c >= 1, String(opCount.c));

  sqlite.prepare("DELETE FROM effect_records WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
  sqlite.prepare("DELETE FROM domain_events WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
  sqlite.prepare("DELETE FROM operation_interpretations WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
  sqlite.prepare("DELETE FROM operation_payloads WHERE operation_id IN (SELECT id FROM operations WHERE date(created_at) = date('now'))").run();
  sqlite.prepare("DELETE FROM operations WHERE date(created_at) = date('now')").run();
  sqlite.prepare("DELETE FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
  sqlite.prepare("DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
  sqlite.prepare("DELETE FROM sales WHERE date = date('now')").run();
  sqlite.prepare("DELETE FROM clients WHERE name LIKE '__VALIDATE__%'").run();
  sqlite.prepare("DELETE FROM products WHERE name LIKE '__VALIDATE__%'").run();
  sqlite.close();

  if (failures.length) {
    console.log("\nFAILURES:", failures.join(", "));
    process.exit(1);
  }

  console.log("\nAll direct checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
