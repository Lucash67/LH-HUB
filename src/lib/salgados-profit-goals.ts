/**
 * Metas canônicas da operação Salgados (Salty).
 *
 * Lucro: R$60/dia · R$300/semana (5 dias) · R$1.200/mês (20 dias).
 * Quantidade: 22 un/dia · 110/semana · 440/mês
 *   — split: ≥17 Acal+Unifor · ≥5 Henrique · total 22
 * Disciplina de capital: custo de terceiros ≤ R$27/dia
 *   (reduz dependência de dinheiro da família no estoque).
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

/** Volume diário canônico (Acal+Unifor + Henrique). */
export const SALGADOS_DAILY_UNITS_GOAL = 22;
export const SALGADOS_WEEKLY_UNITS_GOAL = 110;
export const SALGADOS_MONTHLY_UNITS_GOAL = 440;

/** Split diário de volume — evita sobrecarregar capital de terceiros. */
export const SALGADOS_DAILY_ACAL_UNIFOR_UNITS_GOAL = 17;
export const SALGADOS_DAILY_HENRIQUE_UNITS_GOAL = 5;

/** Teto diário de investimento de terceiros/família (R$). */
export const SALGADOS_DAILY_THIRD_PARTY_COST_MAX = 27;

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

/** Alvo de unidades no período = 22 × dias em que houve operação. */
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

export function isHenriqueDepartment(department: string | null | undefined): boolean {
  const d = (department ?? "").toLowerCase();
  return d.includes("henrique") || d.includes("colegas");
}

/** Canais do Lucas: Acal + Unifor. */
export function isLucasChannelDepartment(department: string | null | undefined): boolean {
  const d = (department ?? "").toLowerCase();
  return d.includes("acal") || d.includes("unifor");
}

export interface SalgadosMixDisciplineInput {
  acalUniforUnits: number;
  henriqueUnits: number;
  /** Investimento família/terceiros no dia (R$). */
  thirdPartyCost: number;
}

export interface SalgadosMixDisciplineStatus {
  acalUniforUnits: number;
  henriqueUnits: number;
  totalUnits: number;
  thirdPartyCost: number;
  targets: {
    acalUnifor: number;
    henrique: number;
    total: number;
    thirdPartyMax: number;
  };
  hitAcalUnifor: boolean;
  hitHenrique: boolean;
  hitTotal: boolean;
  thirdPartyOk: boolean;
  /** true se volume split + teto de terceiros ok. */
  allOk: boolean;
}

export function evaluateSalgadosMixDiscipline(
  input: SalgadosMixDisciplineInput,
): SalgadosMixDisciplineStatus {
  const acalUniforUnits = Math.max(0, input.acalUniforUnits);
  const henriqueUnits = Math.max(0, input.henriqueUnits);
  const thirdPartyCost = Math.max(0, Math.round(input.thirdPartyCost * 100) / 100);
  const totalUnits = acalUniforUnits + henriqueUnits;

  const hitAcalUnifor = acalUniforUnits >= SALGADOS_DAILY_ACAL_UNIFOR_UNITS_GOAL;
  const hitHenrique = henriqueUnits >= SALGADOS_DAILY_HENRIQUE_UNITS_GOAL;
  const hitTotal = totalUnits >= SALGADOS_DAILY_UNITS_GOAL;
  const thirdPartyOk = thirdPartyCost <= SALGADOS_DAILY_THIRD_PARTY_COST_MAX;

  return {
    acalUniforUnits,
    henriqueUnits,
    totalUnits,
    thirdPartyCost,
    targets: {
      acalUnifor: SALGADOS_DAILY_ACAL_UNIFOR_UNITS_GOAL,
      henrique: SALGADOS_DAILY_HENRIQUE_UNITS_GOAL,
      total: SALGADOS_DAILY_UNITS_GOAL,
      thirdPartyMax: SALGADOS_DAILY_THIRD_PARTY_COST_MAX,
    },
    hitAcalUnifor,
    hitHenrique,
    hitTotal,
    thirdPartyOk,
    allOk: hitAcalUnifor && hitHenrique && hitTotal && thirdPartyOk,
  };
}
