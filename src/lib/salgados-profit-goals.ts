/**
 * Metas canônicas de lucro da operação Salgados (Salty).
 * Floor diário R$50 → semana cheia (5 dias) R$250 → mês cheia (20 dias) R$1.000.
 * Dia sem operação não entra no alvo do período (exceção de falta).
 */
import {
  ALL_BUSINESSES_ID,
  SALGADOS_BUSINESS_ID,
  isAllBusinesses,
} from "@/lib/business-units";

export const SALGADOS_DAILY_PROFIT_GOAL = 50;
export const SALGADOS_WEEKLY_PROFIT_GOAL = 250;
export const SALGADOS_MONTHLY_PROFIT_GOAL = 1000;
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

/** Alvo de lucro no período = R$50 × dias em que houve operação. */
export function salgadosPeriodProfitTarget(operatedDays: number): number {
  return SALGADOS_DAILY_PROFIT_GOAL * Math.max(0, operatedDays);
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
