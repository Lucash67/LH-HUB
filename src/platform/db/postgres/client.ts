import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as pgSchema from "@/lib/db/postgres/schema";
import { getDatabaseUrl } from "@/platform/db/config";
import { postgresBusinessSeedRows } from "@/platform/db/business-id";
import { businesses, goals as pgGoals } from "@/lib/db/postgres/schema";
import { format } from "date-fns";

const schema = pgSchema;

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let seedPromise: Promise<void> | null = null;

async function seedPostgresIfEmpty(db: ReturnType<typeof drizzle<typeof schema>>): Promise<void> {
  const existing = await db.select().from(businesses).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  for (const row of postgresBusinessSeedRows()) {
    await db.insert(businesses).values({
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status,
      createdAt: now,
      updatedAt: now,
    });
  }

  const today = format(now, "yyyy-MM-dd");
  for (const row of postgresBusinessSeedRows()) {
    for (const goalType of ["daily", "weekly", "monthly", "yearly"] as const) {
      await db.insert(pgGoals).values({
        businessId: row.id,
        goalType,
        targetAmount: "0",
        targetUnits: null,
        periodStart: today,
        periodEnd: today,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function getPostgresDb() {
  if (dbInstance) {
    if (seedPromise) await seedPromise;
    return dbInstance;
  }

  client = postgres(getDatabaseUrl(), { prepare: false, max: 10 });
  dbInstance = drizzle(client, { schema });
  seedPromise = seedPostgresIfEmpty(dbInstance);
  await seedPromise;
  return dbInstance;
}

export async function runPostgresTransaction<T>(fn: (db: NonNullable<typeof dbInstance>) => Promise<T>): Promise<T> {
  const db = await getPostgresDb();
  return db.transaction(fn);
}

export async function closePostgresConnection(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    dbInstance = null;
    seedPromise = null;
  }
}

export { schema as postgresSchema };
