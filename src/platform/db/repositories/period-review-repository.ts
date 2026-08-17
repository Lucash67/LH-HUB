import { and, desc, eq } from "drizzle-orm";
import { getPostgresDb, isPostgres } from "@/platform/db";
import { toDbBusinessId, fromDbBusinessId } from "@/platform/db/business-id";
import { periodReviews as pgPeriodReviews } from "@/lib/db/postgres/schema";
import { queryAll, queryOne, toDateString, toIsoTimestamp } from "@/platform/db/query";
import {
  PERIOD_REVIEW_SCHEMA_VERSION,
  metricsSnapshotSchema,
  periodActionSchema,
  periodCauseSchema,
  type PeriodReview,
  type PeriodReviewUpsert,
  type PeriodType,
} from "@/lib/period-reviews/types";

function requirePostgres() {
  if (!isPostgres()) {
    throw new Error("Retratos (period_reviews) exigem DB_PROVIDER=postgres.");
  }
}

function mapRow(row: typeof pgPeriodReviews.$inferSelect): PeriodReview {
  const causes = Array.isArray(row.causes)
    ? row.causes.map((c) => periodCauseSchema.parse(c))
    : [];
  const actions = Array.isArray(row.actions)
    ? row.actions.map((a) => periodActionSchema.parse(a))
    : [];
  const metricsSnapshot = metricsSnapshotSchema.parse(row.metricsSnapshot ?? {});

  return {
    id: row.id,
    businessId: fromDbBusinessId(row.businessId),
    periodType: row.periodType,
    periodKey: row.periodKey,
    rangeStart: toDateString(row.rangeStart),
    rangeEnd: toDateString(row.rangeEnd),
    status: row.status,
    title: row.title ?? "",
    headline: row.headline ?? "",
    summary: row.summary ?? "",
    causes,
    actions,
    channelNotes: Array.isArray(row.channelNotes) ? row.channelNotes : [],
    metricsSnapshot,
    bodyMd: row.bodyMd ?? "",
    fairReading: row.fairReading ?? "",
    nextGoals: row.nextGoals ?? "",
    schemaVersion: row.schemaVersion ?? PERIOD_REVIEW_SCHEMA_VERSION,
    createdBy: row.createdBy,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
  };
}

export async function findPeriodReview(
  businessId: string,
  periodType: PeriodType,
  periodKey: string,
): Promise<PeriodReview | null> {
  requirePostgres();
  const db = await getPostgresDb();
  const dbBusinessId = toDbBusinessId(businessId);
  const row = await queryOne(
    db
      .select()
      .from(pgPeriodReviews)
      .where(
        and(
          eq(pgPeriodReviews.businessId, dbBusinessId),
          eq(pgPeriodReviews.periodType, periodType),
          eq(pgPeriodReviews.periodKey, periodKey),
        ),
      )
      .limit(1),
  );
  return row ? mapRow(row) : null;
}

export async function listPeriodReviews(
  businessId: string,
  periodType?: PeriodType,
): Promise<PeriodReview[]> {
  requirePostgres();
  const db = await getPostgresDb();
  const dbBusinessId = toDbBusinessId(businessId);
  const rows = await queryAll(
    db
      .select()
      .from(pgPeriodReviews)
      .where(
        periodType
          ? and(eq(pgPeriodReviews.businessId, dbBusinessId), eq(pgPeriodReviews.periodType, periodType))
          : eq(pgPeriodReviews.businessId, dbBusinessId),
      )
      .orderBy(desc(pgPeriodReviews.rangeStart)),
  );
  return rows.map(mapRow);
}

export async function upsertPeriodReview(
  input: PeriodReviewUpsert & { businessId: string; createdBy?: string | null },
): Promise<PeriodReview> {
  requirePostgres();
  const db = await getPostgresDb();
  const now = new Date();
  const dbBusinessId = toDbBusinessId(input.businessId);

  const existing = await findPeriodReview(input.businessId, input.periodType, input.periodKey);

  if (existing) {
    const [updated] = await db
      .update(pgPeriodReviews)
      .set({
        rangeStart: input.rangeStart,
        rangeEnd: input.rangeEnd,
        status: input.status,
        title: input.title,
        headline: input.headline,
        summary: input.summary,
        causes: input.causes,
        actions: input.actions,
        channelNotes: input.channelNotes ?? [],
        metricsSnapshot: input.metricsSnapshot,
        bodyMd: input.bodyMd ?? "",
        fairReading: input.fairReading ?? "",
        nextGoals: input.nextGoals ?? "",
        schemaVersion: PERIOD_REVIEW_SCHEMA_VERSION,
        updatedAt: now,
      })
      .where(eq(pgPeriodReviews.id, existing.id))
      .returning();
    return mapRow(updated!);
  }

  const [inserted] = await db
    .insert(pgPeriodReviews)
    .values({
      businessId: dbBusinessId,
      periodType: input.periodType,
      periodKey: input.periodKey,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      status: input.status,
      title: input.title,
      headline: input.headline,
      summary: input.summary,
      causes: input.causes,
      actions: input.actions,
      channelNotes: input.channelNotes ?? [],
      metricsSnapshot: input.metricsSnapshot,
      bodyMd: input.bodyMd ?? "",
      fairReading: input.fairReading ?? "",
      nextGoals: input.nextGoals ?? "",
      schemaVersion: PERIOD_REVIEW_SCHEMA_VERSION,
      createdBy: input.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return mapRow(inserted!);
}

export async function deletePeriodReview(id: string, businessId: string): Promise<boolean> {
  requirePostgres();
  const db = await getPostgresDb();
  const dbBusinessId = toDbBusinessId(businessId);
  const deleted = await db
    .delete(pgPeriodReviews)
    .where(and(eq(pgPeriodReviews.id, id), eq(pgPeriodReviews.businessId, dbBusinessId)))
    .returning({ id: pgPeriodReviews.id });
  return deleted.length > 0;
}
