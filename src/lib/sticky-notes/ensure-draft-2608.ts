import {
  buildWeekdayDraftTemplate,
  isOfficialDraftNote,
  officialDraftNoteTitle,
} from "@/lib/day-registration/weekday-draft-templates";
import {
  listStickyNotes,
  upsertStickyNote,
} from "@/platform/db/repositories/sticky-note-repository";
import type { StickyNote } from "@/lib/sticky-notes/types";
import {
  FORCE_TEMPLATE_NOTE_DATE,
  usesNewDailyDraftTemplate,
} from "@/lib/sticky-notes/draft-template-markers";

export { FORCE_TEMPLATE_NOTE_DATE, usesNewDailyDraftTemplate } from "@/lib/sticky-notes/draft-template-markers";

/**
 * Garante a nota oficial do 26/08 no modelo novo.
 * Idempotente: se já tem o marcador, não reescreve.
 * Nunca altera 25/08 nem outros dias.
 */
export async function ensureDraftNote2608(ownerId: string): Promise<StickyNote | null> {
  const notes = await listStickyNotes(ownerId, { includeArchived: true });
  const prior = notes.find(
    (n) => !n.archived && isOfficialDraftNote(n, FORCE_TEMPLATE_NOTE_DATE),
  );

  if (prior && usesNewDailyDraftTemplate(prior.body)) {
    return prior;
  }

  const now = new Date().toISOString();
  return upsertStickyNote(ownerId, {
    id: prior?.id,
    title: officialDraftNoteTitle(FORCE_TEMPLATE_NOTE_DATE),
    body: buildWeekdayDraftTemplate(FORCE_TEMPLATE_NOTE_DATE),
    color: "mint",
    noteDate: FORCE_TEMPLATE_NOTE_DATE,
    pinned: false,
    archived: false,
    sortOrder: prior?.sortOrder ?? 0,
    clientUpdatedAt: now,
  });
}
