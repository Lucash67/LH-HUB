/**
 * Cria no módulo Notas os rascunhos oficiais 03–07/08/2026 (versão ajustada).
 * Uso: pnpm tsx scripts/seed-notes-0308-0708.ts
 */
import fs from "fs";
import path from "path";
import "./load-env";
import { eq, ilike, or } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { users } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import {
  listStickyNotes,
  upsertStickyNote,
} from "../src/platform/db/repositories/sticky-note-repository";
import type { StickyNoteColor } from "../src/lib/sticky-notes/types";

const MD_PATH = path.join(
  process.cwd(),
  "docs",
  "rascunhos-recuperados",
  "RASCUNHOS-03-07-08-AJUSTADOS.md",
);

const DAYS: Array<{
  label: string;
  noteDate: string;
  title: string;
  color: StickyNoteColor;
}> = [
  {
    label: "03/08",
    noteDate: "2026-08-03",
    title: "Rascunho oficial 03/08/2026 — Salgados (ajustado)",
    color: "coral",
  },
  {
    label: "04/08",
    noteDate: "2026-08-04",
    title: "Rascunho oficial 04/08/2026 — Salgados (ajustado)",
    color: "peach",
  },
  {
    label: "05/08",
    noteDate: "2026-08-05",
    title: "Rascunho oficial 05/08/2026 — Salgados (ajustado)",
    color: "sand",
  },
  {
    label: "06/08",
    noteDate: "2026-08-06",
    title: "Rascunho oficial 06/08/2026 — Salgados (ajustado)",
    color: "mint",
  },
  {
    label: "07/08",
    noteDate: "2026-08-07",
    title: "Rascunho oficial 07/08/2026 — Salgados (ajustado)",
    color: "fog",
  },
];

function extractBodies(md: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const day of DAYS) {
    const heading = `## ${day.label}`;
    const start = md.indexOf(heading);
    if (start < 0) throw new Error(`Heading não encontrado: ${heading}`);
    const after = md.slice(start);
    const fenceOpen = after.indexOf("```");
    if (fenceOpen < 0) throw new Error(`Bloco \`\`\` ausente após ${heading}`);
    const contentStart = fenceOpen + 3;
    // skip optional language tag / newline
    const rest = after.slice(contentStart).replace(/^\w*\r?\n/, "");
    const fenceClose = rest.indexOf("```");
    if (fenceClose < 0) throw new Error(`Fechamento \`\`\` ausente em ${heading}`);
    map.set(day.label, rest.slice(0, fenceClose).trim());
  }
  return map;
}

async function resolveOwnerId(): Promise<string> {
  const db = await getPostgresDb();
  const emailHint = process.env.LBO_OWNER_EMAIL?.trim();
  if (emailHint) {
    const rows = await queryAll(
      db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.email, emailHint)),
    );
    if (rows[0]) {
      console.log(`Owner: ${rows[0].name} <${rows[0].email}>`);
      return rows[0].id;
    }
    throw new Error(`Usuário não encontrado: ${emailHint}`);
  }

  const rows = await queryAll(
    db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(or(ilike(users.email, "%lucas%"), ilike(users.name, "%lucas%"))),
  );
  if (rows.length === 1) {
    console.log(`Owner: ${rows[0]!.name} <${rows[0]!.email}>`);
    return rows[0]!.id;
  }
  if (rows.length > 1) {
    console.log("Vários usuários Lucas — use LBO_OWNER_EMAIL=");
    for (const r of rows) console.log(`  ${r.id}  ${r.email}  ${r.name}`);
    throw new Error("Ambiguidade de owner");
  }

  const all = await queryAll(
    db.select({ id: users.id, email: users.email, name: users.name }).from(users),
  );
  if (all.length === 1) {
    console.log(`Owner (único): ${all[0]!.name} <${all[0]!.email}>`);
    return all[0]!.id;
  }
  console.log("Usuários no banco:");
  for (const r of all) console.log(`  ${r.id}  ${r.email}  ${r.name}`);
  throw new Error("Defina LBO_OWNER_EMAIL=seu@email");
}

async function main() {
  const md = fs.readFileSync(MD_PATH, "utf8");
  const bodies = extractBodies(md);
  const ownerId = await resolveOwnerId();
  const existing = await listStickyNotes(ownerId, { includeArchived: true });
  const now = new Date().toISOString();

  for (const day of DAYS) {
    const body = bodies.get(day.label);
    if (!body) throw new Error(`Body vazio: ${day.label}`);

    const prior = existing.find(
      (n) =>
        n.noteDate === day.noteDate &&
        n.title.includes("Rascunho oficial") &&
        n.title.includes(day.label),
    );

    const note = await upsertStickyNote(ownerId, {
      id: prior?.id,
      title: day.title,
      body,
      color: day.color,
      noteDate: day.noteDate,
      pinned: false,
      archived: false,
      sortOrder: prior?.sortOrder ?? 0,
      clientUpdatedAt: now,
    });

    console.log(
      `${prior ? "↻" : "+"} ${day.label} → ${note.id} (${body.length} chars) · ${day.title}`,
    );
  }

  console.log("\nPronto — abra /notas e filtre pelas datas 03–07/08/2026.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
