import { and, desc, eq } from "drizzle-orm";
import { getPostgresDb } from "@/platform/db/postgres/client";
import { queryAll } from "@/platform/db/query";
import {
  clients,
  loyaltyEntries,
  loyaltyEvents,
  loyaltyParticipants,
  loyaltyPrograms,
  loyaltyRewards,
  loyaltyWeeks,
  products,
} from "@/lib/db/postgres/schema";
import {
  ensureLoyaltyProgram,
  getActiveLoyaltyProgram,
} from "@/lib/loyalty/loyalty-service";
import {
  evaluateWeeklyLoyaltyProgress,
  formatLoyaltyWeekLabel,
  getLoyaltyWeekBounds,
  LOYALTY_STATUS_LABELS,
  type DayBreakdown,
  type LoyaltyWeekStatus,
  type WeeklyLoyaltyProgress,
} from "@/lib/loyalty/evaluate";
import { format } from "date-fns";

function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

export interface LoyaltyDashboardMetrics {
  participants: number;
  activeProgress: number;
  completedThisWeek: number;
  rewardsAvailable: number;
  rewardsScheduled: number;
  rewardsDelivered: number;
  previousWeekIncomplete: number;
  completionRate: number | null;
  avgUnitsPerParticipant: number | null;
}

export interface LoyaltyWeekRow {
  clientId: string;
  clientName: string;
  weekId: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  byDay: DayBreakdown;
  totalUnits: number;
  unitsTowardGoal: number;
  unitsRequired: number;
  progressPercent: number;
  remaining: number;
  status: LoyaltyWeekStatus;
  statusLabel: string;
  rewardStatus: string | null;
}

export interface LoyaltyView {
  program: {
    id: string;
    name: string;
    totalUnitsRequired: number;
    maxRewardsPerWeek: number;
    rewardQuantity: number;
  };
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  metrics: LoyaltyDashboardMetrics;
  rows: LoyaltyWeekRow[];
  almostThere: Array<{
    clientId: string;
    clientName: string;
    unitsTowardGoal: number;
    unitsRequired: number;
    remaining: number;
  }>;
  products: Array<{ id: string; name: string }>;
}

async function progressForWeekRow(
  week: typeof loyaltyWeeks.$inferSelect,
  unitsRequired: number,
): Promise<WeeklyLoyaltyProgress> {
  const db = await getPostgresDb();
  const entries = await queryAll(
    db.select().from(loyaltyEntries).where(eq(loyaltyEntries.loyaltyWeekId, week.id)),
  );
  const rewards = await queryAll(
    db.select().from(loyaltyRewards).where(eq(loyaltyRewards.loyaltyWeekId, week.id)),
  );
  return evaluateWeeklyLoyaltyProgress({
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    totalUnitsRequired: unitsRequired,
    entries: entries.map((e) => ({
      entryDate: e.entryDate,
      quantity: e.quantity,
      entryType: e.entryType,
    })),
    rewards: rewards.map((r) => ({ status: r.status })),
    todayIso: todayIso(),
  });
}

