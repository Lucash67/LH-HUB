/**
 * Metas canônicas da operação Salgados (Salty).
 *
 * Lucro: R$60/dia · R$300/semana (5 dias) · R$1.200/mês (20 dias).
 * Quantidade: 12 un/dia · 60/semana · 240/mês — independente do lucro
 * (investimento de terceiros desacopla volume de resultado).
 *
 * Dia sem operação não entra no alvo do período.
 * Progresso pode ultrapassar 100%.
 */
import {
  ALL_BUSINESSES_ID,
  SALGADOS_BUSINESS_ID,
  isAllBusinesses,
} from "@/lib/business-units";

export const SALGADOS_DAILY_PROFIT_GOAL = 60;
export const SALGADOS_WEEKLY_PROFIT_GOAL = 300;
export const SALGADOS_MONTHLY_PROFIT_GOAL = 1200;

export const SALGADOS_DAILY_UNITS_GOAL = 12;
export const SALGADOS_WEEKLY_UNITS_GOAL = 60;
export const SALGADOS_MONTHLY_UNITS_GOAL = 240;

export const SALGADOS_GOAL_DAYS_PER_WEEK = 5;
export const SALGADOS_GOAL_DAYS_PER_MONTH = 20;

export function usesSalgadosProfitGoals(businessId: string | undefined | null): boolean {
  if (!businessId) return true;
  return (
    businessId === SALGADOS_BUSINESS_ID ||
    businessId === "salgados" ||
    businessId === ALL_BUSINESSES_ID ||
    isAllBusinesses(businessId)
  );
}

/** Alvo de lucro no período = R$60 × dias em que houve operação. */
export function salgadosPeriodProfitTarget(operatedDays: number): number {
  return SALGADOS_DAILY_PROFIT_GOAL * Math.max(0, operatedDays);
}

/** Alvo de unidades no período = 12 × dias em que houve operação. */
export function salgadosPeriodUnitsTarget(operatedDays: number): number {
  return SALGADOS_DAILY_UNITS_GOAL * Math.max(0, operatedDays);
}

export function salgadosGoalTargetForType(
  type: "daily" | "weekly" | "monthly" | "yearly",
  operatedDaysInPeriod?: number,
): number {
  if (type === "daily") return SALGADOS_DAILY_PROFIT_GOAL;
  if (operatedDaysInPeriod != null && operatedDaysInPeriod >= 0) {
    return salgadosPeriodProfitTarget(operatedDaysInPeriod);
  }
  switch (type) {
    case "weekly":
      return SALGADOS_WEEKLY_PROFIT_GOAL;
    case "monthly":
      return SALGADOS_MONTHLY_PROFIT_GOAL;
    case "yearly":
      return SALGADOS_MONTHLY_PROFIT_GOAL * 12;
    default:
      return SALGADOS_DAILY_PROFIT_GOAL;
  }
}

export function salgadosUnitsGoalTargetForType(
  type: "daily" | "weekly" | "monthly" | "yearly",
  operatedDaysInPeriod?: number,
): number {
  if (type === "daily") return SALGADOS_DAILY_UNITS_GOAL;
  if (operatedDaysInPeriod != null && operatedDaysInPeriod >= 0) {
    return salgadosPeriodUnitsTarget(operatedDaysInPeriod);
  }
  switch (type) {
    case "weekly":
      return SALGADOS_WEEKLY_UNITS_GOAL;
    case "monthly":
      return SALGADOS_MONTHLY_UNITS_GOAL;
    case "yearly":
      return SALGADOS_MONTHLY_UNITS_GOAL * 12;
    default:
      return SALGADOS_DAILY_UNITS_GOAL;
  }
}

/** Insight curto quando lucro e volume divergem. */
export function describeProfitUnitsDivergence(
  profitProgress: number,
  unitsProgress: number,
): string | null {
  if (!Number.isFinite(profitProgress) || !Number.isFinite(unitsProgress)) return null;
  const delta = profitProgress - unitsProgress;
  if (Math.abs(delta) < 15) return null;
  if (delta > 0) {
    return "Lucro acima do volume — boa eficiência (menos unidades, mais resultado).";
  }
  return "Volume acima do lucro — vendeu mais, mas o resultado ficou atrás (custo/terceiros).";
}
