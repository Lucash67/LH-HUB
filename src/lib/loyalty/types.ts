import { addDays, format, getDay, parseISO, startOfWeek } from "date-fns";

export type LoyaltyWeekStatus =
  | "not_started"
  | "in_progress"
  | "almost_there"
  | "completed"
  | "reward_available"
  | "reward_scheduled"
  | "reward_delivered"
  | "week_closed_incomplete";

export type LoyaltyRewardStatus =
  | "available"
  | "scheduled"
  | "delivered"
  | "cancelled"
  | "invalidated";

export type LoyaltyEntryType = "purchase" | "reversal" | "adjustment";

export type LoyaltyEventType =
  | "purchase_confirmed"
  | "sale_cancelled"
  | "progress_updated"
  | "goal_completed"
  | "reward_created"
  | "reward_scheduled"
  | "reward_delivered"
  | "reward_cancelled"
  | "reward_invalidated"
  | "manual_adjustment"
  | "reversal"
  | "participant_joined"
  | "participant_left"
  | "week_closed";

export const LOYALTY_STATUS_LABELS: Record<LoyaltyWeekStatus, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  almost_there: "Quase lá",
  completed: "Concluído",
  reward_available: "Recompensa disponível",
  reward_scheduled: "Recompensa agendada",
  reward_delivered: "Recompensa entregue",
  week_closed_incomplete: "Semana encerrada sem conclusão",
};

export const LOYALTY_REWARD_STATUS_LABELS: Record<LoyaltyRewardStatus, string> = {
  available: "Disponível",
  scheduled: "Agendada",
  delivered: "Entregue",
  cancelled: "Cancelada",
  invalidated: "Invalidada",
};

export const LOYALTY_WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;
export type LoyaltyWeekdayKey = (typeof LOYALTY_WEEKDAY_KEYS)[number];

export const LOYALTY_WEEKDAY_LABELS: Record<LoyaltyWeekdayKey, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
};

/** Segunda–sexta da semana ISO local da data (yyyy-MM-dd). */
export function getLoyaltyWeekBounds(dateIso: string): { weekStart: string; weekEnd: string } {
  const d = parseISO(dateIso);
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  return {
    weekStart: format(monday, "yyyy-MM-dd"),
    weekEnd: format(friday, "yyyy-MM-dd"),
  };
}

export function isLoyaltyEligibleWeekday(dateIso: string): boolean {
  const day = getDay(parseISO(dateIso));
  return day >= 1 && day <= 5;
}

export function weekdayKeyFromDate(dateIso: string): LoyaltyWeekdayKey | null {
  const day = getDay(parseISO(dateIso));
  const map: Record<number, LoyaltyWeekdayKey> = {
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
  };
  return map[day] ?? null;
}

export function formatLoyaltyWeekLabel(weekStart: string, weekEnd: string): string {
  const s = parseISO(weekStart);
  const e = parseISO(weekEnd);
  return `${format(s, "dd/MM")}–${format(e, "dd/MM")}`;
}

export interface LoyaltyEntryLike {
  entryDate: string;
  quantity: number;
  entryType: LoyaltyEntryType;
}

export interface LoyaltyRewardLike {
  status: LoyaltyRewardStatus;
}

export interface EvaluateWeeklyLoyaltyInput {
  weekStart: string;
  weekEnd: string;
  totalUnitsRequired: number;
  entries: LoyaltyEntryLike[];
  rewards: LoyaltyRewardLike[];
  /** Data de referência (hoje) para fechar semanas passadas. */
  todayIso: string;
}

export interface DayBreakdown {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
}

export interface WeeklyLoyaltyProgress {
  weekStart: string;
  weekEnd: string;
  byDay: DayBreakdown;
  totalUnits: number;
  /** Unidades históricas (podem ser > required). */
  historicalUnits: number;
  unitsTowardGoal: number;
  unitsRequired: number;
  remaining: number;
  progressPercent: number;
  goalReached: boolean;
  status: LoyaltyWeekStatus;
  hasOpenReward: boolean;
  hasScheduledReward: boolean;
  hasDeliveredReward: boolean;
}

function emptyDays(): DayBreakdown {
  return { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 };
}

/**
 * Função centralizada de progresso semanal.
 * Soma entries (purchase/adjustment positivos e reversals negativos).
 * Meta: totalUnitsRequired; máx. progresso visual = required (MVP 1 reward/semana).
 */
export function evaluateWeeklyLoyaltyProgress(
  input: EvaluateWeeklyLoyaltyInput,
): WeeklyLoyaltyProgress {
  const byDay = emptyDays();
  let historicalUnits = 0;

  for (const entry of input.entries) {
    if (!isLoyaltyEligibleWeekday(entry.entryDate)) continue;
    if (entry.entryDate < input.weekStart || entry.entryDate > input.weekEnd) continue;
    const key = weekdayKeyFromDate(entry.entryDate);
    if (!key) continue;
    byDay[key] += entry.quantity;
    historicalUnits += entry.quantity;
  }

  const totalUnits = Math.max(0, historicalUnits);
  const unitsRequired = input.totalUnitsRequired;
  const unitsTowardGoal = Math.min(totalUnits, unitsRequired);
  const remaining = Math.max(0, unitsRequired - totalUnits);
  const progressPercent =
    unitsRequired <= 0 ? 0 : Math.min(100, Math.round((unitsTowardGoal / unitsRequired) * 100));
  const goalReached = totalUnits >= unitsRequired;

  const activeRewards = input.rewards.filter((r) => r.status !== "cancelled" && r.status !== "invalidated");
  const hasDeliveredReward = activeRewards.some((r) => r.status === "delivered");
  const hasScheduledReward = activeRewards.some((r) => r.status === "scheduled");
  const hasOpenReward = activeRewards.some((r) => r.status === "available");

  const weekEnded = input.todayIso > input.weekEnd;

  let status: LoyaltyWeekStatus;
  if (goalReached) {
    if (hasDeliveredReward) status = "reward_delivered";
    else if (hasScheduledReward) status = "reward_scheduled";
    else if (hasOpenReward) status = "reward_available";
    else status = "completed";
  } else if (weekEnded) {
    status = totalUnits <= 0 ? "not_started" : "week_closed_incomplete";
    // Semana passada sem compras: not_started; com compras incompletas: closed
    if (totalUnits <= 0 && weekEnded) status = "week_closed_incomplete";
  } else if (totalUnits <= 0) {
    status = "not_started";
  } else if (remaining <= 2) {
    status = "almost_there";
  } else {
    status = "in_progress";
  }

  // Ajuste: semana passada zerada marca closed_incomplete só se houve participação intent?
  // Spec: "não concluiu" for incomplete weeks. Empty past weeks as week_closed_incomplete is noisy.
  // Prefer: past + 0 = not_started; past + >0 incomplete = week_closed_incomplete
  if (weekEnded && !goalReached) {
    status = totalUnits > 0 ? "week_closed_incomplete" : "not_started";
  }

  return {
    weekStart: input.weekStart,
    weekEnd: input.weekEnd,
    byDay,
    totalUnits,
    historicalUnits,
    unitsTowardGoal,
    unitsRequired,
    remaining,
    progressPercent,
    goalReached,
    status,
    hasOpenReward,
    hasScheduledReward,
    hasDeliveredReward,
  };
}
