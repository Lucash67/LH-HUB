import { eq } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "@/platform/db";
import { mapBusinessRowToLegacy, postgresBusinessSeedRows } from "@/platform/db/business-id";
import { queryAll } from "@/platform/db/query";
import { businessUnits } from "@/lib/db/schema";
import { businesses as pgBusinesses } from "@/lib/db/postgres/schema";
import { BUSINESS_UNITS } from "@/lib/business-units";

export async function listBusinesses() {
  if (isPostgres()) {
    const db = await getPostgresDb();
    const rows = await queryAll(db.select().from(pgBusinesses));
    return rows.map((row) => mapBusinessRowToLegacy(row));
  }

  const db = getSqliteDb();
  const rows = await queryAll(db.select().from(businessUnits));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as "active" | "inactive",
  }));
}

export async function getBusinessSeedSlugs() {
  if (isPostgres()) {
    return postgresBusinessSeedRows().map((r) => r.slug);
  }
  return BUSINESS_UNITS.map((b) => b.id);
}
