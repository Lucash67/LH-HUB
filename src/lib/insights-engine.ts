import { parseISO, getDay } from "date-fns";
import { getMonthRange, formatCurrency } from "./utils";
import {
  computeDashboardMetrics,
  loadMonthSalesDataset,
  loadKpiDataset,
  bottomProductByQuantity,
  topProductByQuantity,
  salesCountByHour,
  computeExecutiveKpis,
  computeRankings,
  computeProductKpis,
} from "./analytics-engine";
import { ALL_BUSINESSES_ID, getBusinessUnitName, isAllBusinesses } from "./business-units";

export interface Insight {
  id: string;
  type: "positive" | "warning" | "info" | "opportunity";
  title: string;
  description: string;
  metric?: string;
}

async function prependExecutiveInsights(insights: Insight[], businessId: string): Promise<void> {
  const kpis = await computeExecutiveKpis(businessId);
  const rankings = await computeRankings(businessId);

  if (isAllBusinesses(businessId) && kpis.operations.participation.length >= 1) {
    const top = kpis.operations.participation[0];
    if (top.share >= 25) {
      insights.push({
        id: "exec-op-share",
        type: "info",
        title: `${getBusinessUnitName(top.businessId)} representa ${top.share.toFixed(0)}% da receita`,
        description: `${formatCurrency(top.revenue)} faturados — concentre produção nesta operação.`,
        metric: `${top.share.toFixed(0)}%`,
      });
    }
  }

  const topShare = kpis.products.shares[0];
  if (topShare && topShare.revenueShare >= 20) {
    insights.push({
      id: "exec-product-share",
      type: "opportunity",
      title: `${topShare.name} representa ${topShare.revenueShare.toFixed(0)}% da receita`,
      description: `${topShare.quantity} unidades vendidas. Reforce estoque e visibilidade deste item.`,
      metric: `${topShare.revenueShare.toFixed(0)}%`,
    });
  }

  if (Math.abs(kpis.performance.monthlyGrowth) >= 1) {
    const up = kpis.performance.monthlyGrowth > 0;
    insights.push({
      id: "exec-monthly-growth",
      type: up ? "positive" : "warning",
      title: `Receita ${up ? "cresceu" : "caiu"} ${Math.abs(kpis.performance.monthlyGrowth).toFixed(0)}% no mês`,
      description: up
        ? "Ritmo positivo — mantenha produção alinhada ao pico de demanda."
        : "Volume abaixo do esperado — revise mix de produtos e horários.",
      metric: `${up ? "+" : ""}${kpis.performance.monthlyGrowth.toFixed(0)}%`,
    });
  }

  if (Math.abs(kpis.performance.dailyGrowth) >= 5) {
    const up = kpis.performance.dailyGrowth > 0;
    insights.push({
      id: "exec-daily-growth",
      type: up ? "positive" : "warning",
      title: `Receita ${up ? "aumentou" : "caiu"} ${Math.abs(kpis.performance.dailyGrowth).toFixed(0)}% vs ontem`,
      description: up
        ? "Momentum positivo no dia — mantenha ritmo de vendas."
        : "Volume abaixo de ontem — considere combos ou promoções pontuais.",
      metric: `${up ? "+" : ""}${kpis.performance.dailyGrowth.toFixed(0)}%`,
    });
  }

  const bestDow = rankings.bestDaysOfWeek[0];
  if (bestDow && bestDow.revenue > 0) {
    insights.push({
      id: "exec-best-day",
      type: "info",
      title: `Seu melhor dia continua sendo ${bestDow.day.toLowerCase()}`,
      description: `${formatCurrency(bestDow.revenue)} em receita acumulada neste dia da semana.`,
      metric: bestDow.day,
    });
  }

  if (kpis.clients.unique > 0) {
    insights.push({
      id: "exec-recurrence",
      type: kpis.clients.recurrenceRate >= 40 ? "positive" : "info",
      title: `${kpis.clients.recurrenceRate.toFixed(0)}% dos clientes são recorrentes`,
      description: `${kpis.clients.recurring} de ${kpis.clients.unique} clientes compraram mais de uma vez. Ticket médio: ${formatCurrency(kpis.clients.averageTicketPerClient)}.`,
      metric: `${kpis.clients.recurrenceRate.toFixed(0)}%`,
    });
  }

  const dailyGoal = kpis.goals.entries.find((g) => g.type === "daily");
  if (dailyGoal && dailyGoal.targetAmount > 0) {
    if (dailyGoal.percentAchieved >= 100) {
      insights.push({
        id: "exec-goal-hit",
        type: "positive",
        title: "Meta diária atingida",
        description: `${formatCurrency(dailyGoal.current)} de ${formatCurrency(dailyGoal.targetAmount)} — excelente desempenho hoje.`,
        metric: "100%",
      });
    } else if (dailyGoal.percentAchieved >= 70) {
      insights.push({
        id: "exec-goal-close",
        type: "opportunity",
        title: `Faltam ${formatCurrency(dailyGoal.remaining)} para a meta`,
        description: `${dailyGoal.percentAchieved.toFixed(0)}% concluído — ${formatCurrency(dailyGoal.requiredDailyPace)}/dia para fechar o mês.`,
        metric: `${dailyGoal.percentAchieved.toFixed(0)}%`,
      });
    }
  }

  const { start: monthStartExec } = getMonthRange();
  const monthProductKpis = computeProductKpis(
    await loadKpiDataset(businessId, { start: monthStartExec }),
  );
  if (monthProductKpis.lowest && monthProductKpis.lowest.quantity < 10) {
    insights.push({
      id: "exec-low-product",
      type: "warning",
      title: `${monthProductKpis.lowest.name} possui baixa saída`,
      description: `Somente ${monthProductKpis.lowest.quantity} unidades no mês. Avalie promoção ou descontinuação.`,
      metric: `${monthProductKpis.lowest.quantity} un.`,
    });
  }
}

