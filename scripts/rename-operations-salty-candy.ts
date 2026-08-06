/** Renomeia operações no banco: Salgados → Salty | Brigadeiros → Candy. */
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "@/platform/db";
import { businesses as pgBusinesses } from "@/lib/db/postgres/schema";
import { businessUnits } from "@/lib/db/schema";
import { queryRun } from "@/platform/db/query";
import {
  BRIGADEIROS_BUSINESS_ID,
  SALGADOS_BUSINESS_ID,
} from "@/lib/business-units";
import { POSTGRES_BUSINESS_UUIDS } from "@/platform/db/business-id";

async function main() {
  if (isPostgres()) {
    const db = await getPostgresDb();
    await queryRun(
      db
        .update(pgBusinesses)
        .set({ name: "Salty", updatedAt: new Date() })
        .where(eq(pgBusinesses.id, POSTGRES_BUSINESS_UUIDS[SALGADOS_BUSINESS_ID])),
    );
    await queryRun(
      db
        .update(pgBusinesses)
        .set({ name: "Candy", updatedAt: new Date() })
        .where(eq(pgBusinesses.id, POSTGRES_BUSINESS_UUIDS[BRIGADEIROS_BUSINESS_ID])),
    );
    // Também cobre linhas criadas pelo owner com os slugs legados.
    await queryRun(
      db.update(pgBusinesses).set({ name: "Salty", updatedAt: new Date() }).where(eq(pgBusinesses.slug, "salgados")),
    );
    await queryRun(
      db.update(pgBusinesses).set({ name: "Candy", updatedAt: new Date() }).where(eq(pgBusinesses.slug, "brigadeiros")),
    );
  } else {
    const db = getSqliteDb();
    await queryRun(
      db
        .update(businessUnits)
        .set({ name: "Salty" })
        .where(eq(businessUnits.id, SALGADOS_BUSINESS_ID)),
    );
    await queryRun(
      db
        .update(businessUnits)
        .set({ name: "Candy" })
        .where(eq(businessUnits.id, BRIGADEIROS_BUSINESS_ID)),
    );
  }
  console.log("Operações renomeadas: Salty + Candy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
