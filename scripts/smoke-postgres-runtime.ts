/**
 * Smoke test estrutural — PostgreSQL runtime.
 * Uso: npx tsx scripts/smoke-postgres-runtime.ts
 * Idempotente: limpa artefatos de teste no início e no finally.
 */
import "./load-env";
import { format } from "date-fns";
import {
  cleanupSmokeArtifacts,
  findSmokeClientId,
  findSmokeProductId,
  SMOKE_CLIENT_NAME,
  SMOKE_PRODUCT_NAME,
} from "./smoke-cleanup";

process.env.DB_PROVIDER = process.env.DB_PROVIDER ?? "postgres";
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function main() {
  const today = format(new Date(), "yyyy-MM-dd");
  const businessId = "salgados";
  const checks: Array<{ name: string; ok: boolean; error?: string }> = [];
  let exitCode = 0;

  async function check(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      checks.push({ name, ok: true });
      console.log(`✔ ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      checks.push({ name, ok: false, error: message });
      console.error(`✘ ${name}: ${message}`);
    }
  }

  await cleanupSmokeArtifacts(businessId);

  const { getPostgresDb } = await import("../src/platform/db/postgres/client");
  const { listBusinesses } = await import("../src/platform/db/repositories/business-repository");
  const { listProducts, createProduct } = await import("../src/platform/db/repositories/product-repository");
  const { listClientsRaw, createClient } = await import("../src/platform/db/repositories/client-repository");
  const { executeSaleRecord } = await import("../src/platform/db/repositories/sale-repository");
  const { listGoals } = await import("../src/platform/db/repositories/goal-repository");
  const { listSettingsMap } = await import("../src/platform/db/repositories/settings-repository");
  const { listStockProducts } = await import("../src/platform/db/repositories/stock-repository");
  const { getDiaryEntry, upsertDiaryEntry, deleteDiaryEntry } = await import("../src/lib/diary-service");
  const { getOperationalDayIntelligence } = await import("../src/lib/operational-data-service");
  const { getDashboardMetrics } = await import("../src/lib/analytics");
  const { getFinancialSummary } = await import("../src/lib/analytics");
  const { getRankings } = await import("../src/lib/analytics");
  const { generateInsights } = await import("../src/lib/insights-engine");
  const { getSmartGoalsView } = await import("../src/lib/smart-goals-service");
  const { operationRepository } = await import("../src/platform/db/repositories/operation-repository");

  try {
    await check("Postgres connection", async () => {
      await getPostgresDb();
    });

    await check("Businesses seed", async () => {
      const rows = await listBusinesses();
      if (rows.length === 0) throw new Error("No businesses seeded");
    });

    await check("Products list", async () => {
      await listProducts(businessId);
    });

    await check("Clients list", async () => {
      await listClientsRaw();
    });

    await check("Goals list", async () => {
      await listGoals(businessId);
    });

    await check("Settings list", async () => {
      await listSettingsMap();
    });

    await check("Stock list", async () => {
      await listStockProducts(businessId);
    });

    await check("Dashboard metrics", async () => {
      await getDashboardMetrics(businessId);
    });

    await check("Financial summary", async () => {
      await getFinancialSummary(businessId);
    });

    await check("Rankings", async () => {
      await getRankings(businessId);
    });

    await check("Insights", async () => {
      await generateInsights(businessId);
    });

    await check("Smart goals", async () => {
      await getSmartGoalsView(businessId, today);
    });

    await check("Engine operations list", async () => {
      await operationRepository.listRecent(5);
    });

    let productId = "";
    await check("Product CRUD", async () => {
      productId = (await findSmokeProductId(businessId)) ?? "";
      if (!productId) {
        productId = await createProduct({
          businessId,
          name: SMOKE_PRODUCT_NAME,
          category: "test",
          price: 10,
          cost: 5,
          stockQuantity: 20,
          minStock: 2,
        });
      }
      if (!productId) throw new Error("Product id missing");
    });

    let clientId = "";
    await check("Client CRUD", async () => {
      clientId = (await findSmokeClientId()) ?? "";
      if (!clientId) {
        clientId = await createClient({
          businessId,
          name: SMOKE_CLIENT_NAME,
        });
      }
    });

    await check("Sale CRUD", async () => {
      if (!productId) throw new Error("Missing product");
      await executeSaleRecord({
        productId,
        quantity: 1,
        clientId,
        paymentMethod: "pix",
        date: today,
      });
    });

    await check("Diary CRUD", async () => {
      await upsertDiaryEntry({
        version: 1,
        businessId,
        date: today,
        revenue: { received: 10, pending: 0, total: 10 },
        profit: 5,
        quantitySold: 1,
        quantityLost: 0,
        manualInsights: "Smoke test diary",
      });
      const entry = await getDiaryEntry(businessId, today);
      if (!entry) throw new Error("Diary not found after upsert");
      await getOperationalDayIntelligence(businessId, today);
      await deleteDiaryEntry(businessId, today);
    });

    const failed = checks.filter((c) => !c.ok);
    console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
    exitCode = failed.length > 0 ? 1 : 0;
  } finally {
    await cleanupSmokeArtifacts(businessId);
    const { closePostgresConnection } = await import("../src/platform/db/postgres/client");
    await closePostgresConnection();
    process.exit(exitCode);
  }
}

main();
