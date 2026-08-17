import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { requireTenantBusinessWrite } from "@/lib/auth/tenant-scope";
import {
  periodReviewUpsertSchema,
  periodTypeSchema,
} from "@/lib/period-reviews/types";
import { resolvePeriodWindow } from "@/lib/period-reviews/period-window";
import {
  deletePeriodReview,
  findPeriodReview,
  listPeriodReviews,
  upsertPeriodReview,
} from "@/platform/db/repositories/period-review-repository";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const periodRaw = request.nextUrl.searchParams.get("period") ?? "weekly";
      const periodParsed = periodTypeSchema.safeParse(periodRaw);
      if (!periodParsed.success) {
        return apiError("Período inválido. Use weekly ou monthly.", 400);
      }
      const periodType = periodParsed.data;

      const list = request.nextUrl.searchParams.get("list") === "1";
      if (list) {
        const reviews = await listPeriodReviews(scope.businessId, periodType);
        return NextResponse.json({ reviews });
      }

      const keyParam = request.nextUrl.searchParams.get("key");
      const offset = Number(request.nextUrl.searchParams.get("offset") ?? "0");
      const window = keyParam
        ? (() => {
            const w = resolvePeriodWindow(periodType, 0, periodType === "weekly" ? parseISOSafe(keyParam) : parseMonthSafe(keyParam));
            return { ...w, periodKey: keyParam };
          })()
        : resolvePeriodWindow(periodType, Number.isFinite(offset) ? offset : 0);

      const review = await findPeriodReview(scope.businessId, periodType, window.periodKey);
      return NextResponse.json({
        review,
        window: {
          periodType,
          periodKey: window.periodKey,
          rangeStart: window.rangeStart,
          rangeEnd: window.rangeEnd,
          label: window.label,
          offset: Number.isFinite(offset) ? offset : 0,
        },
      });
    });
  } catch (error) {
    console.error("Period reviews GET error:", error);
    return apiError("Não foi possível carregar o Retrato.");
  }
}

function parseISOSafe(key: string): Date {
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function parseMonthSafe(key: string): Date {
  const d = new Date(`${key}-01T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    return await withTenantScope(auth, body.businessId ?? request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const businessId = requireTenantBusinessWrite(
        scope,
        body.businessId ?? request.nextUrl.searchParams.get("businessId"),
      );
      const parsed = periodReviewUpsertSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Retrato inválido.", 400);
      }
      const review = await upsertPeriodReview({
        ...parsed.data,
        businessId,
        createdBy: auth.id,
      });
      return NextResponse.json({ review });
    });
  } catch (error) {
    console.error("Period reviews PUT error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError("Não foi possível salvar o Retrato.");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const businessId = requireTenantBusinessWrite(scope, request.nextUrl.searchParams.get("businessId"));
      const id = request.nextUrl.searchParams.get("id");
      if (!id) return apiError("Informe o id do Retrato.", 400);
      const ok = await deletePeriodReview(id, businessId);
      if (!ok) return apiError("Retrato não encontrado.", 404);
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error("Period reviews DELETE error:", error);
    return apiError("Não foi possível apagar o Retrato.");
  }
}
