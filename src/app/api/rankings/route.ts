import { NextRequest, NextResponse } from "next/server";
import { getRankings } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const data = await getRankings(businessId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Rankings GET error:", error);
    return apiError(MSG.LOAD_RANKINGS);
  }
}
