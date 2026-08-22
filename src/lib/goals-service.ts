import { format, subDays } from "date-fns";
import {
  ALL_BUSINESSES_ID,
  BUSINESS_GOALS_BLOCKED_MESSAGE,
  SALGADOS_BUSINESS_ID,
  isAllBusinesses,
} from "@/lib/business-units";
import {
  SALGADOS_DAILY_PROFIT_GOAL,
  SALGADOS_MONTHLY_PROFIT_GOAL,
  SALGADOS_WEEKLY_PROFIT_GOAL,
  usesSalgadosProfitGoals,
} from "@/lib/salgados-profit-goals";
import {
  findGoalByType,
  insertGoal,
  listGoalsByType,
  updateGoalById,
} from "@/platform/db/repositories/goal-repository";

export type GoalType = "daily" | "weekly" | "monthly" | "yearly";

function periodBounds(type: GoalType): { periodStart: string; periodEnd: string } {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();

  switch (type) {
    case "daily":
      return { periodStart: today, periodEnd: today };
    case "weekly": {
      const day = now.getDay();
      const weekStart = format(subDays(now, day === 0 ? 6 : day - 1), "yyyy-MM-dd");
      return { periodStart: weekStart, periodEnd: today };
    }
    case "monthly":
      return {
        periodStart: format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd"),
        periodEnd: today,
      };
    case "yearly":
      return {
        periodStart: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"),
        periodEnd: today,
      };
  }
}

export async function initializeGoalsIfEmpty(businessId: string): Promise<void> {
  if (isAllBusinesses(businessId)) {
    throw new Error(BUSINESS_GOALS_BLOCKED_MESSAGE);
  }

  const existing = await findGoalByType(businessId, "daily");
  if (existing) return;

  const isSalgados = usesSalgadosProfitGoals(businessId);
  const defaultAmount = (type: GoalType): number => {
    if (!isSalgados) return 0;
    switch (type) {
      case "daily":
        return SALGADOS_DAILY_PROFIT_GOAL;
      case "weekly":
        return SALGADOS_WEEKLY_PROFIT_GOAL;
      case "monthly":
        return SALGADOS_MONTHLY_PROFIT_GOAL;
      case "yearly":
        return SALGADOS_MONTHLY_PROFIT_GOAL * 12;
    }
  };

  const types: GoalType[] = ["daily", "weekly", "monthly", "yearly"];
  for (const type of types) {
    const { periodStart, periodEnd } = periodBounds(type);
    await insertGoal({
      businessId,
      type,
      targetAmount: defaultAmount(type),
      targetUnits: null,
      periodStart,
      periodEnd,
    });
  }
}

/** Garante metas de lucro canônicas da Salgados (R$50 / R$250 / R$1.000). */
export async function ensureSalgadosProfitGoals(): Promise<void> {
  const businessId = SALGADOS_BUSINESS_ID;
  await initializeGoalsIfEmpty(businessId);

  const targets: Record<GoalType, number> = {
    daily: SALGADOS_DAILY_PROFIT_GOAL,
    weekly: SALGADOS_WEEKLY_PROFIT_GOAL,
    monthly: SALGADOS_MONTHLY_PROFIT_GOAL,
    yearly: SALGADOS_MONTHLY_PROFIT_GOAL * 12,
  };

  for (const type of Object.keys(targets) as GoalType[]) {
    const amount = targets[type];
    const existing = await findGoalByType(businessId, type);
    const bounds = periodBounds(type);
    if (!existing) {
      await insertGoal({
        businessId,
        type,
        targetAmount: amount,
        targetUnits: null,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
      });
      continue;
    }
    if (existing.targetAmount !== amount) {
      await updateGoalById(existing.id, {
        targetAmount: amount,
        targetUnits: existing.targetUnits ?? null,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
      });
    }
  }
}

export interface GoalTargetInput {
  amount: number;
  units?: number | null;
  /** Período explícito — usado quando a meta é de um período futuro (ex.: mês seguinte). */
  periodStart?: string;
  periodEnd?: string;
}

function normalizeTarget(value: number | GoalTargetInput): GoalTargetInput {
  return typeof value === "number" ? { amount: value } : value;
}

export async function updateGoalTargets(
  targets: Partial<Record<GoalType, number | GoalTargetInput>>,
  businessId: string,
): Promise<void> {
  if (isAllBusinesses(businessId)) {
    throw new Error(BUSINESS_GOALS_BLOCKED_MESSAGE);
  }

  await initializeGoalsIfEmpty(businessId);

  for (const [type, raw] of Object.entries(targets) as [
    GoalType,
    number | GoalTargetInput,
  ][]) {
    if (raw === undefined || raw === null) continue;
    const target = normalizeTarget(raw);
    if (Number.isNaN(target.amount)) continue;

    const bounds = periodBounds(type);
    const periodStart = target.periodStart ?? bounds.periodStart;
    const periodEnd = target.periodEnd ?? bounds.periodEnd;
    const existing = await findGoalByType(businessId, type);
    const targetUnits =
      target.units === undefined ? (existing?.targetUnits ?? null) : target.units;

    if (existing) {
      await updateGoalById(existing.id, {
        targetAmount: target.amount,
        targetUnits,
        periodStart,
        periodEnd,
      });
    } else {
      await insertGoal({
        businessId,
        type,
        targetAmount: target.amount,
        targetUnits,
        periodStart,
        periodEnd,
      });
    }
  }
}

/** Zera amount/units para a meta voltar a usar a sugestão inteligente. */
export async function clearGoalsToSmart(
  businessId: string,
  types: GoalType[] = ["daily", "weekly", "monthly"],
): Promise<void> {
  if (isAllBusinesses(businessId)) {
    throw new Error(BUSINESS_GOALS_BLOCKED_MESSAGE);
  }
  await initializeGoalsIfEmpty(businessId);
  for (const type of types) {
    const existing = await findGoalByType(businessId, type);
    if (!existing) continue;
    const bounds = periodBounds(type);
    await updateGoalById(existing.id, {
      targetAmount: 0,
      targetUnits: null,
      periodStart: bounds.periodStart,
      periodEnd: bounds.periodEnd,
    });
  }
}

export async function getDailyGoalTarget(businessId: string = ALL_BUSINESSES_ID): Promise<number> {
  if (usesSalgadosProfitGoals(businessId)) {
    return SALGADOS_DAILY_PROFIT_GOAL;
  }
  const dailyGoals = await listGoalsByType("daily");
  if (isAllBusinesses(businessId)) {
    return dailyGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }
  return dailyGoals.find((g) => g.businessId === businessId)?.targetAmount ?? 0;
}

export async function getDailyGoalUnitsTarget(
  businessId: string = ALL_BUSINESSES_ID,
): Promise<number> {
  const dailyGoals = await listGoalsByType("daily");
  if (isAllBusinesses(businessId)) {
    return dailyGoals.reduce((sum, g) => sum + (g.targetUnits ?? 0), 0);
  }
  return dailyGoals.find((g) => g.businessId === businessId)?.targetUnits ?? 0;
}
