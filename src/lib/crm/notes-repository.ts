import { and, desc, eq } from "drizzle-orm";
import { crmStickyNotes } from "@/lib/db/postgres/schema-crm";
import type { StickyNote, StickyNoteColor } from "@/lib/sticky-notes/types";
import { getPostgresDb } from "@/platform/db";
import { toDateString, toIsoTimestamp } from "@/platform/db/query";
import { generateId } from "@/shared/ids/generate-id";

export type CrmNoteWriteInput = {
  id?: string;
  title?: string;
  body?: string;
  color?: StickyNoteColor;
  noteDate?: string | null;
  pinned?: boolean;
  archived?: boolean;
  sortOrder?: number;
  clientUpdatedAt: string;
};

function mapRow(row: typeof crmStickyNotes.$inferSelect): StickyNote {
  return {
    id: row.id,
    ownerId: row.userId,
    businessId: null,
    title: row.title ?? "",
    body: row.body ?? "",
    color: (row.color as StickyNoteColor) || "default",
    noteDate: row.noteDate ? toDateString(row.noteDate) : null,
    pinned: Boolean(row.pinned),
    archived: Boolean(row.archived),
    sortOrder: row.sortOrder ?? 0,
    clientUpdatedAt: toIsoTimestamp(row.clientUpdatedAt),
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
  };
}

export async function listCrmNotes(
  workspaceId: string,
  userId: string,
  { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<StickyNote[]> {
  const db = await getPostgresDb();
  const rows = await db
    .select()
    .from(crmStickyNotes)
    .where(
      includeArchived
        ? and(eq(crmStickyNotes.workspaceId, workspaceId), eq(crmStickyNotes.userId, userId))
        : and(
            eq(crmStickyNotes.workspaceId, workspaceId),
            eq(crmStickyNotes.userId, userId),
            eq(crmStickyNotes.archived, false),
          ),
    )
    .orderBy(desc(crmStickyNotes.pinned), desc(crmStickyNotes.clientUpdatedAt));
  return rows.map(mapRow);
}

export async function getCrmNoteById(
  workspaceId: string,
  userId: string,
  id: string,
): Promise<StickyNote | null> {
  const db = await getPostgresDb();
  const [row] = await db
    .select()
    .from(crmStickyNotes)
    .where(
      and(
        eq(crmStickyNotes.id, id),
        eq(crmStickyNotes.workspaceId, workspaceId),
        eq(crmStickyNotes.userId, userId),
      ),
    )
    .limit(1);
  return row ? mapRow(row) : null;
}

export async function upsertCrmNote(
  workspaceId: string,
  userId: string,
  input: CrmNoteWriteInput,
): Promise<StickyNote> {
  const now = new Date().toISOString();
  const id = input.id ?? generateId();
  const existing = input.id ? await getCrmNoteById(workspaceId, userId, input.id) : null;

  if (existing && input.clientUpdatedAt && existing.clientUpdatedAt > input.clientUpdatedAt) {
    return existing;
  }

  const title = input.title ?? existing?.title ?? "";
  const body = input.body ?? existing?.body ?? "";
  const color = input.color ?? existing?.color ?? "default";
  const noteDate = input.noteDate !== undefined ? input.noteDate : (existing?.noteDate ?? null);
  const pinned = input.pinned ?? existing?.pinned ?? false;
  const archived = input.archived ?? existing?.archived ?? false;
  const sortOrder = input.sortOrder ?? existing?.sortOrder ?? 0;
  const clientUpdatedAt = input.clientUpdatedAt || now;

  const db = await getPostgresDb();
  if (existing) {
    await db
      .update(crmStickyNotes)
      .set({
        title,
        body,
        color,
        noteDate,
        pinned,
        archived,
        sortOrder,
        clientUpdatedAt: new Date(clientUpdatedAt),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(crmStickyNotes.id, id),
          eq(crmStickyNotes.workspaceId, workspaceId),
          eq(crmStickyNotes.userId, userId),
        ),
      );
  } else {
    await db.insert(crmStickyNotes).values({
      id,
      workspaceId,
      userId,
      title,
      body,
      color,
      noteDate,
      pinned,
      archived,
      sortOrder,
      clientUpdatedAt: new Date(clientUpdatedAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const saved = await getCrmNoteById(workspaceId, userId, id);
  if (!saved) throw new Error("Falha ao salvar nota.");
  return saved;
}

export async function deleteCrmNote(
  workspaceId: string,
  userId: string,
  id: string,
): Promise<boolean> {
  const existing = await getCrmNoteById(workspaceId, userId, id);
  if (!existing) return false;
  const db = await getPostgresDb();
  await db
    .delete(crmStickyNotes)
    .where(
      and(
        eq(crmStickyNotes.id, id),
        eq(crmStickyNotes.workspaceId, workspaceId),
        eq(crmStickyNotes.userId, userId),
      ),
    );
  return true;
}
