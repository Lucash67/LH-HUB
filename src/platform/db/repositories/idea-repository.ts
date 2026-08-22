import { and, desc, eq, ne } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "@/platform/db";
import { ideaItems as pgIdeaItems } from "@/lib/db/postgres/schema";
import { ideaItems as sqliteIdeaItems } from "@/lib/db/schema";
import { queryAll, queryOne, queryRun, toIsoTimestamp } from "@/platform/db/query";
import { generateId } from "@/shared/ids/generate-id";
import type { IdeaItem, IdeaKind, IdeaStatus } from "@/lib/ideias/types";

export interface IdeaWriteInput {
  id?: string;
  title?: string;
  body?: string;
  kind?: IdeaKind;
  status?: IdeaStatus;
  pinned?: boolean;
  sortOrder?: number;
  businessId?: string | null;
}

function mapPg(row: typeof pgIdeaItems.$inferSelect): IdeaItem {
  return {
    id: row.id,
    ownerId: row.ownerId,
    businessId: row.businessId,
    title: row.title ?? "",
    body: row.body ?? "",
    kind: (row.kind as IdeaKind) || "ideia",
    status: (row.status as IdeaStatus) || "open",
    pinned: Boolean(row.pinned),
    sortOrder: row.sortOrder ?? 0,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
  };
}

