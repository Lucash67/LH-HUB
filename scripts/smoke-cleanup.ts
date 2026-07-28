/**
 * Remove artefatos criados pelo smoke test PostgreSQL.
 * Chamado no início (limpeza de execuções anteriores) e no finally (garantia idempotente).
 */
import { and, eq, inArray } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  cashFlowEvents,
  clients,
  products,
  saleItems,
  sales,
  stockMovements,
} from "../src/lib/db/postgres/schema";

export const SMOKE_PRODUCT_NAME = "Smoke Test Product";
export const SMOKE_CLIENT_NAME = "Smoke Test Client";

export async function cleanupSmokeArtifacts(businessSlug = "salgados"): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(businessSlug);

  const productRows = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.businessId, businessId), eq(products.name, SMOKE_PRODUCT_NAME)));

  const clientRows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.name, SMOKE_CLIENT_NAME));

  const productIds = productRows.map((r) => r.id);
  const clientIds = clientRows.map((r) => r.id);

  if (productIds.length === 0 && clientIds.length === 0) return;

  const saleIdSet = new Set<string>();

  if (productIds.length > 0) {
    const viaItems = await db
      .select({ saleId: saleItems.saleId })
      .from(saleItems)
      .where(inArray(saleItems.productId, productIds));
    viaItems.forEach((r) => saleIdSet.add(r.saleId));
  }

  if (clientIds.length > 0) {
    const viaClients = await db
      .select({ id: sales.id })
      .from(sales)
      .where(inArray(sales.clientId, clientIds));
    viaClients.forEach((r) => saleIdSet.add(r.id));
  }

  const saleIds = [...saleIdSet];

  if (saleIds.length > 0) {
    await db.delete(cashFlowEvents).where(inArray(cashFlowEvents.saleId, saleIds));
    await db.delete(saleItems).where(inArray(saleItems.saleId, saleIds));
    await db.delete(stockMovements).where(inArray(stockMovements.saleId, saleIds));
    await db.delete(sales).where(inArray(sales.id, saleIds));
  }

  if (productIds.length > 0) {
    await db.delete(stockMovements).where(inArray(stockMovements.productId, productIds));
    await db.delete(products).where(inArray(products.id, productIds));
  }

  if (clientIds.length > 0) {
    await db.delete(clients).where(inArray(clients.id, clientIds));
  }
}

export async function findSmokeProductId(businessSlug = "salgados"): Promise<string | null> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(businessSlug);
  const row = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.businessId, businessId),
        eq(products.name, SMOKE_PRODUCT_NAME),
        eq(products.status, "active"),
      ),
    )
    .limit(1);
  return row[0]?.id ?? null;
}

export async function findSmokeClientId(): Promise<string | null> {
  const db = await getPostgresDb();
  const row = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.name, SMOKE_CLIENT_NAME))
    .limit(1);
  return row[0]?.id ?? null;
}
