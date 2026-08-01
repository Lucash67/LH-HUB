import { addMonths, addWeeks, eachDayOfInterval, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchMetricSaleItems, fetchMetricSales, fetchMetricGoals } from "@/platform/db/data-access/metrics";
import { buildOperationalDayMetrics } from "@/lib/operational-day-metrics";
import {
  countOperationalDaysInRange,
  isOperationalDay,
} from "@/lib/operational-calendar";
import { getMonthRange, getWeekRange } from "@/lib/utils";
import { ALL_BUSINESSES_ID, isAllBusinesses } from "@/lib/business-units";

export type PeriodProjectionPeriod = "weekly" | "monthly";

export interface PeriodProjectionMetric {
  revenue: number;
  profit: number;
  units: number;
}

export interface PeriodProjectionView {
  period: PeriodProjectionPeriod;
  periodLabel: string;
  range: { start: string; end: string };
  referenceDate: string;
  isCurrentPeriod: boolean;
  businessId: string;
  operationalDays: {
    total: number;
    elapsed: number;
    remaining: number;
  };
  actual: PeriodProjectionMetric & { margin: number };
  projected: PeriodProjectionMetric;
  goal: {
    revenue: number;
    units: number | null;
    source: "goals" | "none";
  };
  pace: PeriodProjectionMetric;
  gap: {
    revenueToProjection: number;
    profitToProjection: number;
    unitsToProjection: number;
    revenueToGoal: number;
    unitsToGoal: number;
    requiredDailyRevenueToProjection: number;
    requiredDailyUnitsToProjection: number;
    requiredDailyRevenueToGoal: number;
    requiredDailyUnitsToGoal: number;
  };
  comparison: Array<{
    label: string;
    actual: number;
    projected: number;
    goal: number;
  }>;
  dailyChart: Array<{
    label: string;
    value: number;
    revenue: number;
    profit: number;
    units: number;
  }>;
  insight: string;
}

function resolveRange(period: PeriodProjectionPeriod, offset: number, reference = new Date()) {
  const anchor = period === "weekly" ? addWeeks(reference, offset) : addMonths(reference, offset);
  return period === "weekly" ? getWeekRange(anchor) : getMonthRange(anchor);
}

