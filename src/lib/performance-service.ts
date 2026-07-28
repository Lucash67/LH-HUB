import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  format,
  parseISO,
  subMonths,
  subWeeks,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchMetricSales } from "@/platform/db/data-access/metrics";
import {
  computePeriodMetrics,
  sumProfit,
  sumRevenue,
} from "@/lib/analytics-engine/aggregates";
import { calcGrowth, getMonthRange, getWeekRange } from "@/lib/utils";
import { isOperationalDay, WEEKDAY_MON_FRI } from "@/lib/operational-calendar";
import type { ChartDataPoint } from "@/lib/analytics";

export type PerformancePeriod = "weekly" | "monthly";

export interface PerformanceView {
  period: PerformancePeriod;
  periodLabel: string;
  range: { start: string; end: string };
  metrics: {
    revenue: number;
    profit: number;
    costs: number;
    salesCount: number;
    margin: number;
    averageTicket: number;
    itemsSold: number;
  };
  comparison: {
    revenueGrowth: number;
    profitGrowth: number;
    previousRevenue: number;
    previousProfit: number;
    previousLabel: string;
  };
  dailyChart: ChartDataPoint[];
  weekdayChart: ChartDataPoint[];
}

function sumCosts(sales: Array<{ totalCost?: number; profit: number; totalAmount: number }>): number {
  return sales.reduce((s, v) => s + (v.totalCost ?? v.totalAmount - v.profit), 0);
}

function resolveRange(period: PerformancePeriod, offset: number, reference = new Date()) {
  const anchor = period === "weekly" ? addWeeks(reference, offset) : addMonths(reference, offset);
  return period === "weekly" ? getWeekRange(anchor) : getMonthRange(anchor);
}

function previousRange(period: PerformancePeriod, range: { start: string; end: string }) {
  const start = parseISO(range.start);
  if (period === "weekly") {
    const prevStart = subWeeks(start, 1);
    return getWeekRange(prevStart);
  }
  const prevStart = subMonths(start, 1);
  return getMonthRange(prevStart);
}

function formatPeriodLabel(period: PerformancePeriod, range: { start: string; end: string }): string {
  const start = parseISO(range.start);
  const end = parseISO(range.end);
  if (period === "weekly") {
    return `${format(start, "dd MMM", { locale: ptBR })} – ${format(end, "dd MMM yyyy", { locale: ptBR })}`;
  }
  return format(start, "MMMM yyyy", { locale: ptBR });
}

function buildDailyChart(
  sales: Awaited<ReturnType<typeof fetchMetricSales>>,
  range: { start: string; end: string },
  businessId: string,
): ChartDataPoint[] {
  const days = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) });
  const byDate = new Map<string, { revenue: number; profit: number }>();

  for (const sale of sales) {
    if (!isOperationalDay(sale.date, businessId)) continue;
    const current = byDate.get(sale.date) ?? { revenue: 0, profit: 0 };
    current.revenue += sale.totalAmount;
    current.profit += sale.profit;
    byDate.set(sale.date, current);
  }

  return days
    .filter((d) => isOperationalDay(format(d, "yyyy-MM-dd"), businessId))
    .map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const row = byDate.get(key) ?? { revenue: 0, profit: 0 };
      return {
        label: format(d, "dd/MM"),
        value: row.revenue,
        revenue: row.revenue,
        profit: row.profit,
      };
    });
}

function buildWeekdayChart(
  sales: Awaited<ReturnType<typeof fetchMetricSales>>,
  businessId: string,
): ChartDataPoint[] {
  const byDow = new Map<number, { revenue: number; profit: number }>();

  for (const sale of sales) {
    if (!isOperationalDay(sale.date, businessId)) continue;
    const dow = getDay(parseISO(sale.date));
    const current = byDow.get(dow) ?? { revenue: 0, profit: 0 };
    current.revenue += sale.totalAmount;
    current.profit += sale.profit;
    byDow.set(dow, current);
  }

  return WEEKDAY_MON_FRI.map(({ index, label }) => {
    const row = byDow.get(index) ?? { revenue: 0, profit: 0 };
    return {
      label,
      value: row.revenue,
      revenue: row.revenue,
      profit: row.profit,
    };
  });
}

export async function getPerformanceView(
  businessId: string,
  period: PerformancePeriod = "weekly",
  offset = 0,
): Promise<PerformanceView> {
  const range = resolveRange(period, offset);
  const prev = previousRange(period, range);

  const [sales, prevSales] = await Promise.all([
    fetchMetricSales({ businessId, dateGte: range.start, dateLte: range.end }),
    fetchMetricSales({ businessId, dateGte: prev.start, dateLte: prev.end }),
  ]);

  const operationalSales = sales.filter((s) => isOperationalDay(s.date, businessId));
  const metricsRaw = computePeriodMetrics(operationalSales);
  const revenue = sumRevenue(operationalSales);
  const profit = sumProfit(operationalSales);
  const costs = sumCosts(operationalSales);

  const prevOperational = prevSales.filter((s) => isOperationalDay(s.date, businessId));
  const previousRevenue = sumRevenue(prevOperational);
  const previousProfit = sumProfit(prevOperational);

  return {
    period,
    periodLabel: formatPeriodLabel(period, range),
    range,
    metrics: {
      revenue,
      profit,
      costs,
      salesCount: metricsRaw.salesCount,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      averageTicket: metricsRaw.averageTicket,
      itemsSold: metricsRaw.itemsSold,
    },
    comparison: {
      revenueGrowth: calcGrowth(revenue, previousRevenue),
      profitGrowth: calcGrowth(profit, previousProfit),
      previousRevenue,
      previousProfit,
      previousLabel: formatPeriodLabel(period, prev),
    },
    dailyChart: buildDailyChart(sales, range, businessId),
    weekdayChart: buildWeekdayChart(sales, businessId),
  };
}
