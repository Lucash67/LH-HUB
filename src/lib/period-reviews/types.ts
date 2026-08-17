import { z } from "zod";

export const PERIOD_REVIEW_SCHEMA_VERSION = 1;

export const periodTypeSchema = z.enum(["weekly", "monthly"]);
export type PeriodType = z.infer<typeof periodTypeSchema>;

export const periodReviewStatusSchema = z.enum(["draft", "published"]);
export type PeriodReviewStatus = z.infer<typeof periodReviewStatusSchema>;

export const periodCauseSchema = z.object({
  rank: z.number().int().min(1),
  title: z.string().min(1),
  detail: z.string().min(1),
  impact: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  badge: z.string().optional(),
});
export type PeriodCause = z.infer<typeof periodCauseSchema>;

export const periodActionSchema = z.object({
  title: z.string().min(1),
  why: z.string().min(1),
  measure: z.string().min(1),
  done: z.boolean().optional(),
});
export type PeriodAction = z.infer<typeof periodActionSchema>;

export const periodChannelRowSchema = z.object({
  name: z.string(),
  previousRevenue: z.number(),
  currentRevenue: z.number(),
  previousProfit: z.number(),
  currentProfit: z.number(),
});

export const periodMetricsBlockSchema = z.object({
  label: z.string(),
  start: z.string(),
  end: z.string(),
  revenue: z.number(),
  diaryProfit: z.number(),
  unitsSold: z.number(),
  unitsLost: z.number(),
  ownCapital: z.number(),
  familyCapital: z.number(),
  purchaseInvestment: z.number(),
});

export const comparePointSchema = z.object({
  label: z.string(),
  previous: z.number(),
  current: z.number(),
});

export const volumeRowSchema = z.object({
  metric: z.string(),
  previous: z.string(),
  current: z.string(),
  delta: z.string(),
});

export const periodPillSchema = z.object({
  label: z.string(),
  tone: z.enum(["warning", "danger", "success", "neutral"]).default("neutral"),
});

/** Snapshot congelado — espelha o canvas de análise. */
export const metricsSnapshotSchema = z.object({
  current: periodMetricsBlockSchema,
  previous: periodMetricsBlockSchema,
  pills: z.array(periodPillSchema).optional(),
  dailyProfitCompare: z.array(comparePointSchema).optional(),
  dailyProfitNote: z.string().optional(),
  dailyAcalRevenueCompare: z.array(comparePointSchema).optional(),
  dailyAcalNote: z.string().optional(),
  channels: z.array(periodChannelRowSchema).optional(),
  volumeRows: z.array(volumeRowSchema).optional(),
  chartTitleProfit: z.string().optional(),
  chartTitleAcal: z.string().optional(),
  footerNote: z.string().optional(),
});
export type MetricsSnapshot = z.infer<typeof metricsSnapshotSchema>;

export const periodReviewSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().min(1),
  periodType: periodTypeSchema,
  periodKey: z.string().min(1),
  rangeStart: z.string(),
  rangeEnd: z.string(),
  status: periodReviewStatusSchema,
  title: z.string(),
  headline: z.string(),
  summary: z.string(),
  causes: z.array(periodCauseSchema),
  actions: z.array(periodActionSchema),
  channelNotes: z.array(z.unknown()).default([]),
  metricsSnapshot: metricsSnapshotSchema,
  bodyMd: z.string().default(""),
  fairReading: z.string().default(""),
  nextGoals: z.string().default(""),
  schemaVersion: z.number().int().default(PERIOD_REVIEW_SCHEMA_VERSION),
  createdBy: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PeriodReview = z.infer<typeof periodReviewSchema>;

export const periodReviewUpsertSchema = z.object({
  businessId: z.string().min(1).optional(),
  periodType: periodTypeSchema,
  periodKey: z.string().min(1),
  rangeStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rangeEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: periodReviewStatusSchema.default("published"),
  title: z.string().default(""),
  headline: z.string().min(1),
  summary: z.string().min(1),
  causes: z.array(periodCauseSchema).default([]),
  actions: z.array(periodActionSchema).default([]),
  channelNotes: z.array(z.unknown()).optional(),
  metricsSnapshot: metricsSnapshotSchema,
  bodyMd: z.string().optional(),
  fairReading: z.string().optional(),
  nextGoals: z.string().optional(),
});
export type PeriodReviewUpsert = z.infer<typeof periodReviewUpsertSchema>;
