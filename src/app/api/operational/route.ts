import { NextRequest, NextResponse } from "next/server";
import { getOperationalDayIntelligence } from "@/lib/operational-data-service";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const businessId = parseBusinessIdParam(searchParams.get("businessId"));
    const date = searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiError("Informe uma data válida (yyyy-MM-dd).", 400);
    }

    return NextResponse.json(await getOperationalDayIntelligence(businessId, date));
  } catch (error) {
    console.error("Operational GET error:", error);
    return apiError(MSG.LOAD_SALES);
  }
}
