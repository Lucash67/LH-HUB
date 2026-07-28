import { eq } from "drizzle-orm";
import { getPostgresDb } from "@/platform/db";
import { fromDbBusinessId } from "@/platform/db/business-id";
import {
  getOperationDayIdForDate,
  syncDiaryRelationalTables,
} from "@/platform/db/repositories/diary-repository";
import { queryAll, queryOne, toNumber } from "@/platform/db/query";
import {
  dailyPurchaseItems,
  dailyPurchases,
  operationDays,
  operationalActions,
  operationalLessons,
  operationalLosses,
  productHypotheses,
} from "@/lib/db/postgres/schema";
import type { OperationalDiaryEntry } from "@/lib/diary/types";

export type PaymentStatus = "paid" | "pending" | "partial";

export function inferPaymentStatusFromNotes(notesText: string | null | undefined): PaymentStatus {
  const lower = (notesText ?? "").toLowerCase();
  if (lower.includes("fiado") || lower.includes("devendo") || lower.includes("pendente")) {
    return "pending";
  }
  return "paid";
}

export function resolveAmountReceived(
  totalAmount: number,
  paymentStatus: PaymentStatus,
  explicit?: number | null,
): number {
  if (explicit != null) return explicit;
  if (paymentStatus === "pending") return 0;
  if (paymentStatus === "partial") return 0;
  return totalAmount;
}

export async function syncDiaryToRelationalTables(entry: OperationalDiaryEntry): Promise<void> {
  const operationDayId = await getOperationDayIdForDate(entry.businessId, entry.date);
  if (!operationDayId) return;
  await syncDiaryRelationalTables(operationDayId, entry);
}

export async function getDailyPurchaseForDay(businessId: string, date: string) {
  const operationDayId = await getOperationDayIdForDate(businessId, date);
  if (!operationDayId) return null;

  const db = await getPostgresDb();
  const purchase = await queryOne(
    db.select().from(dailyPurchases).where(eq(dailyPurchases.operationDayId, operationDayId)),
  );
  if (!purchase) return null;

  const items = await queryAll(
    db
      .select()
      .from(dailyPurchaseItems)
      .where(eq(dailyPurchaseItems.dailyPurchaseId, purchase.id)),
  );

  return {
    id: purchase.id,
    businessId,
    date,
    totalUnits: purchase.totalUnits,
    investment: toNumber(purchase.totalInvestment),
    items: items.map((item) => ({
      id: item.id,
      purchaseId: item.dailyPurchaseId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitCost: item.unitCost != null ? toNumber(item.unitCost) : null,
    })),
  };
}

export async function getOperationalLossesForDay(businessId: string, date: string) {
  const operationDayId = await getOperationDayIdForDate(businessId, date);
  if (!operationDayId) return [];

  const db = await getPostgresDb();
  const rows = await queryAll(
    db
      .select()
      .from(operationalLosses)
      .where(eq(operationalLosses.operationDayId, operationDayId)),
  );

  return rows.map((row) => ({
    id: row.id,
    businessId,
    date,
    productId: row.productId,
    productName: row.productName,
    quantity: row.quantity,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getOperationalDayIntelligence(businessId: string, date: string) {
  const operationDayId = await getOperationDayIdForDate(businessId, date);
  if (!operationDayId) {
    return {
      purchase: null,
      losses: [],
      actions: [],
      hypotheses: [],
      lessons: [],
    };
  }

  const db = await getPostgresDb();
  const day = await queryOne(db.select().from(operationDays).where(eq(operationDays.id, operationDayId)));
  const resolvedBusinessId = day ? fromDbBusinessId(day.businessId) : businessId;

  const [actions, hypotheses, lessons] = await Promise.all([
    queryAll(
      db
        .select()
        .from(operationalActions)
        .where(eq(operationalActions.operationDayId, operationDayId)),
    ),
    queryAll(
      db
        .select()
        .from(productHypotheses)
        .where(eq(productHypotheses.operationDayId, operationDayId)),
    ),
    queryAll(
      db
        .select()
        .from(operationalLessons)
        .where(eq(operationalLessons.operationDayId, operationDayId)),
    ),
  ]);

  return {
    purchase: await getDailyPurchaseForDay(resolvedBusinessId, date),
    losses: await getOperationalLossesForDay(resolvedBusinessId, date),
    actions: actions.map((row) => ({
      id: row.externalId ?? row.id,
      businessId: resolvedBusinessId,
      date,
      title: row.title,
      description: row.description,
      status: row.status,
      source: row.source,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    hypotheses: hypotheses.map((row) => ({
      id: row.id,
      businessId: resolvedBusinessId,
      date,
      flavor: row.flavor,
      hypothesis: row.hypothesis,
      confirmed: row.confirmed,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    lessons: lessons.map((row) => ({
      id: row.id,
      businessId: resolvedBusinessId,
      date,
      content: row.content,
      tags: row.tags ? JSON.stringify(row.tags) : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
  };
}
