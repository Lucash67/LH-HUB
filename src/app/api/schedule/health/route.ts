import { NextResponse } from "next/server";
import postgres from "postgres";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { getDatabaseUrl } from "@/platform/db/config";

/** Healthcheck do produto Schedule — confirma schema isolado sem tocar no Business. */
export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;

  const sql = postgres(getDatabaseUrl(), { prepare: false, max: 1 });
  try {
    const found = await sql`
      SELECT 1 AS ok FROM information_schema.schemata WHERE schema_name = 'schedule' LIMIT 1
    `;
    const tables = await sql`
      SELECT COUNT(*)::int AS n
      FROM information_schema.tables
      WHERE table_schema = 'schedule'
    `;
    return NextResponse.json({
      product: "OMNI Schedule",
      schema: "schedule",
      ready: found.length > 0,
      tables: tables[0]?.n ?? 0,
      userId: auth.id,
    });
  } catch (error) {
    console.error("Schedule health error:", error);
    return NextResponse.json(
      { product: "OMNI Schedule", schema: "schedule", ready: false },
      { status: 503 },
    );
  } finally {
    await sql.end({ timeout: 2 });
  }
}
