import { NextRequest, NextResponse } from "next/server";
import { getProjections } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(auth, request.nextUrl.searchParams.get("businessId"), async (scope) => {
      const data = await getProjections(scope.businessId);
      return NextResponse.json(data);
    });
  } catch (error) {
    console.error("Projections GET error:", error);
    return apiError(MSG.LOAD_PROJECTIONS);
  }
}
