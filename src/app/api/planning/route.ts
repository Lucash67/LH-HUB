import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { SALGADOS_BUSINESS_ID, isAllBusinesses } from "@/lib/business-units";
import { getMonthPlan, MONTH_PLANS } from "@/lib/planning/month-plans";
import { currentMonthKey, getPlanningView } from "@/lib/planning/planning-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const requested = request.nextUrl.searchParams.get("month") ?? currentMonthKey();
      const month = getMonthPlan(requested) ? requested : MONTH_PLANS[MONTH_PLANS.length - 1]!.month;
      const businessId = isAllBusinesses(scope.businessId) ? SALGADOS_BUSINESS_ID : scope.businessId;
      const view = await getPlanningView(businessId, month);
      return NextResponse.json(view);
    });
  } catch (error) {
    console.error("Planning GET error:", error);
    return apiError("Não foi possível carregar o planejamento.");
  }
}
