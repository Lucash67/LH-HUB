import { NextRequest, NextResponse } from "next/server";
import {
  getProfitBankView,
  setPracticalProfitBankBalance,
} from "@/lib/profit-bank-service";
import { MSG, apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { SALGADOS_BUSINESS_ID } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const data = await getProfitBankView(scope.businessId);
      return NextResponse.json(data);
    });
  } catch (error) {
    console.error("Profit bank GET error:", error);
    return apiError(MSG.LOAD_PROFIT_BANK);
  }
}

/** Atualiza o saldo prático (extrato do banco / cofrinho real). */
export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    return await withTenantScope(
      auth,
      body.businessId ?? request.nextUrl.searchParams.get("businessId"),
      async (scope) => {
        const amount = Number(body.practicalBalance ?? body.amount);
        if (!Number.isFinite(amount) || amount < 0) {
          return apiError("Informe um saldo prático válido.", 400);
        }
        const targetId =
          scope.businessId === "all" ? SALGADOS_BUSINESS_ID : scope.businessId;
        await setPracticalProfitBankBalance(targetId, amount);
        const data = await getProfitBankView(scope.businessId);
        return NextResponse.json(data);
      },
    );
  } catch (error) {
    console.error("Profit bank PUT error:", error);
    return apiError(MSG.SAVE_SETTINGS);
  }
}