export async function getLoyaltyView(
  businessSlug: string,
  weekStartParam?: string,
): Promise<LoyaltyView> {
  const program = await ensureLoyaltyProgram(businessSlug);
  const { weekStart, weekEnd } = weekStartParam
    ? getLoyaltyWeekBounds(weekStartParam)
    : getLoyaltyWeekBounds(todayIso());

  const db = await getPostgresDb();

  const participants = await queryAll(
    db
      .select({
        id: loyaltyParticipants.id,
        clientId: loyaltyParticipants.clientId,
        active: loyaltyParticipants.active,
        clientName: clients.name,
      })
      .from(loyaltyParticipants)
      .innerJoin(clients, eq(clients.id, loyaltyParticipants.clientId))
      .where(and(eq(loyaltyParticipants.programId, program.id), eq(loyaltyParticipants.active, true))),
  );

  const weeks = await queryAll(
    db
      .select()
      .from(loyaltyWeeks)
      .where(and(eq(loyaltyWeeks.programId, program.id), eq(loyaltyWeeks.weekStart, weekStart))),
  );
  const weekByClient = new Map(weeks.map((w) => [w.clientId, w]));

  const rewardsAll = await queryAll(
    db
      .select()
      .from(loyaltyRewards)
      .where(eq(loyaltyRewards.programId, program.id)),
  );

  const rows: LoyaltyWeekRow[] = [];
  for (const p of participants) {
    let week = weekByClient.get(p.clientId);
    if (!week) {
      // semana virtual vazia
      const progress = evaluateWeeklyLoyaltyProgress({
        weekStart,
        weekEnd,
        totalUnitsRequired: program.totalUnitsRequired,
        entries: [],
        rewards: [],
        todayIso: todayIso(),
      });
      rows.push({
        clientId: p.clientId,
        clientName: p.clientName,
        weekId: "",
        weekStart,
        weekEnd,
        weekLabel: formatLoyaltyWeekLabel(weekStart, weekEnd),
        byDay: progress.byDay,
        totalUnits: 0,
        unitsTowardGoal: 0,
        unitsRequired: program.totalUnitsRequired,
        progressPercent: 0,
        remaining: program.totalUnitsRequired,
        status: progress.status,
        statusLabel: LOYALTY_STATUS_LABELS[progress.status],
        rewardStatus: null,
      });
      continue;
    }

    const progress = await progressForWeekRow(week, program.totalUnitsRequired);
    const weekRewards = rewardsAll.filter((r) => r.loyaltyWeekId === week!.id);
    const open = weekRewards.find((r) => r.status === "available" || r.status === "scheduled" || r.status === "delivered");

    rows.push({
      clientId: p.clientId,
      clientName: p.clientName,
      weekId: week.id,
      weekStart,
      weekEnd,
      weekLabel: formatLoyaltyWeekLabel(weekStart, weekEnd),
      byDay: progress.byDay,
      totalUnits: progress.historicalUnits,
      unitsTowardGoal: progress.unitsTowardGoal,
      unitsRequired: program.totalUnitsRequired,
      progressPercent: progress.progressPercent,
      remaining: progress.remaining,
      status: progress.status,
      statusLabel: LOYALTY_STATUS_LABELS[progress.status],
      rewardStatus: open?.status ?? null,
    });
  }

  rows.sort((a, b) => b.unitsTowardGoal - a.unitsTowardGoal || a.clientName.localeCompare(b.clientName));

  const prevBounds = getLoyaltyWeekBounds(
    format(new Date(parseIsoSafe(weekStart).getTime() - 7 * 86400000), "yyyy-MM-dd"),
  );
  const prevWeeks = await queryAll(
    db
      .select()
      .from(loyaltyWeeks)
      .where(and(eq(loyaltyWeeks.programId, program.id), eq(loyaltyWeeks.weekStart, prevBounds.weekStart))),
  );
  let previousWeekIncomplete = 0;
  for (const w of prevWeeks) {
    const prog = await progressForWeekRow(w, program.totalUnitsRequired);
    if (prog.totalUnits > 0 && !prog.goalReached) previousWeekIncomplete += 1;
  }

  const completedThisWeek = rows.filter((r) => r.unitsTowardGoal >= r.unitsRequired).length;
  const activeProgress = rows.filter((r) => r.totalUnits > 0 && r.unitsTowardGoal < r.unitsRequired).length;
  const withUnits = rows.filter((r) => r.totalUnits > 0);
  const avgUnitsPerParticipant =
    withUnits.length > 0
      ? Math.round((withUnits.reduce((s, r) => s + r.totalUnits, 0) / withUnits.length) * 10) / 10
      : null;
  const completionRate =
    withUnits.length > 0
      ? Math.round((completedThisWeek / withUnits.length) * 100)
      : null;

  const weekRewardIds = new Set(rows.map((r) => r.weekId).filter(Boolean));
  const weekRewards = rewardsAll.filter((r) => weekRewardIds.has(r.loyaltyWeekId));

  const productRows = await queryAll(
    db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.businessId, program.businessId)),
  );

  return {
    program: {
      id: program.id,
      name: program.name,
      totalUnitsRequired: program.totalUnitsRequired,
      maxRewardsPerWeek: program.maxRewardsPerWeek,
      rewardQuantity: program.rewardQuantity,
    },
    weekStart,
    weekEnd,
    weekLabel: formatLoyaltyWeekLabel(weekStart, weekEnd),
    metrics: {
      participants: participants.length,
      activeProgress,
      completedThisWeek,
      rewardsAvailable: weekRewards.filter((r) => r.status === "available").length,
      rewardsScheduled: weekRewards.filter((r) => r.status === "scheduled").length,
      rewardsDelivered: weekRewards.filter((r) => r.status === "delivered").length,
      previousWeekIncomplete,
      completionRate,
      avgUnitsPerParticipant,
    },
    rows,
    almostThere: rows
      .filter((r) => r.remaining > 0 && r.remaining <= 2 && r.totalUnits > 0)
      .map((r) => ({
        clientId: r.clientId,
        clientName: r.clientName,
        unitsTowardGoal: r.unitsTowardGoal,
        unitsRequired: r.unitsRequired,
        remaining: r.remaining,
      })),
    products: productRows.map((p) => ({ id: p.id, name: p.name })).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function parseIsoSafe(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export async function getLoyaltyClientDetail(businessSlug: string, clientId: string) {
  const program = await getActiveLoyaltyProgram(businessSlug);
  if (!program) throw new Error("Programa não encontrado.");

  const db = await getPostgresDb();
  const clientRows = await queryAll(db.select().from(clients).where(eq(clients.id, clientId)).limit(1));
  const client = clientRows[0];
  if (!client) throw new Error("Cliente não encontrado.");

  const participantRows = await queryAll(
    db
      .select()
      .from(loyaltyParticipants)
      .where(
        and(eq(loyaltyParticipants.programId, program.id), eq(loyaltyParticipants.clientId, clientId)),
      )
      .limit(1),
  );

  const weeks = await queryAll(
    db
      .select()
      .from(loyaltyWeeks)
      .where(and(eq(loyaltyWeeks.programId, program.id), eq(loyaltyWeeks.clientId, clientId)))
      .orderBy(desc(loyaltyWeeks.weekStart)),
  );

  const history = [];
  for (const week of weeks) {
    const progress = await progressForWeekRow(week, program.totalUnitsRequired);
    const rewards = await queryAll(
      db.select().from(loyaltyRewards).where(eq(loyaltyRewards.loyaltyWeekId, week.id)),
    );
    history.push({
      weekId: week.id,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekLabel: formatLoyaltyWeekLabel(week.weekStart, week.weekEnd),
      progress,
      statusLabel: LOYALTY_STATUS_LABELS[progress.status],
      rewards: rewards.map((r) => ({
        id: r.id,
        status: r.status,
        productId: r.productId,
        scheduledFor: r.scheduledFor,
        deliveredAt: r.deliveredAt?.toISOString() ?? null,
        observation: r.observation,
      })),
    });
  }

  const events = await queryAll(
    db
      .select()
      .from(loyaltyEvents)
      .where(and(eq(loyaltyEvents.programId, program.id), eq(loyaltyEvents.clientId, clientId)))
      .orderBy(desc(loyaltyEvents.createdAt))
      .limit(80),
  );

  const currentBounds = getLoyaltyWeekBounds(todayIso());
  const current =
    history.find((h) => h.weekStart === currentBounds.weekStart) ??
    ({
      weekId: "",
      weekStart: currentBounds.weekStart,
      weekEnd: currentBounds.weekEnd,
      weekLabel: formatLoyaltyWeekLabel(currentBounds.weekStart, currentBounds.weekEnd),
      progress: evaluateWeeklyLoyaltyProgress({
        weekStart: currentBounds.weekStart,
        weekEnd: currentBounds.weekEnd,
        totalUnitsRequired: program.totalUnitsRequired,
        entries: [],
        rewards: [],
        todayIso: todayIso(),
      }),
      statusLabel: LOYALTY_STATUS_LABELS.not_started,
      rewards: [],
    } as (typeof history)[number]);

  return {
    client: { id: client.id, name: client.name },
    participant: participantRows[0]
      ? {
          active: participantRows[0].active,
          joinedAt: participantRows[0].joinedAt.toISOString(),
          notes: participantRows[0].notes,
        }
      : null,
    current,
    history,
    events: events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      quantity: e.quantity,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
      saleId: e.saleId,
    })),
  };
}

export async function listLoyaltyClientsForEnroll(businessSlug: string) {
  const program = await ensureLoyaltyProgram(businessSlug);
  const db = await getPostgresDb();
  const allClients = await queryAll(db.select({ id: clients.id, name: clients.name }).from(clients));
  const enrolled = await queryAll(
    db
      .select()
      .from(loyaltyParticipants)
      .where(and(eq(loyaltyParticipants.programId, program.id), eq(loyaltyParticipants.active, true))),
  );
  const enrolledSet = new Set(enrolled.map((e) => e.clientId));
  return allClients
    .map((c) => ({ id: c.id, name: c.name, enrolled: enrolledSet.has(c.id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
