/**
 * Cria rascunhos oficiais seg–sex na semana focada (idempotente).
 * Uso: pnpm tsx scripts/seed-week-draft-notes.ts [yyyy-MM-dd-segunda]
 * Default: próxima segunda operacional a partir de hoje (ou esta semana se já for seg–sex).
 */
import "./load-env";
import { addDays, format, getDay, startOfWeek } from "date-fns";
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
  isOfficialDraftNote,
  officialDraftNoteTitle,
  operationalWeekDates,
} from "../src/lib/day-registration/weekday-draft-templates";

function resolveWeekStart(arg?: string): string {
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg;
  const today = new Date();
  // Domingo (0) → próxima segunda; senão segunda desta semana.
  if (getDay(today) === 0) {
    return format(addDays(today, 1), "yyyy-MM-dd");
  }
  return format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

async function main() {
  const weekStart = resolveWeekStart(process.argv[2]);
  const email = process.env.LBO_OWNER_EMAIL?.trim() || "lucashcampos667@gmail.com";
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)),
  );
  const owner = rows[0];
  if (!owner) throw new Error(`Usuário não encontrado: ${email}`);

  const existing = await listStickyNotes(owner.id, { includeArchived: true });
  const dates = operationalWeekDates(weekStart);
  let created = 0;
  let skipped = 0;

  for (const date of dates) {
    const prior = existing.find((n) => !n.archived && isOfficialDraftNote(n, date));
    if (prior) {
      skipped += 1;
      console.log(`= ${date} já existe → ${prior.id}`);
      continue;
    }
    const note = await upsertStickyNote(owner.id, {
      title: officialDraftNoteTitle(date),
      body: buildWeekdayDraftTemplate(date),
      color: "mint",
      noteDate: date,
      pinned: false,
      archived: false,
      sortOrder: 0,
      clientUpdatedAt: new Date().toISOString(),
    });
    created += 1;
    console.log(`+ ${date} → ${note.id}`);
  }

  console.log(`Semana ${weekStart}: +${created} · =${skipped} · ${owner.email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