export async function generateInsights(businessId: string = ALL_BUSINESSES_ID): Promise<Insight[]> {
  const insights: Insight[] = [];
  await prependExecutiveInsights(insights, businessId);

  const { start: monthStart } = getMonthRange();
  const { sales: allSales, items: monthItems, products: allProducts } =
    await loadMonthSalesDataset(businessId, monthStart);
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  const productByDay: Record<string, Record<number, number>> = {};

  for (const sale of allSales) {
    const dow = getDay(parseISO(sale.date));
    const saleItemsForSale = monthItems.filter((i) => i.saleId === sale.id);
    for (const item of saleItemsForSale) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      if (!productByDay[product.name]) productByDay[product.name] = {};
      productByDay[product.name][dow] = (productByDay[product.name][dow] ?? 0) + item.quantity;
    }
  }

  for (const [productName, dayData] of Object.entries(productByDay)) {
    const total = Object.values(dayData).reduce((s, v) => s + v, 0);
    const fridaySales = dayData[5] ?? 0;
    if (total > 0 && fridaySales / total > 0.25) {
      const pct = Math.round((fridaySales / total) * 100);
      insights.push({
        id: `day-${productName}`,
        type: "info",
        title: `${productName} vende ${pct}% mais às sextas`,
        description: `Produza mais ${productName} na quinta à noite para cobrir a demanda de sexta.`,
        metric: `${pct}%`,
      });
    }
  }

  const hourCounts = salesCountByHour(allSales);
  const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (topHour) {
    insights.push({
      id: "peak-hour",
      type: "positive",
      title: `Pico de vendas às ${topHour[0]}:00`,
      description: `${topHour[1]} vendas concentradas neste horário — prepare produção e equipe antes.`,
      metric: `${topHour[1]} vendas`,
    });
  }

  const productSales: Record<string, number> = {};
  for (const item of monthItems) {
    const product = productMap.get(item.productId);
    if (product) {
      productSales[product.name] = (productSales[product.name] ?? 0) + item.quantity;
    }
  }

  const topProduct = topProductByQuantity(productSales);
  if (topProduct && !insights.some((i) => i.id === "exec-product-share")) {
    insights.push({
      id: "top-product",
      type: "opportunity",
      title: `${topProduct[0]} lidera em volume`,
      description: `${topProduct[1]} unidades vendidas no mês — garanta produção suficiente.`,
      metric: `${topProduct[1]} un.`,
    });
  }

  const bottomProduct = bottomProductByQuantity(productSales);
  if (bottomProduct && bottomProduct[1] < 10 && !insights.some((i) => i.id === "exec-low-product")) {
    insights.push({
      id: "low-product",
      type: "warning",
      title: `${bottomProduct[0]} possui baixa saída`,
      description: `Somente ${bottomProduct[1]} unidades no mês. Teste promoções ou substituição no cardápio.`,
      metric: `${bottomProduct[1]} un.`,
    });
  }

  const deptSales: Record<string, number> = {};
  for (const sale of allSales) {
    if (sale.department) {
      deptSales[sale.department] = (deptSales[sale.department] ?? 0) + sale.totalAmount;
    }
  }

  const topDept = Object.entries(deptSales).sort((a, b) => b[1] - a[1])[0];
  if (topDept) {
    insights.push({
      id: "top-dept",
      type: "info",
      title: `Setor ${topDept[0]} lidera em faturamento`,
      description: `${formatCurrency(topDept[1])} em vendas para clientes deste setor no mês.`,
      metric: formatCurrency(topDept[1]),
    });
  }

  const metrics = await computeDashboardMetrics(businessId);
  if (metrics.growthVsYesterday > 5) {
    insights.push({
      id: "growth",
      type: "positive",
      title: `Receita subiu ${metrics.growthVsYesterday.toFixed(0)}% vs ontem`,
      description: `${formatCurrency(metrics.revenueToday)} faturados hoje — momentum positivo.`,
      metric: `+${metrics.growthVsYesterday.toFixed(0)}%`,
    });
  } else if (metrics.growthVsYesterday < -10) {
    insights.push({
      id: "growth-down",
      type: "warning",
      title: `Queda de ${Math.abs(metrics.growthVsYesterday).toFixed(0)}% vs ontem`,
      description: `${formatCurrency(metrics.revenueToday)} hoje contra meta de ${formatCurrency(metrics.dailyGoal)}.`,
      metric: `${metrics.growthVsYesterday.toFixed(0)}%`,
    });
  }

  const seen = new Set<string>();
  return insights.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}
