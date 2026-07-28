import { NextRequest, NextResponse } from "next/server";
import { getProjections } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const data = await getProjections(businessId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Projections GET error:", error);
    return apiError(MSG.LOAD_PROJECTIONS);
  }
}