function mapSqlite(row: typeof sqliteIdeaItems.$inferSelect): IdeaItem {
  return {
    id: row.id,
    ownerId: row.ownerId,
    businessId: row.businessId,
    title: row.title ?? "",
    body: row.body ?? "",
    kind: (row.kind as IdeaKind) || "ideia",
    status: (row.status as IdeaStatus) || "open",
    pinned: Boolean(row.pinned),
    sortOrder: row.sortOrder ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listIdeaItems(
  ownerId: string,
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<IdeaItem[]> {
  if (isPostgres()) {
    const db = await getPostgresDb();
    const rows = await queryAll(
      db
        .select()
        .from(pgIdeaItems)
        .where(
          includeArchived
            ? eq(pgIdeaItems.ownerId, ownerId)
            : and(eq(pgIdeaItems.ownerId, ownerId), ne(pgIdeaItems.status, "archived")),
        )
        .orderBy(desc(pgIdeaItems.pinned), desc(pgIdeaItems.updatedAt)),
    );
    return rows.map(mapPg);
  }

  const db = getSqliteDb();
  const rows = includeArchived
    ? db
        .select()
        .from(sqliteIdeaItems)
        .where(eq(sqliteIdeaItems.ownerId, ownerId))
        .orderBy(desc(sqliteIdeaItems.pinned), desc(sqliteIdeaItems.updatedAt))
        .all()
    : db
        .select()
        .from(sqliteIdeaItems)
        .where(and(eq(sqliteIdeaItems.ownerId, ownerId), ne(sqliteIdeaItems.status, "archived")))
        .orderBy(desc(sqliteIdeaItems.pinned), desc(sqliteIdeaItems.updatedAt))
        .all();
  return rows.map(mapSqlite);
}

export async function upsertIdeaItem(ownerId: string, input: IdeaWriteInput): Promise<IdeaItem> {
  const now = new Date();
  const nowIso = now.toISOString();

  if (isPostgres()) {
    const db = await getPostgresDb();
    if (input.id) {
      const existing = await queryOne(
        db
          .select()
          .from(pgIdeaItems)
          .where(and(eq(pgIdeaItems.id, input.id), eq(pgIdeaItems.ownerId, ownerId)))
          .limit(1),
      );
      if (!existing) {
        throw new Error("Ideia não encontrada");
      }
      await queryRun(
        db
          .update(pgIdeaItems)
          .set({
            title: input.title ?? existing.title,
            body: input.body ?? existing.body,
            kind: input.kind ?? existing.kind,
            status: input.status ?? existing.status,
            pinned: input.pinned ?? existing.pinned,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            businessId:
              input.businessId !== undefined ? input.businessId : existing.businessId,
            updatedAt: now,
          })
          .where(and(eq(pgIdeaItems.id, input.id), eq(pgIdeaItems.ownerId, ownerId))),
      );
      const updated = await queryOne(
        db.select().from(pgIdeaItems).where(eq(pgIdeaItems.id, input.id)).limit(1),
      );
      if (!updated) throw new Error("Falha ao atualizar ideia");
      return mapPg(updated);
    }

    const id = generateId();
    await queryRun(
      db.insert(pgIdeaItems).values({
        id,
        ownerId,
        businessId: input.businessId ?? null,
        title: input.title?.trim() || "",
        body: input.body?.trim() || "",
        kind: input.kind ?? "ideia",
        status: input.status ?? "open",
        pinned: input.pinned ?? false,
        sortOrder: input.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      }),
    );
    const created = await queryOne(
      db.select().from(pgIdeaItems).where(eq(pgIdeaItems.id, id)).limit(1),
    );
    if (!created) throw new Error("Falha ao criar ideia");
    return mapPg(created);
  }

  const db = getSqliteDb();
  if (input.id) {
    const existing = db
      .select()
      .from(sqliteIdeaItems)
      .where(and(eq(sqliteIdeaItems.id, input.id), eq(sqliteIdeaItems.ownerId, ownerId)))
      .get();
    if (!existing) throw new Error("Ideia não encontrada");
    db.update(sqliteIdeaItems)
      .set({
        title: input.title ?? existing.title,
        body: input.body ?? existing.body,
        kind: input.kind ?? existing.kind,
        status: input.status ?? existing.status,
        pinned: input.pinned ?? existing.pinned,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        businessId: input.businessId !== undefined ? input.businessId : existing.businessId,
        updatedAt: nowIso,
      })
      .where(and(eq(sqliteIdeaItems.id, input.id), eq(sqliteIdeaItems.ownerId, ownerId)))
      .run();
    const updated = db.select().from(sqliteIdeaItems).where(eq(sqliteIdeaItems.id, input.id)).get();
    if (!updated) throw new Error("Falha ao atualizar ideia");
    return mapSqlite(updated);
  }

  const id = generateId();
  db.insert(sqliteIdeaItems)
    .values({
      id,
      ownerId,
      businessId: input.businessId ?? null,
      title: input.title?.trim() || "",
      body: input.body?.trim() || "",
      kind: input.kind ?? "ideia",
      status: input.status ?? "open",
      pinned: input.pinned ?? false,
      sortOrder: input.sortOrder ?? 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .run();
  const created = db.select().from(sqliteIdeaItems).where(eq(sqliteIdeaItems.id, id)).get();
  if (!created) throw new Error("Falha ao criar ideia");
  return mapSqlite(created);
}

export async function deleteIdeaItem(ownerId: string, id: string): Promise<boolean> {
  if (isPostgres()) {
    const db = await getPostgresDb();
    const existing = await queryOne(
      db
        .select({ id: pgIdeaItems.id })
        .from(pgIdeaItems)
        .where(and(eq(pgIdeaItems.id, id), eq(pgIdeaItems.ownerId, ownerId)))
        .limit(1),
    );
    if (!existing) return false;
    await queryRun(
      db.delete(pgIdeaItems).where(and(eq(pgIdeaItems.id, id), eq(pgIdeaItems.ownerId, ownerId))),
    );
    return true;
  }

  const db = getSqliteDb();
  const existing = db
    .select({ id: sqliteIdeaItems.id })
    .from(sqliteIdeaItems)
    .where(and(eq(sqliteIdeaItems.id, id), eq(sqliteIdeaItems.ownerId, ownerId)))
    .get();
  if (!existing) return false;
  db.delete(sqliteIdeaItems)
    .where(and(eq(sqliteIdeaItems.id, id), eq(sqliteIdeaItems.ownerId, ownerId)))
    .run();
  return true;
}
