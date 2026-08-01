import { eq } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "@/platform/db";
import { mapBusinessRowToLegacy } from "@/platform/db/business-id";
import { queryAll } from "@/platform/db/query";
import { businessUnits } from "@/lib/db/schema";
import { businesses as pgBusinesses } from "@/lib/db/postgres/schema";

export async function listBusinesses(userId: string) {
  if (isPostgres()) {
    const db = await getPostgresDb();
    const rows = await queryAll(
      db.select().from(pgBusinesses).where(eq(pgBusinesses.ownerId, userId)),
    );
    return rows.map((row) => mapBusinessRowToLegacy(row));
  }

  const db = getSqliteDb();
  const rows = await queryAll(
    db.select().from(businessUnits).where(eq(businessUnits.ownerId, userId)),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as "active" | "inactive",
  }));
}
