import { and, eq, gte, lte, type SQL } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "@/platform/db";
import { resolveBusinessScopeId } from "@/platform/db/mappers";
import { fromDbBusinessId } from "@/platform/db/business-id";
import { mapClientRow, mapGoalRow, mapProductRow, mapSaleRow } from "@/platform/db/mappers";
import { queryAll } from "@/platform/db/query";
import {
  clients as sqliteClients,
  goals as sqliteGoals,
  products as sqliteProducts,
  saleItems as sqliteSaleItems,
  sales as sqliteSales,
} from "@/lib/db/schema";
import {
  clients as pgClients,
  goals as pgGoals,
  products as pgProducts,
  saleItems as pgSaleItems,
  sales as pgSales,
} from "@/lib/db/postgres/schema";
import { ALL_BUSINESSES_ID, isAllBusinesses } from "@/lib/business-units";
import type { MetricProduct, MetricSale, MetricSaleItem } from "@/lib/analytics-engine/types";

export interface ScopedSalesQuery {
  businessId?: string;
  dateEq?: string;
  dateGte?: string;
  dateLte?: string;
}

function toMetricSale(row: ReturnType<typeof mapSaleRow>): MetricSale {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    clientId: row.clientId,
    paymentMethod: row.paymentMethod ?? undefined,
    paymentStatus: row.paymentStatus,
    amountReceived: row.amountReceived,
    totalAmount: row.totalAmount,
    profit: row.profit,
    totalCost: row.totalCost,
    department: row.department,
    businessId: row.businessId,
  };
}

function toMetricProduct(row: ReturnType<typeof mapProductRow>): MetricProduct {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    cost: row.cost,
    stockQuantity: row.stockQuantity,
    minStock: row.minStock,
    businessId: row.businessId,
    status: row.status,
  };
}

export async function fetchMetricSales(query: ScopedSalesQuery = {}): Promise<MetricSale[]> {
  const businessId = query.businessId ?? ALL_BUSINESSES_ID;

  if (isPostgres()) {
    const db = await getPostgresDb();
    const conditions: SQL[] = [];
    if (!isAllBusinesses(businessId)) {
      conditions.push(eq(pgSales.businessId, resolveBusinessScopeId(businessId)));
    }
    if (query.dateEq) conditions.push(eq(pgSales.saleDate, query.dateEq));
    if (query.dateGte) conditions.push(gte(pgSales.saleDate, query.dateGte));
    if (query.dateLte) conditions.push(lte(pgSales.saleDate, query.dateLte));

    const rows =
      conditions.length > 0
        ? await queryAll(db.select().from(pgSales).where(and(...conditions)))
        : await queryAll(db.select().from(pgSales));
    return rows.map((r) => toMetricSale(mapSaleRow(r)));
  }

  const db = getSqliteDb();
  const conditions: SQL[] = [];
  if (!isAllBusinesses(businessId)) {
    conditions.push(eq(sqliteSales.businessId, businessId));
  }
  if (query.dateEq) conditions.push(eq(sqliteSales.date, query.dateEq));
  if (query.dateGte) conditions.push(gte(sqliteSales.date, query.dateGte));
  if (query.dateLte) conditions.push(lte(sqliteSales.date, query.dateLte));

  const rows =
    conditions.length > 0
      ? await queryAll(db.select().from(sqliteSales).where(and(...conditions)))
      : await queryAll(db.select().from(sqliteSales));
  return rows.map((r) => toMetricSale(mapSaleRow(r)));
}

export async function fetchMetricProducts(
  businessId: string = ALL_BUSINESSES_ID,
  activeOnly = false,
): Promise<MetricProduct[]> {
  if (isPostgres()) {
    const db = await getPostgresDb();
    let rows = isAllBusinesses(businessId)
      ? await queryAll(db.select().from(pgProducts))
      : await queryAll(
          db
            .select()
            .from(pgProducts)
            .where(eq(pgProducts.businessId, resolveBusinessScopeId(businessId))),
        );
    if (activeOnly) rows = rows.filter((r) => r.status === "active");
    return rows.map((r) => toMetricProduct(mapProductRow(r)));
  }

  const db = getSqliteDb();
  let rows = isAllBusinesses(businessId)
    ? await queryAll(db.select().from(sqliteProducts))
    : await queryAll(
        db.select().from(sqliteProducts).where(eq(sqliteProducts.businessId, businessId)),
      );
  if (activeOnly) rows = rows.filter((r) => r.status === "active");
  return rows.map((r) => toMetricProduct(mapProductRow(r)));
}

export async function fetchMetricSaleItems(saleIds: string[]): Promise<MetricSaleItem[]> {
  if (saleIds.length === 0) return [];
  const idSet = new Set(saleIds);

  if (isPostgres()) {
    const db = await getPostgresDb();
    const rows = (await queryAll(db.select().from(pgSaleItems))).filter((i) =>
      idSet.has(i.saleId),
    );
    return rows.map((i) => ({
      saleId: i.saleId,
      productId: i.productId,
      quantity: i.quantity,
      subtotal: Number(i.subtotal),
      profit: Number(i.profit),
    }));
  }

  const db = getSqliteDb();
  const rows = (await queryAll(db.select().from(sqliteSaleItems))).filter((i) =>
    idSet.has(i.saleId),
  );
  return rows.map((i) => ({
    saleId: i.saleId,
    productId: i.productId,
    quantity: i.quantity,
    subtotal: i.subtotal,
    profit: i.profit,
  }));
}

export async function fetchMetricClients() {
  if (isPostgres()) {
    const db = await getPostgresDb();
    return (await queryAll(db.select().from(pgClients))).map(mapClientRow);
  }
  const db = getSqliteDb();
  return (await queryAll(db.select().from(sqliteClients))).map(mapClientRow);
}

export async function fetchMetricGoals(businessId: string = ALL_BUSINESSES_ID) {
  let allGoals: ReturnType<typeof mapGoalRow>[];

  if (isPostgres()) {
    const db = await getPostgresDb();
    allGoals = (await queryAll(db.select().from(pgGoals))).map(mapGoalRow);
  } else {
    const db = getSqliteDb();
    allGoals = (await queryAll(db.select().from(sqliteGoals))).map(mapGoalRow);
  }

  if (!isAllBusinesses(businessId)) {
    return allGoals.filter((g) => g.businessId === businessId);
  }

  const aggregated = new Map<string, (typeof allGoals)[number]>();
  for (const goal of allGoals) {
    const current = aggregated.get(goal.type);
    if (current) {
      aggregated.set(goal.type, {
        ...current,
        targetAmount: current.targetAmount + goal.targetAmount,
      });
    } else {
      aggregated.set(goal.type, { ...goal, id: `all-${goal.type}` });
    }
  }
  return Array.from(aggregated.values());
}

export { fromDbBusinessId };
