import { format, subDays, parseISO, getDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { calcGrowth, getWeekRange, getMonthRange, goalProgress } from "./utils";
import { getDailyGoalTarget } from "./goals-service";
import { ALL_BUSINESSES_ID, isAllBusinesses } from "./business-units";
import {
  computeDashboardMetrics,
  computeDayReport,
  computeRankings,
  computeProjections,
  computeCalendarDayStatus,
} from "./analytics-engine";
import { fetchMetricSales, fetchMetricGoals } from "@/platform/db/data-access/metrics";
import { getDualFinancialView, getDayDualFinancialView } from "./finance";
import type { DualFinancialView } from "./finance";
import { isPostgres, getPostgresDb, getSqliteDb } from "@/platform/db";
import { queryAll } from "@/platform/db/query";
import {
  cashFlow as sqliteCashFlow,
  investments as sqliteInvestments,
} from "./db/schema";
import { cashFlowEvents as pgCashFlow } from "@/lib/db/postgres/schema";
import { fetchActiveProducts, fetchScopedSales } from "./analytics-engine/queries";
import { buildClientSaleBusinessMap, filterClientsForBusiness } from "./client-business-scope";
import { fetchMetricClients } from "@/platform/db/data-access/metrics";
import { getClientById } from "@/platform/db/repositories/client-repository";
import { fetchMetricSaleItems } from "@/platform/db/data-access/metrics";
import { listProducts } from "@/platform/db/repositories/product-repository";

export type { DashboardMetricsResult as DashboardMetrics } from "./analytics-engine";

export interface ChartDataPoint {
  label: string;
  value: number;
  profit?: number;
  revenue?: number;
}

export async function getDashboardMetrics(businessId: string = ALL_BUSINESSES_ID) {
  return computeDashboardMetrics(businessId);
}

export async function getRevenueChart(
  days = 14,
  businessId: string = ALL_BUSINESSES_ID,
): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const daySales = await fetchMetricSales({ businessId, dateEq: date });
    const revenue = daySales.reduce((s, v) => s + v.totalAmount, 0);
    const profit = daySales.reduce((s, v) => s + v.profit, 0);
    result.push({
      label: format(parseISO(date), "dd/MM"),
      value: revenue,
      revenue,
      profit,
    });
  }

  return result;
}

export async function getPaymentMethodChart(): Promise<ChartDataPoint[]> {
  const monthStart = getMonthRange().start;
  const monthSales = await fetchMetricSales({ dateGte: monthStart });

  const pix = monthSales.filter((s) => s.paymentMethod === "pix").reduce((s, v) => s + v.totalAmount, 0);
  const card = monthSales.filter((s) => s.paymentMethod === "card").reduce((s, v) => s + v.totalAmount, 0);
  const cash = monthSales.filter((s) => s.paymentMethod === "cash").reduce((s, v) => s + v.totalAmount, 0);

  return [
    { label: "PIX", value: pix },
    { label: "Cartão", value: card },
    { label: "Dinheiro", value: cash },
  ];
}

export async function getFlavorChart(): Promise<ChartDataPoint[]> {
  const monthStart = getMonthRange().start;
  const monthSales = await fetchMetricSales({ dateGte: monthStart });
  const saleIds = monthSales.map((s) => s.id).filter(Boolean) as string[];
  const allItems = await fetchMetricSaleItems(saleIds);
  const allProducts = await listProducts(ALL_BUSINESSES_ID);
  const productMap = new Map(allProducts.map((p) => [p.id, p.name]));

  const flavorCounts: Record<string, number> = {};
  for (const item of allItems) {
    const name = productMap.get(item.productId) ?? "Desconhecido";
    flavorCounts[name] = (flavorCounts[name] ?? 0) + item.quantity;
  }

  return Object.entries(flavorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

export async function getSalesChart(): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = [];

  for (let i = 13; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const daySales = await fetchMetricSales({ dateEq: date });
    const saleIds = daySales.map((s) => s.id).filter(Boolean) as string[];
    const items = await fetchMetricSaleItems(saleIds);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    result.push({ label: format(parseISO(date), "dd/MM"), value: count });
  }

  return result;
}

export async function getGrowthChart(): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = [];

  for (let i = 13; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const prevDate = format(subDays(new Date(), i + 1), "yyyy-MM-dd");
    const daySales = await fetchMetricSales({ dateEq: date });
    const prevSales = await fetchMetricSales({ dateEq: prevDate });
    const revenue = daySales.reduce((s, v) => s + v.totalAmount, 0);
    const prevRevenue = prevSales.reduce((s, v) => s + v.totalAmount, 0);
    result.push({
      label: format(parseISO(date), "dd/MM"),
      value: calcGrowth(revenue, prevRevenue),
    });
  }

  return result;
}

