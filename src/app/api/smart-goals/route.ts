import { NextRequest, NextResponse } from "next/server";
import { getSmartGoalsView } from "@/lib/smart-goals-service";
import { MSG, apiError } from "@/shared/api-messages";
import { isAllBusinesses, parseBusinessIdParam } from "@/lib/business-units";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const referenceDate = request.nextUrl.searchParams.get("date") ?? undefined;

    if (isAllBusinesses(businessId)) {
      return apiError("Selecione uma operação específica para ver metas inteligentes.", 400);
    }

    const view = await getSmartGoalsView(businessId, referenceDate);
    if (!view) {
      return apiError("Não foi possível calcular metas para esta operação.", 400);
    }

    return NextResponse.json(view);
  } catch (error) {
    console.error("Smart goals GET error:", error);
    return apiError(MSG.LOAD_GOALS);
  }
}
