import { NextRequest, NextResponse } from "next/server";
import { generateInsights } from "@/lib/insights-engine";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const insights = await generateInsights(businessId);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights GET error:", error);
    return apiError(MSG.LOAD_INSIGHTS);
  }
}