export async function getFinancialSummary(businessId: string = ALL_BUSINESSES_ID) {
  const { start: monthStart, end: monthEnd } = getMonthRange();
  const monthSales = await fetchMetricSales({ businessId, dateGte: monthStart });

  const grossRevenue = monthSales.reduce((s, v) => s + v.totalAmount, 0);
  const totalCost = monthSales.reduce((s, v) => s + (v.totalCost ?? 0), 0);
  const operationalProfit = monthSales.reduce((s, v) => s + v.profit, 0);

  let totalExpenses = 0;
  let incomeEntries: Array<{ category: string; amount: number }> = [];
  let expenseEntries: Array<{ amount: number }> = [];
  let scopedInvestments: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    sourceType: string | null;
    sourceName: string | null;
    createdAt?: string;
  }> = [];

  if (isPostgres()) {
    const db = await getPostgresDb();
    const cashRows = await queryAll(db.select().from(pgCashFlow));
    expenseEntries = cashRows
      .filter((e) => e.eventType === "expense")
      .map((e) => ({ amount: Number(e.amount) }));
    incomeEntries = cashRows
      .filter((e) => e.eventType === "income")
      .map((e) => ({ category: e.category, amount: Number(e.amount) }));
    totalExpenses = expenseEntries.reduce((s, e) => s + e.amount, 0);
  } else {
    const db = getSqliteDb();
    const expenses = (await queryAll(
      db.select().from(sqliteCashFlow).where(eq(sqliteCashFlow.type, "expense")),
    )) as Array<{ amount: number }>;
    totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    incomeEntries = (await queryAll(
      db.select().from(sqliteCashFlow).where(eq(sqliteCashFlow.type, "income")),
    )) as Array<{ category: string; amount: number }>;
    expenseEntries = expenses;
    const allInvestments = await queryAll(db.select().from(sqliteInvestments));
    scopedInvestments = (
      isAllBusinesses(businessId)
        ? allInvestments
        : allInvestments.filter((i) => i.businessId === businessId)
    ).map((i) => ({
      id: i.id,
      description: i.description,
      amount: i.amount,
      type: i.type,
      date: i.date,
      sourceType: i.sourceType ?? null,
      sourceName: i.sourceName ?? null,
      createdAt: i.createdAt,
    }));
  }

  const investmentsOrdered = [...scopedInvestments].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const totalInvestments = scopedInvestments.reduce((s, i) => s + i.amount, 0);
  const investmentsSummary =
    scopedInvestments.length === 0
      ? "Nenhum investimento registrado."
      : investmentsOrdered
          .map((i) => `${i.date}: ${i.amount.toFixed(2).replace(".", ",")}`)
          .join(" · ");

  const netRevenue = grossRevenue - totalExpenses;
  const personalProfit = operationalProfit - totalExpenses * 0.3;
  const workingCapital = grossRevenue - totalCost;

  const deferredCollections = incomeEntries.filter((e) => e.category === "recebimento_venda_anterior");
  const otherIncome = incomeEntries.filter((e) => e.category !== "recebimento_venda_anterior");
  const totalIncome = grossRevenue + otherIncome.reduce((s, e) => s + e.amount, 0);
  const totalOut = expenseEntries.reduce((s, e) => s + e.amount, 0) + totalCost;

  const dualFinance = await getDualFinancialView(businessId, { start: monthStart, end: monthEnd });

  return {
    grossRevenue,
    netRevenue,
    operationalProfit,
    personalProfit,
    workingCapital,
    initialInvestment: totalInvestments,
    investments: investmentsOrdered,
    investmentsSummary,
    operatorFinance: dualFinance,
    cashFlow: {
      income: totalIncome,
      expenses: totalOut,
      balance: totalIncome - totalOut,
      deferredCollections: deferredCollections.reduce((s, e) => s + e.amount, 0),
    },
    monthlyChart: await getRevenueChart(30, businessId),
  };
}

