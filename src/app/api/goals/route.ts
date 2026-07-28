import { NextRequest, NextResponse } from "next/server";
import { getGoalsWithProgress } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam, requireSpecificBusinessId, BUSINESS_GOALS_BLOCKED_MESSAGE } from "@/lib/business-units";
import { initializeGoalsIfEmpty, updateGoalTargets } from "@/lib/goals-service";
import { getGoalById, updateGoalById } from "@/platform/db/repositories/goal-repository";

export async function GET(request: NextRequest) {
  try {
    const businessId = parseBusinessIdParam(request.nextUrl.searchParams.get("businessId"));
    const goalsData = await getGoalsWithProgress(businessId);
    return NextResponse.json(goalsData);
  } catch (error) {
    console.error("Goals GET error:", error);
    return apiError(MSG.LOAD_GOALS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const businessId = requireSpecificBusinessId(request.nextUrl.searchParams.get("businessId"));
    await initializeGoalsIfEmpty(businessId);
    const goalsData = await getGoalsWithProgress(businessId);
    return NextResponse.json(goalsData, { status: 201 });
  } catch (error) {
    console.error("Goals POST error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError(MSG.LOAD_GOALS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const businessId = requireSpecificBusinessId(request.nextUrl.searchParams.get("businessId"));
    const body = await request.json();

    if (!body.id) {
      return apiError("Meta não encontrada. Salve suas metas em Configurações primeiro.", 400);
    }

    const goal = await getGoalById(body.id);
    if (!goal || goal.businessId !== businessId) {
      return apiError(BUSINESS_GOALS_BLOCKED_MESSAGE, 400);
    }

    await updateGoalById(body.id, {
      targetAmount: Number(body.targetAmount),
      targetUnits: body.targetUnits ? Number(body.targetUnits) : null,
      periodStart: goal.periodStart,
      periodEnd: goal.periodEnd,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Goals PUT error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError(MSG.UPDATE_GOAL);
  }
}
