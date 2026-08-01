import { NextResponse } from "next/server";
import { getDashboardMetrics, getRevenueChart, getPaymentMethodChart, getFlavorChart, getSalesChart, getGrowthChart } from "@/lib/analytics";
import { generateInsights } from "@/lib/insights-engine";
import { MSG, apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const metrics = await getDashboardMetrics();
    const revenueChart = await getRevenueChart(14);
    const profitChart = await getRevenueChart(14);
    const salesChart = await getSalesChart();
    const growthChart = await getGrowthChart();
    const paymentChart = await getPaymentMethodChart();
    const flavorChart = await getFlavorChart();
    const insights = (await generateInsights()).slice(0, 4);

    return NextResponse.json({
      metrics,
      charts: {
        revenue: revenueChart,
        profit: profitChart,
        sales: salesChart,
        growth: growthChart,
        payments: paymentChart,
        flavors: flavorChart,
      },
      insights,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return apiError(MSG.LOAD_DASHBOARD);
  }
}
