import { NextRequest, NextResponse } from "next/server";
import { getPerformanceView, type PerformancePeriod } from "@/lib/performance-service";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const businessId = parseBusinessIdParam(params.get("businessId"));
    const period = (params.get("period") === "monthly" ? "monthly" : "weekly") as PerformancePeriod;
    const offset = Number(params.get("offset") ?? "0") || 0;
    const data = await getPerformanceView(businessId, period, offset);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Performance GET error:", error);
    return apiError(MSG.LOAD_PERFORMANCE);
  }
}
