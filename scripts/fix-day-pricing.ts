/**
 * Corrige preços de vendas e catálogo para o padrão R$ 5/un e recalcula investimento compartilhado.
 * Uso: pnpm tsx scripts/fix-day-pricing.ts salgados 2026-07-28
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  dailyInvestments,
  operationDays,
  products,
  saleItems,
  sales,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { resolveAmountReceived } from "../src/lib/operational-data-service";
import { resolveDayRegistrationPricing } from "../src/lib/day-registration/pricing";
import type { DayRegistrationPlan } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { generateId } from "../src/shared/ids/generate-id";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function fixDayPricing(businessSlug: string, operationDate: string): Promise<void> {
  const entry = await getDiaryEntry(businessSlug, operationDate);
  if (!entry) {
    console.log(`Sem diário em ${operationDate}.`);
    return;
  }

  const plan: DayRegistrationPlan = {
    businessId: businessSlug,
    date: operationDate,
    purchase: entry.purchase
      ? {
          totalUnits: entry.purchase.totalUnits,
          investment: entry.purchase.investment,
          ownInvestment: undefined,
          thirdParty: undefined,
          products: entry.purchase.products.map((p) => ({ name: p.name, quantity: p.quantity })),
        }
      : undefined,
    summary: {
      revenue: entry.revenue.received,
      profit: entry.profit,
      quantitySold: entry.quantitySold,
      quantityLost: entry.quantityLost ?? 0,
    },
    sales: [],
    newClients: [],
  };

  const pricing = resolveDayRegistrationPricing(plan);
  const { unitPrice, unitCostFull, unitCostOwn } = pricing;

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
    console.log(`Sem operation_day em ${operationDate}.`);
    return;
  }

  const operationDayId = dayRows[0].id;
  const saleRows = await queryAll(
    db.select().from(sales).where(eq(sales.operationDayId, operationDayId)),
  );

  const productIds = new Set<string>();
  let updatedSales = 0;

  for (const sale of saleRows) {
    const items = await queryAll(
      db.select().from(saleItems).where(eq(saleItems.saleId, sale.id)),
    );
    if (items.length === 0) continue;

    const item = items[0];
    productIds.add(item.productId);
    const qty = item.quantity;
    const subtotal = roundMoney(unitPrice * qty);
    const cost = roundMoney(unitCostOwn * qty);
    const saleProfit = roundMoney(subtotal - cost);
    const paymentStatus = sale.paymentStatus ?? "paid";
    const amountReceived = resolveAmountReceived(subtotal, paymentStatus);
    const now = new Date();

    await queryRun(
      db
        .update(saleItems)
        .set({
          unitPrice: String(unitPrice),
          unitCost: String(unitCostOwn),
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

    updatedSales += 1;
  }

  for (const productId of productIds) {
    await queryRun(
      db
        .update(products)
        .set({
          unitPrice: String(unitPrice),
          unitCost: String(unitCostFull),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId)),
    );
  }

  if (pricing.thirdPartyInvestment > 0.01) {
    const existingInvestments = await queryAll(
      db
        .select()
        .from(dailyInvestments)
        .where(eq(dailyInvestments.operationDayId, operationDayId)),
    );

    const hasSplitRows =
      existingInvestments.length >= 2 ||
      existingInvestments.some((row) => row.sourceType === "family");

    if (!hasSplitRows && pricing.thirdPartyInvestment > 0.01) {
      await queryRun(db.delete(dailyInvestments).where(eq(dailyInvestments.operationDayId, operationDayId)));
      await queryRun(
        db.insert(dailyInvestments).values({
          id: generateId(),
          operationDayId,
          amount: String(pricing.ownInvestment),
          investmentType: "additional",
          sourceType: "own_capital",
          sourceName: null,
          description: `Investimento próprio — compra diária ${operationDate}.`,
        }),
      );
      await queryRun(
        db.insert(dailyInvestments).values({
          id: generateId(),
          operationDayId,
          amount: String(pricing.thirdPartyInvestment),
          investmentType: "additional",
          sourceType: "family",
          sourceName: pricing.thirdPartyName,
          description: `Investimento ${pricing.thirdPartyName} — compra diária ${operationDate}.`,
        }),
      );
    }
  }

  await upsertDiaryEntry({
    ...entry,
    manualInsights: pricing.profitExplanation
      ? [pricing.profitExplanation, entry.manualInsights].filter(Boolean).join("\n\n")
      : entry.manualInsights,
    commercialIntelligence: pricing.thirdPartyInvestment > 0.01
      ? {
          whatWeLearnedToday: [
            `${pricing.thirdPartyName} dividiu R$${pricing.thirdPartyInvestment.toFixed(2)} do investimento (total R$${(plan.purchase?.investment ?? 0).toFixed(2)}).`,
            `Capital próprio na compra: R$${pricing.ownInvestment.toFixed(2)} — lucro operacional R$${entry.profit.toFixed(2)}.`,
          ],
          conclusion: pricing.profitExplanation ?? undefined,
        }
      : entry.commercialIntelligence,
  });

  console.log(
    `Preços corrigidos ${operationDate}: ${updatedSales} venda(s) a R$${unitPrice}/un (custo próprio R$${unitCostOwn}/un).`,
  );
  if (pricing.profitExplanation) console.log(pricing.profitExplanation);
}

async function main(): Promise<void> {
  const [, , businessSlug = "salgados", operationDate] = process.argv;
  if (!operationDate) {
    console.error("Informe a data (yyyy-MM-dd).");
    process.exit(1);
  }
  await fixDayPricing(businessSlug, operationDate);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.includes("fix-day-pricing")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
