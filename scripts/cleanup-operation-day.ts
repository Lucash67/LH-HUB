/**
 * Remove todos os registros operacionais de uma data (vendas, diário, compras, investimentos).
 * Uso: pnpm tsx scripts/cleanup-operation-day.ts salgados 2026-07-28 2099-01-03
 */
import "./load-env";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  cashFlowEvents,
  dailyInvestments,
  dailyPurchases,
  diaryEntries,
  operationDays,
  operationalActions,
  operationalLessons,
  productHypotheses,
  products,
  saleItems,
  sales,
  stockMovements,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function recalcProductStock(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;
  const db = await getPostgresDb();

  for (const productId of productIds) {
    const last = await queryAll(
      db
        .select({ balanceAfter: stockMovements.balanceAfter })
        .from(stockMovements)
        .where(eq(stockMovements.productId, productId))
        .orderBy(desc(stockMovements.createdAt))
        .limit(1),
    );
    const balance = last[0]?.balanceAfter ?? 0;
    await queryRun(
      db
        .update(products)
        .set({ stockQuantity: balance, updatedAt: new Date() })
        .where(eq(products.id, productId)),
    );
  }
}

async function cleanupOperationDay(businessSlug: string, operationDate: string): Promise<void> {
  if (!isValidIsoDate(operationDate)) {
    throw new Error(`Data inválida: ${operationDate}`);
  }

  const db = await getPostgresDb();
  const businessId = toDbBusinessId(businessSlug);

  const dayRows = await queryAll(
    db
      .select({ id: operationDays.id })
      .from(operationDays)
      .where(
        and(eq(operationDays.businessId, businessId), eq(operationDays.operationDate, operationDate)),
      ),
  );

  if (dayRows.length === 0) {
    const orphanSales = await queryAll(
      db
        .select({ id: sales.id })
        .from(sales)
        .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, operationDate))),
    );
    if (orphanSales.length === 0) {
      console.log(`Nada para limpar em ${operationDate}.`);
      return;
    }

    const saleIds = orphanSales.map((r) => r.id);
    const movements = await queryAll(
      db
        .select({ productId: stockMovements.productId })
        .from(stockMovements)
        .where(or(inArray(stockMovements.saleId, saleIds))),
    );
    const productIds = [...new Set(movements.map((m) => m.productId))];

    await queryRun(db.delete(cashFlowEvents).where(inArray(cashFlowEvents.saleId, saleIds)));
    await queryRun(db.delete(stockMovements).where(inArray(stockMovements.saleId, saleIds)));
    await queryRun(db.delete(saleItems).where(inArray(saleItems.saleId, saleIds)));
    await queryRun(db.delete(sales).where(inArray(sales.id, saleIds)));
    await recalcProductStock(productIds);
    console.log(`Limpeza órfã ${operationDate}: ${saleIds.length} venda(s).`);
    return;
  }

  const operationDayId = dayRows[0].id;

  const saleRows = await queryAll(
    db.select({ id: sales.id }).from(sales).where(eq(sales.operationDayId, operationDayId)),
  );
  const saleIds = saleRows.map((r) => r.id);

  const movementRows = await queryAll(
    db
      .select({ productId: stockMovements.productId })
      .from(stockMovements)
      .where(
        saleIds.length > 0
          ? or(
              eq(stockMovements.operationDayId, operationDayId),
              inArray(stockMovements.saleId, saleIds),
            )
          : eq(stockMovements.operationDayId, operationDayId),
      ),
  );
  const productIds = [...new Set(movementRows.map((m) => m.productId))];

  if (saleIds.length > 0) {
    await queryRun(db.delete(cashFlowEvents).where(inArray(cashFlowEvents.saleId, saleIds)));
    await queryRun(db.delete(stockMovements).where(inArray(stockMovements.saleId, saleIds)));
    await queryRun(db.delete(saleItems).where(inArray(saleItems.saleId, saleIds)));
    await queryRun(db.delete(sales).where(inArray(sales.id, saleIds)));
  }

  await queryRun(
    db.delete(stockMovements).where(eq(stockMovements.operationDayId, operationDayId)),
  );
  await queryRun(db.delete(cashFlowEvents).where(eq(cashFlowEvents.operationDayId, operationDayId)));
  await queryRun(db.delete(dailyPurchases).where(eq(dailyPurchases.operationDayId, operationDayId)));
  await queryRun(db.delete(dailyInvestments).where(eq(dailyInvestments.operationDayId, operationDayId)));
  await queryRun(db.delete(diaryEntries).where(eq(diaryEntries.operationDayId, operationDayId)));
  await queryRun(
    db.delete(operationalLessons).where(eq(operationalLessons.operationDayId, operationDayId)),
  );
  await queryRun(
    db.delete(productHypotheses).where(eq(productHypotheses.operationDayId, operationDayId)),
  );
  await queryRun(
    db.delete(operationalActions).where(eq(operationalActions.operationDayId, operationDayId)),
  );
  await queryRun(db.delete(operationDays).where(eq(operationDays.id, operationDayId)));

  await recalcProductStock(productIds);

  console.log(
    `Limpeza ${operationDate}: operation_day removido, ${saleIds.length} venda(s), ${productIds.length} produto(s) recalculados.`,
  );
}

async function main(): Promise<void> {
  const [, , businessSlug = "salgados", ...dates] = process.argv;

  if (dates.length === 0) {
    console.error("Informe ao menos uma data (yyyy-MM-dd).");
    process.exit(1);
  }

  for (const date of dates) {
    await cleanupOperationDay(businessSlug, date);
  }
}

if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` ||
  process.argv[1]?.includes("cleanup-operation-day")
) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { cleanupOperationDay };
