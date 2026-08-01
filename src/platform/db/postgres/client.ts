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

async function ensureAuthTables(): Promise<void> {
  if (!client) return;
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens (token_hash);
    CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens (user_id);
  `);
}

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
  seedPromise = (async () => {
    await ensureAuthTables();
    await seedPostgresIfEmpty(dbInstance!);
  })();
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