function formatPeriodLabel(period: PeriodProjectionPeriod, range: { start: string; end: string }): string {
  const start = parseISO(range.start);
  const end = parseISO(range.end);
  if (period === "weekly") {
    return `${format(start, "dd MMM", { locale: ptBR })} – ${format(end, "dd MMM yyyy", { locale: ptBR })}`;
  }
  return format(start, "MMMM yyyy", { locale: ptBR });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calendarBusinessId(businessId: string): string {
  return isAllBusinesses(businessId) ? "salgados" : businessId;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function buildInsight(view: Omit<PeriodProjectionView, "insight">): string {
  const { actual, goal, gap, operationalDays, isCurrentPeriod } = view;

  if (operationalDays.elapsed === 0) {
    return "Ainda não há dias operacionais neste período — a projeção começa quando houver o primeiro registro.";
  }

  if (!isCurrentPeriod) {
    const hitGoal = goal.revenue > 0 && actual.revenue >= goal.revenue;
    if (hitGoal) {
      return `Período encerrado: meta de receita atingida (${round2((actual.revenue / goal.revenue) * 100)}%).`;
    }
    return `Período encerrado com ${formatMoney(actual.revenue)} de receita e ${actual.units} unidades.`;
  }

  if (gap.revenueToProjection <= 0 && gap.unitsToProjection <= 0) {
    return "No ritmo atual você já cobre a projeção do período. Mantenha o padrão.";
  }

  if (operationalDays.remaining === 0) {
    return "Último dia operacional do período — o resultado de hoje fecha a projeção.";
  }

  const parts = [
    `Faltam ${operationalDays.remaining} dia${operationalDays.remaining > 1 ? "s" : ""} útil${operationalDays.remaining > 1 ? "eis" : ""}.`,
  ];
  if (gap.unitsToProjection > 0) {
    parts.push(
      `Para bater a projeção: ~${Math.ceil(gap.requiredDailyUnitsToProjection)} un./dia e ${formatMoney(gap.requiredDailyRevenueToProjection)}/dia.`,
    );
  }
  if (goal.revenue > 0 && gap.revenueToGoal > 0) {
    parts.push(`Para a meta: ${formatMoney(gap.requiredDailyRevenueToGoal)}/dia.`);
  }
  return parts.join(" ");
}

export async function getPeriodProjectionView(
  businessId: string = ALL_BUSINESSES_ID,
  period: PeriodProjectionPeriod = "weekly",
  offset = 0,
  referenceDate = format(new Date(), "yyyy-MM-dd"),
): Promise<PeriodProjectionView> {
  const calId = calendarBusinessId(businessId);
  const today = referenceDate;
  const range = resolveRange(period, offset, parseISO(today));
  const effectiveEnd = range.end < today ? range.end : today;
  const isCurrentPeriod = offset === 0 && range.start <= today && today <= range.end;

  const [dayMetrics, sales, goals] = await Promise.all([
    buildOperationalDayMetrics(businessId),
    fetchMetricSales({ businessId, dateGte: range.start, dateLte: range.end }),
    fetchMetricGoals(businessId),
  ]);

  const saleIds = sales.map((s) => s.id).filter((id): id is string => Boolean(id));
  const items = saleIds.length > 0 ? await fetchMetricSaleItems(saleIds) : [];
  const unitsBySale = new Map<string, number>();
  for (const item of items) {
    if (!item.saleId) continue;
    unitsBySale.set(item.saleId, (unitsBySale.get(item.saleId) ?? 0) + item.quantity);
  }

  const unitsByDate = new Map<string, number>();
  for (const sale of sales) {
    if (!isOperationalDay(sale.date, calId)) continue;
    const saleUnits = sale.id ? (unitsBySale.get(sale.id) ?? 0) : 0;
    unitsByDate.set(sale.date, (unitsByDate.get(sale.date) ?? 0) + saleUnits);
  }

  // Diário homologado prevalece nas unidades quando disponível.
  for (const [date, metrics] of Array.from(dayMetrics.entries())) {
    if (metrics.source === "diary" && typeof metrics.units === "number" && metrics.units > 0) {
      unitsByDate.set(date, metrics.units);
    }
  }

  let actualRevenue = 0;
  let actualProfit = 0;
  let actualUnits = 0;

  const elapsedDays = eachDayOfInterval({
    start: parseISO(range.start),
    end: parseISO(effectiveEnd),
  });

  for (const day of elapsedDays) {
    const key = format(day, "yyyy-MM-dd");
    if (!isOperationalDay(key, calId)) continue;
    const metrics = dayMetrics.get(key);
    if (metrics) {
      actualRevenue += metrics.revenue;
      actualProfit += metrics.profit;
    }
    actualUnits += unitsByDate.get(key) ?? 0;
  }

  const totalOpDays = countOperationalDaysInRange(range.start, range.end, calId);
  const elapsedOpDays = countOperationalDaysInRange(range.start, effectiveEnd, calId);
  const remainingOpDays = isCurrentPeriod
    ? countOperationalDaysInRange(today, range.end, calId)
    : 0;

  const paceRevenue = elapsedOpDays > 0 ? actualRevenue / elapsedOpDays : 0;
  const paceProfit = elapsedOpDays > 0 ? actualProfit / elapsedOpDays : 0;
  const paceUnits = elapsedOpDays > 0 ? actualUnits / elapsedOpDays : 0;

  const projectedRevenue = round2(paceRevenue * totalOpDays);
  const projectedProfit = round2(paceProfit * totalOpDays);
  const projectedUnits = Math.round(paceUnits * totalOpDays);

  const goalType = period === "weekly" ? "weekly" : "monthly";
  const goalRow = goals.find((g) => g.type === goalType);
  const goalRevenue = goalRow?.targetAmount ?? 0;
  const goalUnits = goalRow?.targetUnits ?? null;

  const revenueToProjection = Math.max(0, round2(projectedRevenue - actualRevenue));
  const profitToProjection = Math.max(0, round2(projectedProfit - actualProfit));
  const unitsToProjection = Math.max(0, projectedUnits - actualUnits);
  const revenueToGoal = Math.max(0, round2(goalRevenue - actualRevenue));
  const unitsToGoal = goalUnits != null ? Math.max(0, goalUnits - actualUnits) : 0;

  const div = (n: number) => (remainingOpDays > 0 ? n / remainingOpDays : n);

  const dailyChart = eachDayOfInterval({
    start: parseISO(range.start),
    end: parseISO(range.end),
  })
    .filter((d) => isOperationalDay(format(d, "yyyy-MM-dd"), calId))
    .map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const metrics = dayMetrics.get(key);
      const units = unitsByDate.get(key) ?? 0;
      const revenue = metrics?.revenue ?? 0;
      const profit = metrics?.profit ?? 0;
      return {
        label: format(d, "dd/MM"),
        value: revenue,
        revenue,
        profit,
        units,
      };
    });

  const base = {
    period,
    periodLabel: formatPeriodLabel(period, range),
    range,
    referenceDate: today,
    isCurrentPeriod,
    businessId,
    operationalDays: {
      total: totalOpDays,
      elapsed: elapsedOpDays,
      remaining: remainingOpDays,
    },
    actual: {
      revenue: round2(actualRevenue),
      profit: round2(actualProfit),
      units: actualUnits,
      margin: actualRevenue > 0 ? round2((actualProfit / actualRevenue) * 100) : 0,
    },
    projected: {
      revenue: projectedRevenue,
      profit: projectedProfit,
      units: projectedUnits,
    },
    goal: {
      revenue: goalRevenue,
      units: goalUnits,
      source: goalRevenue > 0 || goalUnits != null ? ("goals" as const) : ("none" as const),
    },
    pace: {
      revenue: round2(paceRevenue),
      profit: round2(paceProfit),
      units: round2(paceUnits),
    },
    gap: {
      revenueToProjection,
      profitToProjection,
      unitsToProjection,
      revenueToGoal,
      unitsToGoal,
      requiredDailyRevenueToProjection: round2(div(revenueToProjection)),
      requiredDailyUnitsToProjection: round2(div(unitsToProjection)),
      requiredDailyRevenueToGoal: round2(div(revenueToGoal)),
      requiredDailyUnitsToGoal: round2(div(unitsToGoal)),
    },
    comparison: [
      {
        label: "Receita",
        actual: round2(actualRevenue),
        projected: projectedRevenue,
        goal: goalRevenue,
      },
      {
        label: "Lucro",
        actual: round2(actualProfit),
        projected: projectedProfit,
        goal: 0,
      },
      {
        label: "Unidades",
        actual: actualUnits,
        projected: projectedUnits,
        goal: goalUnits ?? 0,
      },
    ],
    dailyChart,
  };

  return {
    ...base,
    insight: buildInsight(base),
  };
}

export { resolveRange as resolvePeriodProjectionRange };
