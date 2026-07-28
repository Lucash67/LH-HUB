import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { getPostgresDb, getSqliteDb, isPostgres, runInTransactionAsync } from "@/platform/db";
import { mapSaleRow, resolveBusinessScopeId } from "@/platform/db/mappers";
import { ensureOperationDayId } from "@/platform/db/repositories/operation-day-repository";
import { getProductById, updateProductStock } from "@/platform/db/repositories/product-repository";
import { queryAll, queryOne, queryRun, toIsoTimestamp } from "@/platform/db/query";
import { toDbBusinessId } from "@/platform/db/business-id";
import {
  clients as sqliteClients,
  products as sqliteProducts,
  saleItems as sqliteSaleItems,
  sales as sqliteSales,
  payments as sqlitePayments,
} from "@/lib/db/schema";
import {
  saleItems as pgSaleItems,
  sales as pgSales,
  stockMovements as pgStockMovements,
} from "@/lib/db/postgres/schema";
import { isAllBusinesses } from "@/lib/business-units";
import {
  inferPaymentStatusFromNotes,
  resolveAmountReceived,
  type PaymentStatus,
} from "@/lib/operational-data-service";
import { generateId } from "@/shared/ids/generate-id";
import type { LegacyProduct, LegacySale } from "@/lib/db/types";
import { mapProductRow, mapClientRow } from "@/platform/db/mappers";
import { clients as pgClients, products as pgProducts } from "@/lib/db/postgres/schema";

export async function listSalesEnriched(businessId: string) {
  let salesRows: LegacySale[];

  if (isPostgres()) {
    const db = await getPostgresDb();
    const raw = isAllBusinesses(businessId)
      ? await queryAll(db.select().from(pgSales).orderBy(desc(pgSales.saleDate), desc(pgSales.saleTime)))
      : await queryAll(
          db
            .select()
            .from(pgSales)
            .where(eq(pgSales.businessId, resolveBusinessScopeId(businessId)))
            .orderBy(desc(pgSales.saleDate), desc(pgSales.saleTime)),
        );
    salesRows = raw.map(mapSaleRow);

    const clients = (await queryAll(db.select().from(pgClients))).map(mapClientRow);
    const products = (await queryAll(db.select().from(pgProducts))).map(mapProductRow);
    const clientMap = new Map(clients.map((c) => [c.id, c]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enriched = [];
    for (const sale of salesRows) {
      const items = await queryAll(
        db.select().from(pgSaleItems).where(eq(pgSaleItems.saleId, sale.id)),
      );

      enriched.push({
        ...sale,
        client: sale.clientId ? clientMap.get(sale.clientId) ?? null : null,
        items: items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          unitCost: Number(item.unitCost),
          subtotal: Number(item.subtotal),
          profit: Number(item.profit),
          product: productMap.get(item.productId),
        })),
      });
    }
    return enriched;
  }

  const db = getSqliteDb();
  const raw = isAllBusinesses(businessId)
      ? await queryAll(db.select().from(sqliteSales).orderBy(desc(sqliteSales.date), desc(sqliteSales.time)))
      : await queryAll(
          db
            .select()
            .from(sqliteSales)
            .where(eq(sqliteSales.businessId, businessId))
            .orderBy(desc(sqliteSales.date), desc(sqliteSales.time)),
        );
    salesRows = raw.map(mapSaleRow);

  const clients = (await queryAll(db.select().from(sqliteClients))).map(mapClientRow);
  const products = (await queryAll(db.select().from(sqliteProducts))).map(mapProductRow);
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const enriched = [];
  for (const sale of salesRows) {
    const items = await queryAll(
      db.select().from(sqliteSaleItems).where(eq(sqliteSaleItems.saleId, sale.id)),
    );

    enriched.push({
      ...sale,
      client: sale.clientId ? clientMap.get(sale.clientId) ?? null : null,
      items: items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
        subtotal: item.subtotal,
        profit: item.profit,
        product: productMap.get(item.productId),
      })),
    });
  }

  return enriched;
}

