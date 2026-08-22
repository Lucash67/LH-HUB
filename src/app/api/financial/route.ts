import { NextRequest, NextResponse } from "next/server";
import { getFinancialSummary } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";

function isISODate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const params = request.nextUrl.searchParams;
      const businessId = scope.businessId;
      const date = params.get("date");
      const dateFrom = params.get("dateFrom");
      const dateTo = params.get("dateTo");
      const viewMode = params.get("viewMode");

      let options: Parameters<typeof getFinancialSummary>[1];
      if (viewMode === "range" && isISODate(dateFrom) && isISODate(dateTo)) {
        const [from, to] = dateFrom <= dateTo ? [dateFrom, dateTo] : [dateTo, dateFrom];
        options = { viewMode: "range", dateFrom: from, dateTo: to };
      } else if (viewMode === "day" && isISODate(date)) {
        options = { viewMode: "day", date };
      } else {
        options = undefined;
      }

      const data = await getFinancialSummary(businessId, options);
      return NextResponse.json(data);
    });
  } catch (error) {
    console.error("Financial GET error:", error);
    return apiError(MSG.LOAD_FINANCIAL);
  }
}
