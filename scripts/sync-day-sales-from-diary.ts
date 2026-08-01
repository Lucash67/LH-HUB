/**
 * Recalcula vendas de um dia para bater com o diário (faturamento/lucro do rascunho).
 * Uso: pnpm tsx scripts/sync-day-sales-from-diary.ts salgados 2026-07-28
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  diaryEntries,
  operationDays,
  saleItems,
  sales,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { resolveAmountReceived } from "../src/lib/operational-data-service";

async function syncDaySalesFromDiary(businessSlug: string, operationDate: string): Promise<void> {
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
    console.log(`Nenhum operation_day para ${operationDate}.`);
    return;
  }

  const operationDayId = dayRows[0].id;

  const diaryRows = await queryAll(
    db.select().from(diaryEntries).where(eq(diaryEntries.operationDayId, operationDayId)),
  );
  if (diaryRows.length === 0) {
    console.log(`Diário não encontrado para ${operationDate}.`);
    return;
  }

  const diary = diaryRows[0];
  const revenue = Number(diary.revenueReceived);
  const profit = Number(diary.operationalProfit);
  const quantitySold = diary.quantitySold;

  if (quantitySold <= 0) {
    console.log(`Diário sem unidades vendidas para ${operationDate}.`);
    return;
  }

  const unitPrice = revenue / quantitySold;
  const unitCost = (revenue - profit) / quantitySold;

  const saleRows = await queryAll(
    db.select().from(sales).where(eq(sales.operationDayId, operationDayId)),
  );

  if (saleRows.length === 0) {
    console.log(`Nenhuma venda para ${operationDate}.`);
    return;
  }

  let updated = 0;
  for (const sale of saleRows) {
    const items = await queryAll(
      db.select().from(saleItems).where(eq(saleItems.saleId, sale.id)),
    );
    if (items.length === 0) continue;

    const item = items[0];
    const qty = item.quantity;
    const subtotal = unitPrice * qty;
    const cost = unitCost * qty;
    const saleProfit = subtotal - cost;
    const paymentStatus = sale.paymentStatus ?? "paid";
    const amountReceived = resolveAmountReceived(subtotal, paymentStatus);
    const now = new Date();

    await queryRun(
      db
        .update(saleItems)
        .set({
          unitPrice: String(unitPrice),
          unitCost: String(unitCost),
          subtotal: String(subtotal),
          profit: String(saleProfit),
        })
        .where(eq(saleItems.id, item.id)),
    );

    await queryRun(
      db
        .update(sales)
        .set({
          totalAmount: String(subtotal),
          totalCost: String(cost),
          profit: String(saleProfit),
          amountReceived: String(amountReceived),
          updatedAt: now,
        })
        .where(eq(sales.id, sale.id)),
    );

    updated += 1;
  }

  console.log(
    `Sincronizado ${operationDate}: ${updated} venda(s) com R$${unitPrice.toFixed(2)}/un (custo R$${unitCost.toFixed(2)}/un).`,
  );
}

async function main(): Promise<void> {
  const [, , businessSlug = "salgados", operationDate] = process.argv;
  if (!operationDate) {
    console.error("Informe a data (yyyy-MM-dd).");
    process.exit(1);
  }
  await syncDaySalesFromDiary(businessSlug, operationDate);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
