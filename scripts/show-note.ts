/** Uso: pnpm tsx scripts/show-note.ts 2026-10-05 — imprime as notas do dia. */
import "./load-env";
import { listStickyNotes } from "@/platform/db/repositories/sticky-note-repository";

const OWNER_ID = "55c8453d-509f-4ed2-a7f4-180faa4673e4";

async function main() {
  const date = process.argv[2];
  const notes = await listStickyNotes(OWNER_ID);
  const found = notes.filter((n) => n.noteDate === date);
  if (!found.length) console.log(`Sem nota para ${date}. Datas recentes:`, notes.map((n) => n.noteDate).sort().slice(-8));
  for (const n of found) console.log(`\n----- ${n.noteDate} -----\n${n.body}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
