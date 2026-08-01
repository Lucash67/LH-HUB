import { NextResponse } from "next/server";
import { ALL_BUSINESSES_ID } from "@/lib/business-units";
import { MSG, apiError } from "@/shared/api-messages";
import { listBusinesses } from "@/platform/db/repositories/business-repository";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const rows = await listBusinesses(auth.id);

    return NextResponse.json({
      all: { id: ALL_BUSINESSES_ID, name: "Todos" },
      units: rows,
    });
  } catch (error) {
    console.error("Businesses GET error:", error);
    return apiError(MSG.LOAD_SETTINGS);
  }
}
