/**
 * Upsert SOMENTE a nota do 26/08 com o modelo padrão atual.
 * Não toca no 25/08 nem em outros dias.
 *
 * Uso: pnpm tsx scripts/seed-note-2608.ts
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { users } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import {
  listStickyNotes,
  upsertStickyNote,
} from "../src/platform/db/repositories/sticky-note-repository";
import {
  buildWeekdayDraftTemplate,
  officialDraftNoteTitle,
} from "../src/lib/day-registration/weekday-draft-templates";

const NOTE_DATE = "2026-08-26";
const FORBIDDEN_DATE = "2026-08-25";

async function main() {
  const email = process.env.LBO_OWNER_EMAIL?.trim() || "lucashcampos667@gmail.com";
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.email, email)),
  );
  const owner = rows[0];
  if (!owner) throw new Error(`Usuário não encontrado: ${email}`);

  const existing = await listStickyNotes(owner.id, { includeArchived: true });

  // Guarda explícita: nunca alterar 25/08 neste script.
  const day25 = existing.find((n) => n.noteDate === FORBIDDEN_DATE && !n.archived);
  if (day25) {
    console.log(`ℹ 25/08 preservado (id=${day25.id}) — este script não altera.`);
  }

  const prior = existing.find(
    (n) =>
      n.noteDate === NOTE_DATE &&
      !n.archived &&
      (n.title.toLowerCase().includes("rascunho oficial") ||
        n.title.toLowerCase().startsWith("rascunho ")),
  );

  const body = buildWeekdayDraftTemplate(NOTE_DATE);
  const note = await upsertStickyNote(owner.id, {
    id: prior?.id,
    title: officialDraftNoteTitle(NOTE_DATE),
    body,
    color: "mint",
    noteDate: NOTE_DATE,
    pinned: false,
    archived: false,
    sortOrder: prior?.sortOrder ?? 0,
    clientUpdatedAt: new Date().toISOString(),
  });

  console.log(`${prior ? "↻" : "+"} 26/08 → ${note.id} · ${owner.email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
