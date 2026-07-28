import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchMetricSales } from "@/platform/db/data-access/metrics";
import { isOperationalDay } from "@/lib/operational-calendar";

export interface ProfitBankDay {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  costs: number;
  saved: number;
  balance: number;
}

export interface ProfitBankView {
  currentBalance: number;
  totalRevenue: number;
  totalProfit: number;
  totalCosts: number;
  operationalDays: number;
  avgDailyProfit: number;
  bestDay: { date: string; profit: number } | null;
  history: ProfitBankDay[];
}

export async function getProfitBankView(businessId: string): Promise<ProfitBankView> {
  const sales = await fetchMetricSales({ businessId });
  const operational = sales
    .filter((s) => isOperationalDay(s.date, businessId))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate = new Map<string, { revenue: number; profit: number; costs: number }>();

  for (const sale of operational) {
    const row = byDate.get(sale.date) ?? { revenue: 0, profit: 0, costs: 0 };
    row.revenue += sale.totalAmount;
    row.profit += sale.profit;
    row.costs += sale.totalCost ?? sale.totalAmount - sale.profit;
    byDate.set(sale.date, row);
  }

  const dates = Array.from(byDate.keys()).sort();
  let balance = 0;
  let bestDay: { date: string; profit: number } | null = null;

  const history: ProfitBankDay[] = dates.map((date) => {
    const row = byDate.get(date)!;
    balance += row.profit;
    if (!bestDay || row.profit > bestDay.profit) {
      bestDay = { date, profit: row.profit };
    }
    return {
      date,
      label: format(parseISO(date), "dd/MM", { locale: ptBR }),
      revenue: row.revenue,
      profit: row.profit,
      costs: row.costs,
      saved: row.profit,
      balance,
    };
  });

  const totalRevenue = history.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = history.reduce((s, d) => s + d.profit, 0);
  const totalCosts = history.reduce((s, d) => s + d.costs, 0);

  return {
    currentBalance: balance,
    totalRevenue,
    totalProfit,
    totalCosts,
    operationalDays: history.length,
    avgDailyProfit: history.length > 0 ? totalProfit / history.length : 0,
    bestDay,
    history,
  };
}
