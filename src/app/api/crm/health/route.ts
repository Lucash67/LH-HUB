import { NextResponse } from "next/server";
import postgres from "postgres";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import { getDatabaseUrl } from "@/platform/db/config";

/** Healthcheck do produto CRM — schema isolado + bootstrap do workspace. */
export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;

  const sql = postgres(getDatabaseUrl(), { prepare: false, max: 1 });
  try {
    const found = await sql`
      SELECT 1 AS ok FROM information_schema.schemata WHERE schema_name = 'crm' LIMIT 1
    `;
    const tables = await sql`
      SELECT COUNT(*)::int AS n
      FROM information_schema.tables
      WHERE table_schema = 'crm'
    `;
    const workspace = await ensureCrmWorkspace(auth.id);
    return NextResponse.json({
      product: "OMNI CRM",
      schema: "crm",
      ready: found.length > 0,
      tables: tables[0]?.n ?? 0,
      workspaceId: workspace.workspaceId,
      userId: auth.id,
    });
  } catch (error) {
    console.error("CRM health error:", error);
    return NextResponse.json(
      { product: "OMNI CRM", schema: "crm", ready: false },
      { status: 503 },
    );
  } finally {
    await sql.end({ timeout: 2 });
  }
}