export interface ExecuteSaleInput {
  productId: string;
  quantity: number;
  clientId?: string | null;
  paymentMethod: "pix" | "card" | "cash";
  paymentStatus?: PaymentStatus;
  date?: string;
  time?: string;
  department?: string | null;
  notes?: string | null;
}

export async function executeSaleRecord(input: ExecuteSaleInput): Promise<string> {
  const product = await getProductById(input.productId);
  if (!product) {
    throw new Error("Produto não encontrado. Cadastre o produto antes de vender.");
  }

  const qty = input.quantity;
  if (qty <= 0) {
    throw new Error("Informe uma quantidade válida (mínimo 1).");
  }

  const subtotal = product.price * qty;
  const cost = product.cost * qty;
  const profit = subtotal - cost;
  const now = new Date();
  const saleId = generateId();
  const saleItemId = generateId();
  const saleDate = input.date ?? format(now, "yyyy-MM-dd");
  const saleTime = input.time ?? format(now, "HH:mm");
  const paymentStatus = input.paymentStatus ?? inferPaymentStatusFromNotes(input.notes);
  const amountReceived = resolveAmountReceived(subtotal, paymentStatus);
  const stockBefore = product.stockQuantity;
  const stockAfter = Math.max(0, product.stockQuantity - qty);

  await runInTransactionAsync(async () => {
    if (isPostgres()) {
      const db = await getPostgresDb();
      const operationDayId = await ensureOperationDayId(product.businessId, saleDate);
      await queryRun(
        db.insert(pgSales).values({
          id: saleId,
          businessId: toDbBusinessId(product.businessId),
          operationDayId,
          clientId: input.clientId ?? null,
          saleDate,
          saleTime: `${saleTime}:00`,
          department: input.department ?? null,
          paymentMethod: input.paymentMethod,
          paymentStatus,
          amountReceived: String(amountReceived),
          totalAmount: String(subtotal),
          totalCost: String(cost),
          profit: String(profit),
          notes: input.notes ?? null,
          createdAt: now,
          updatedAt: now,
        }),
      );
      await queryRun(
        db.insert(pgSaleItems).values({
          id: saleItemId,
          saleId,
          productId: input.productId,
          quantity: qty,
          unitPrice: String(product.price),
          unitCost: String(product.cost),
          subtotal: String(subtotal),
          profit: String(profit),
          flavorConfidence: "confirmed",
        }),
      );
      await queryRun(
        db.insert(pgStockMovements).values({
          productId: input.productId,
          operationDayId,
          saleId,
          movementType: "exit",
          quantity: qty,
          balanceAfter: stockAfter,
          reason: "sale",
          createdAt: now,
        }),
      );
      await updateProductStock(input.productId, stockAfter);
      return;
    }

    const db = getSqliteDb();
    const paymentId = generateId();
    await queryRun(
      db.insert(sqliteSales).values({
        id: saleId,
        businessId: product.businessId,
        date: saleDate,
        time: saleTime,
        clientId: input.clientId ?? null,
        department: input.department ?? null,
        paymentMethod: input.paymentMethod,
        paymentStatus,
        amountReceived,
        totalAmount: subtotal,
        totalCost: cost,
        profit,
        notes: input.notes ?? null,
        createdAt: toIsoTimestamp(now),
        updatedAt: toIsoTimestamp(now),
      }),
    );
    await queryRun(
      db.insert(sqliteSaleItems).values({
        id: saleItemId,
        saleId,
        productId: input.productId,
        quantity: qty,
        unitPrice: product.price,
        unitCost: product.cost,
        subtotal,
        profit,
      }),
    );
    await queryRun(
      db.insert(sqlitePayments).values({
        id: paymentId,
        saleId,
        method: input.paymentMethod,
        amount: amountReceived > 0 ? amountReceived : subtotal,
        createdAt: toIsoTimestamp(now),
      }),
    );
    await updateProductStock(input.productId, stockAfter, product.soldQuantity + qty);
  });

  return saleId;
}

export async function getSaleProduct(productId: string): Promise<LegacyProduct | undefined> {
  return getProductById(productId);
}
