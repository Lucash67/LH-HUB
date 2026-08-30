/**
 * OMNI CRM — schema isolado (`crm.*`).
 *
 * NÃO misturar com tabelas do OMNI Business (`public.*`) nem Schedule.
 * Auth compartilha apenas `public.users` (FK lógica por UUID).
 *
 * Uso: freela de sites/softwares — pipeline de leads → fechamento.
 */
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const crmSchema = pgSchema("crm");

export const CRM_CONTACT_TYPES = ["lead", "client"] as const;
export const CRM_MEMBER_ROLES = ["owner", "member"] as const;

/** Workspace do freela (≠ public.businesses). */
export const crmWorkspaces = crmSchema.table(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    timezone: text("timezone").notNull().default("America/Fortaleza"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("idx_crm_workspaces_slug").on(t.slug),
  }),
);

export const crmWorkspaceMembers = crmSchema.table(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => crmWorkspaces.id, { onDelete: "cascade" }),
    /** FK lógica para public.users.id */
    userId: uuid("user_id").notNull(),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wsUserIdx: uniqueIndex("idx_crm_ws_members_ws_user").on(t.workspaceId, t.userId),
    userIdx: index("idx_crm_ws_members_user").on(t.userId),
  }),
);

export const crmContacts = crmSchema.table(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => crmWorkspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    contactType: text("contact_type").notNull().default("lead"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wsIdx: index("idx_crm_contacts_ws").on(t.workspaceId),
    nameIdx: index("idx_crm_contacts_name").on(t.workspaceId, t.name),
  }),
);

export const crmPipelineStages = crmSchema.table(
  "pipeline_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => crmWorkspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isWon: boolean("is_won").notNull().default(false),
    isLost: boolean("is_lost").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wsSlugIdx: uniqueIndex("idx_crm_stages_ws_slug").on(t.workspaceId, t.slug),
    wsSortIdx: index("idx_crm_stages_ws_sort").on(t.workspaceId, t.sortOrder),
  }),
);

export const crmDeals = crmSchema.table(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => crmWorkspaces.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(() => crmContacts.id, { onDelete: "set null" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => crmPipelineStages.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull().default("0"),
    source: text("source"),
    notes: text("notes"),
    expectedClose: date("expected_close"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wsIdx: index("idx_crm_deals_ws").on(t.workspaceId),
    stageIdx: index("idx_crm_deals_stage").on(t.stageId),
    contactIdx: index("idx_crm_deals_contact").on(t.contactId),
  }),
);
