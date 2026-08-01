import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { buildDashboardView, enrichDiaryContext } from "@/lib/dashboard-view";
import { generateDiaryAutoInsights } from "@/lib/diary-auto-insights";
import { getDiaryEntry } from "@/lib/diary-service";
import { getSmartGoalsView } from "@/lib/smart-goals-service";
import { isAllBusinesses, parseBusinessIdParam } from "@/lib/business-units";
import { fetchMetricGoals } from "@/platform/db/data-access/metrics";
import { listSalesEnriched } from "@/platform/db/repositories/sale-repository";
import type { TemporalViewContext } from "@/stores/temporal-context-store";
import { MSG, apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

function normalizeDashboardSales(
  sales: Awaited<ReturnType<typeof listSalesEnriched>>,
) {
  return sales.map((sale) => ({
    ...sale,
    paymentMethod: sale.paymentMethod ?? "",
  }));
}

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const params = request.nextUrl.searchParams;
    const businessId = parseBusinessIdParam(params.get("businessId"));
    const viewMode = params.get("viewMode") === "day" ? "day" : "general";
    const viewDate = params.get("date") ?? format(new Date(), "yyyy-MM-dd");

    const context: TemporalViewContext = { mode: viewMode, viewDate };

    const [sales, goals] = await Promise.all([
      listSalesEnriched(businessId),
      fetchMetricGoals(businessId),
    ]);

    const dailyGoal = goals.find((g) => g.type === "daily")?.targetAmount ?? 0;

    let diaryEntry = null;
    let autoInsights: Awaited<ReturnType<typeof generateDiaryAutoInsights>> = [];

    if (viewMode === "day" && !isAllBusinesses(businessId)) {
      const [entry, smartGoals, insights] = await Promise.all([
        getDiaryEntry(businessId, viewDate),
        getSmartGoalsView(businessId, viewDate),
        generateDiaryAutoInsights(businessId, viewDate),
      ]);
      diaryEntry = entry;
      autoInsights = insights;
      const diaryContext = enrichDiaryContext(entry, smartGoals?.daily?.targetUnits);
      const data = buildDashboardView(
        normalizeDashboardSales(sales),
        context,
        0,
        dailyGoal,
        0,
        diaryContext,
        businessId,
      );
      return NextResponse.json({ data, diaryEntry, autoInsights });
    }

    const data = buildDashboardView(normalizeDashboardSales(sales), context, 0, dailyGoal, 0, null, businessId);
    return NextResponse.json({ data, diaryEntry: null, autoInsights: [] });
  } catch (error) {
    console.error("Dashboard view GET error:", error);
    return apiError(MSG.LOAD_DASHBOARD);
  }
}