export async function getGoalsWithProgress(businessId: string = ALL_BUSINESSES_ID) {
  const allGoals = await fetchMetricGoals(businessId);

  const result = [];
  for (const goal of allGoals) {
    const periodSales = await fetchMetricSales({
      businessId,
      dateGte: goal.periodStart,
      dateLte: goal.periodEnd,
    });
    const current = periodSales.reduce((s, v) => s + v.totalAmount, 0);
    const progress = goalProgress(current, goal.targetAmount);
    result.push({ ...goal, type: goal.type, current, progress, completed: progress >= 100 });
  }
  return result;
}

export async function getRankings(businessId: string = ALL_BUSINESSES_ID) {
  return computeRankings(businessId);
}

export async function getCalendarData(
  year: number,
  month: number,
  businessId: string = ALL_BUSINESSES_ID,
) {
  const target = await getDailyGoalTarget(businessId);
  const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

  const monthSales = await fetchScopedSales({ businessId, dateGte: startDate, dateLte: endDate });

  const dayData: Record<
    string,
    { revenue: number; status: "hit" | "close" | "miss"; sales: typeof monthSales }
  > = {};

  for (const sale of monthSales) {
    if (!dayData[sale.date]) {
      dayData[sale.date] = { revenue: 0, status: "miss", sales: [] };
    }
    dayData[sale.date].revenue += sale.totalAmount;
    dayData[sale.date].sales.push(sale);
  }

  for (const [, data] of Object.entries(dayData)) {
    data.status = computeCalendarDayStatus(data.revenue, target);
  }

  return { dayData, target };
}

export async function getProjections(businessId: string = ALL_BUSINESSES_ID) {
  return computeProjections(businessId);
}

export async function getClientsForBusiness(businessId: string = ALL_BUSINESSES_ID) {
  const allClients = await fetchMetricClients();
  const saleBusinessMap = await buildClientSaleBusinessMap();
  return await filterClientsForBusiness(allClients, businessId, saleBusinessMap);
}

export async function getClientDetails(clientId: string, businessId: string = ALL_BUSINESSES_ID) {
  const client = await getClientById(clientId);
  if (!client) return null;

  let clientSales = (await fetchMetricSales()).filter((s) => s.clientId === clientId);
  if (!isAllBusinesses(businessId)) {
    clientSales = clientSales.filter((s) => s.businessId === businessId);
  }

  const saleIds = clientSales.map((s) => s.id).filter(Boolean) as string[];
  const allItems = await fetchMetricSaleItems(saleIds);
  const allProducts = await listProducts(ALL_BUSINESSES_ID);
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  const productCounts: Record<string, number> = {};
  for (const item of allItems) {
    const product = productMap.get(item.productId);
    if (product) {
      productCounts[product.name] = (productCounts[product.name] ?? 0) + item.quantity;
    }
  }

  const favoriteProduct =
    Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sem histórico";
  const totalSpent = clientSales.reduce((s, v) => s + v.totalAmount, 0);

  return {
    client,
    purchaseCount: clientSales.length,
    totalSpent,
    favoriteProduct,
    lastPurchase: clientSales[0] ?? null,
    isRecurring: clientSales.length >= 3,
    sales: clientSales,
  };
}

export async function getLowStockProducts(businessId: string = ALL_BUSINESSES_ID) {
  return (await fetchActiveProducts(businessId)).filter(
    (p) => p.stockQuantity <= (p.minStock ?? 0),
  );
}

export async function getDayReport(date: string, businessId: string = ALL_BUSINESSES_ID) {
  const report = await computeDayReport(date, businessId);
  const operatorFinance = await getDayDualFinancialView(date, businessId);
  return { ...report, operatorFinance };
}

export type DayReportWithOperator = Awaited<ReturnType<typeof getDayReport>> & {
  operatorFinance: DualFinancialView;
};
