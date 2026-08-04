/**
 * Resumo da semana em foco para o mini painel da dashboard.
 *
 * Usa as métricas diário-primeiro (mesma base do dia), então os números batem
 * com o card do dia e com os outros módulos.
 */
import { addDays, format, parseISO, subDays } from "date-fns";
import { getWeekRange } from "@/lib/utils";
import { canonicalSalgadosFlavor, isSaleExcludedFromMix } from "@/lib/salgados-flavors";
import type { OperationalDayMetricsLike } from "@/lib/dashboard-view";

const WEEKDAY_LABEL = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;

export interface WeekPulseDay {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  units: number;
  /** Dia que está selecionado no filtro temporal. */
  isFocus: boolean;
}

export interface WeekPulse {
  start: string;
  end: string;
  /** "27/07 – 02/08" */
  rangeLabel: string;
  revenue: number;
  profit: number;
  units: number;
  margin: number;
  operationalDays: number;
  goalRevenue: number;
  goalProgress: number;
  /** Variação contra a semana anterior. null quando não há base de comparação. */
  profitTrend: number | null;
  revenueTrend: number | null;
  /** Mix da semana por sabor, do maior para o menor. */
  products: Array<{ label: string; units: number }>;
  days: WeekPulseDay[];
  /** A semana do foco estava vazia e caímos na última semana com operação. */
  isFallback: boolean;
}

function sumProfit(days: OperationalDayMetricsLike[]): number {
  return days.reduce((total, day) => total + day.profit, 0);
}

function inRange(
  days: OperationalDayMetricsLike[],
  start: string,
  end: string,
): OperationalDayMetricsLike[] {
  return days.filter((day) => day.date >= start && day.date <= end);
}

/** Venda no formato mínimo necessário para o mix da semana. */
export interface WeekPulseSale {
  date: string;
  paymentStatus?: string | null;
  notes?: string | null;
  items?: Array<{ quantity: number; product?: { name: string } | null }>;
}

export interface WeekPulseOptions {
  goalRevenue?: number;
  /** Na visão geral, cai para a última semana operada quando a atual está vazia. */
  allowFallback?: boolean;
  /** Vendas do negócio — usadas só para o mix por sabor. */
  sales?: WeekPulseSale[];
}

function buildProductMix(
  sales: WeekPulseSale[],
  start: string,
  end: string,
): Array<{ label: string; units: number }> {
  const units = new Map<string, number>();
  for (const sale of sales) {
    if (sale.date < start || sale.date > end) continue;
    if (isSaleExcludedFromMix(sale)) continue;
    for (const item of sale.items ?? []) {
      const flavor = canonicalSalgadosFlavor(item.product?.name ?? "");
      if (!flavor) continue;
      units.set(flavor, (units.get(flavor) ?? 0) + item.quantity);
    }
  }
  return Array.from(units.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, units: value }));
}

export function buildWeekPulse(
  dayMetrics: OperationalDayMetricsLike[],
  focusDate: string,
  { goalRevenue = 0, allowFallback = false, sales = [] }: WeekPulseOptions = {},
): WeekPulse | null {
  let range = getWeekRange(parseISO(focusDate));
  let weekDays = inRange(dayMetrics, range.start, range.end);
  let isFallback = false;

  if (weekDays.length === 0 && allowFallback) {
    const previous =
      dayMetrics.filter((day) => day.date <= focusDate).at(-1) ?? dayMetrics.at(-1);
    if (previous) {
      range = getWeekRange(parseISO(previous.date));
      weekDays = inRange(dayMetrics, range.start, range.end);
      isFallback = true;
    }
  }

  if (weekDays.length === 0) return null;

  const revenue = weekDays.reduce((total, day) => total + day.revenue, 0);
  const profit = sumProfit(weekDays);
  const units = weekDays.reduce((total, day) => total + (day.units ?? 0), 0);
  const operationalDays = weekDays.filter(
    (day) => day.revenue > 0 || (day.units ?? 0) > 0,
  ).length;

  const byDate = new Map(weekDays.map((day) => [day.date, day]));
  const days: WeekPulseDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = format(addDays(parseISO(range.start), i), "yyyy-MM-dd");
    const weekday = parseISO(date).getDay();
    const metrics = byDate.get(date);
    // Fim de semana só entra na régua quando houve movimento.
    if (!metrics && (weekday === 0 || weekday === 6)) continue;
    days.push({
      date,
      label: WEEKDAY_LABEL[weekday] ?? "",
      revenue: metrics?.revenue ?? 0,
      profit: metrics?.profit ?? 0,
      units: metrics?.units ?? 0,
      isFocus: date === focusDate,
    });
  }

  const previousWeek = inRange(
    dayMetrics,
    format(subDays(parseISO(range.start), 7), "yyyy-MM-dd"),
    format(subDays(parseISO(range.end), 7), "yyyy-MM-dd"),
  );
  const previousProfit = sumProfit(previousWeek);
  const previousRevenue = previousWeek.reduce((total, day) => total + day.revenue, 0);

  return {
    start: range.start,
    end: range.end,
    rangeLabel: `${format(parseISO(range.start), "dd/MM")} – ${format(parseISO(range.end), "dd/MM")}`,
    revenue,
    profit,
    units,
    margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    operationalDays,
    goalRevenue,
    goalProgress: goalRevenue > 0 ? (revenue / goalRevenue) * 100 : 0,
    profitTrend:
      previousProfit > 0 ? ((profit - previousProfit) / previousProfit) * 100 : null,
    revenueTrend:
      previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : null,
    products: buildProductMix(sales, range.start, range.end),
    days,
    isFallback,
  };
}
