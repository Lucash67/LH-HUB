import { isPostgres } from "./config";
import { getPostgresDb, runPostgresTransaction } from "./postgres/client";
import {
  DB_PATH,
  getSqlite,
  getSqliteDb,
  runSqliteTransaction,
  sqliteSchema,
} from "./sqlite/client";
import { postgresSchema } from "./postgres/client";

export { DB_PATH };

export const schema = isPostgres() ? postgresSchema : sqliteSchema;

/** @deprecated Prefer getDbAsync() — sync only works with SQLite. */
export function getDb() {
  if (isPostgres()) {
    throw new Error(
      "getDb() is synchronous and only supported for SQLite. Use getDbAsync() with DB_PROVIDER=postgres.",
    );
  }
  return getSqliteDb();
}

export async function getDbAsync() {
  if (isPostgres()) {
    return getPostgresDb();
  }
  return getSqliteDb();
}

export function getSqliteRaw() {
  if (isPostgres()) {
    throw new Error("getSqliteRaw() is only available with SQLite.");
  }
  return getSqlite();
}

/** @deprecated Prefer runInTransactionAsync() for cross-provider support. */
export function runInTransaction<T>(fn: () => T): T {
  if (isPostgres()) {
    throw new Error("Use runInTransactionAsync() with DB_PROVIDER=postgres.");
  }
  return runSqliteTransaction(fn);
}

export async function runInTransactionAsync<T>(fn: () => Promise<T> | T): Promise<T> {
  if (isPostgres()) {
    const db = await getPostgresDb();
    return db.transaction(async () => fn());
  }
  return runSqliteTransaction(() => fn() as T);
}

export { isPostgres, isSqlite, getDbProvider } from "./config";
export { getPostgresDb, closePostgresConnection } from "./postgres/client";
export { getSqliteDb, getSqlite, runSqliteTransaction } from "./sqlite/client";
