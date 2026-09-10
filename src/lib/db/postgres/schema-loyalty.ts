import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Fidelidade semanal — FKs reais estão na migration SQL.
 * Evita import circular com schema.ts (que reexporta este módulo).
 */
export const loyaltyPrograms = pgTable(
  "loyalty_programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").notNull(),
    name: text("name").notNull(),
    active: boolean("active").notNull().default(true),
    weekStartDay: smallint("week_start_day").notNull().default(1),
    weekEndDay: smallint("week_end_day").notNull().default(5),
    totalUnitsRequired: integer("total_units_required").notNull().default(6),
    maxRewardsPerWeek: integer("max_rewards_per_week").notNull().default(1),
    rewardQuantity: integer("reward_quantity").notNull().default(1),
    rewardProductRule: text("reward_product_rule", {
      enum: ["any_eligible", "same_as_purchase", "fixed_product"],
    })
      .notNull()
      .default("any_eligible"),
    fixedRewardProductId: uuid("fixed_reward_product_id"),
    allProductsEligible: boolean("all_products_eligible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessNameUnique: uniqueIndex("idx_loyalty_programs_business_name").on(
      table.businessId,
      table.name,
    ),
    businessActiveIdx: index("idx_loyalty_programs_business_active").on(
      table.businessId,
      table.active,
    ),
  }),
);

export const loyaltyProgramProducts = pgTable(
  "loyalty_program_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull(),
    productId: uuid("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueProgramProduct: unique().on(table.programId, table.productId),
  }),
);

export const loyaltyParticipants = pgTable(
  "loyalty_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull(),
    clientId: uuid("client_id").notNull(),
    active: boolean("active").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueProgramClient: unique().on(table.programId, table.clientId),
    programActiveIdx: index("idx_loyalty_participants_program_active").on(
      table.programId,
      table.active,
    ),
    clientIdx: index("idx_loyalty_participants_client").on(table.clientId),
  }),
);

export const loyaltyWeeks = pgTable(
  "loyalty_weeks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull(),
    clientId: uuid("client_id").notNull(),
    weekStart: date("week_start").notNull(),
    weekEnd: date("week_end").notNull(),
    totalUnits: integer("total_units").notNull().default(0),
    status: text("status", {
      enum: [
        "not_started",
        "in_progress",
        "almost_there",
        "completed",
        "reward_available",
        "reward_scheduled",
        "reward_delivered",
        "week_closed_incomplete",
      ],
    })
      .notNull()
      .default("not_started"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueProgramClientWeek: unique().on(table.programId, table.clientId, table.weekStart),
    programWeekIdx: index("idx_loyalty_weeks_program_week").on(table.programId, table.weekStart),
    clientIdx: index("idx_loyalty_weeks_client").on(table.clientId, table.weekStart),
    totalUnitsCheck: check("loyalty_weeks_total_units_check", sql`${table.totalUnits} >= 0`),
  }),
);

export const loyaltyEntries = pgTable(
  "loyalty_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loyaltyWeekId: uuid("loyalty_week_id").notNull(),
    programId: uuid("program_id").notNull(),
    clientId: uuid("client_id").notNull(),
    saleId: uuid("sale_id"),
    entryDate: date("entry_date").notNull(),
    weekday: smallint("weekday").notNull(),
    quantity: integer("quantity").notNull(),
    entryType: text("entry_type", {
      enum: ["purchase", "reversal", "adjustment"],
    }).notNull(),
    description: text("description").notNull().default(""),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    weekIdx: index("idx_loyalty_entries_week").on(table.loyaltyWeekId, table.entryDate),
    clientDateIdx: index("idx_loyalty_entries_client_date").on(table.clientId, table.entryDate),
  }),
);

export const loyaltyRewards = pgTable(
  "loyalty_rewards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loyaltyWeekId: uuid("loyalty_week_id").notNull(),
    programId: uuid("program_id").notNull(),
    clientId: uuid("client_id").notNull(),
    status: text("status", {
      enum: ["available", "scheduled", "delivered", "cancelled", "invalidated"],
    })
      .notNull()
      .default("available"),
    productId: uuid("product_id"),
    scheduledFor: date("scheduled_for"),
    observation: text("observation"),
    deliverySaleId: uuid("delivery_sale_id"),
    createdBy: uuid("created_by"),
    deliveredBy: uuid("delivered_by"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
    invalidationReason: text("invalidation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    weekIdx: index("idx_loyalty_rewards_week").on(table.loyaltyWeekId),
    statusIdx: index("idx_loyalty_rewards_status").on(table.programId, table.status),
  }),
);

export const loyaltyEvents = pgTable(
  "loyalty_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id").notNull(),
    clientId: uuid("client_id"),
    loyaltyWeekId: uuid("loyalty_week_id"),
    loyaltyEntryId: uuid("loyalty_entry_id"),
    loyaltyRewardId: uuid("loyalty_reward_id"),
    saleId: uuid("sale_id"),
    eventType: text("event_type", {
      enum: [
        "purchase_confirmed",
        "sale_cancelled",
        "progress_updated",
        "goal_completed",
        "reward_created",
        "reward_scheduled",
        "reward_delivered",
        "reward_cancelled",
        "reward_invalidated",
        "manual_adjustment",
        "reversal",
        "participant_joined",
        "participant_left",
        "week_closed",
      ],
    }).notNull(),
    quantity: integer("quantity"),
    description: text("description").notNull().default(""),
    metadata: jsonb("metadata").notNull().default({}),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    programCreatedIdx: index("idx_loyalty_events_program_created").on(
      table.programId,
      table.createdAt,
    ),
    clientIdx: index("idx_loyalty_events_client").on(table.clientId, table.createdAt),
    weekIdx: index("idx_loyalty_events_week").on(table.loyaltyWeekId, table.createdAt),
  }),
);

/** ID fixo do programa seed Salgados (migration 0016). */
export const SALGADOS_LOYALTY_PROGRAM_ID = "00000000-0000-4000-8000-000000000101";
