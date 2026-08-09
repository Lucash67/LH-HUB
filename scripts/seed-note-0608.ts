/**
 * Recria só a nota do 06/08 (ajustada) na conta do Lucas.
 * Uso: LBO_OWNER_EMAIL=... pnpm tsx scripts/seed-note-0608.ts
 */
import fs from "fs";
import path from "path";
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { users } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import {
  listStickyNotes,
  upsertStickyNote,
} from "../src/platform/db/repositories/sticky-note-repository";

const MD_PATH = path.join(
  process.cwd(),
  "docs",
  "rascunhos-recuperados",
  "RASCUNHOS-03-07-08-AJUSTADOS.md",
);

function extractDay06(md: string): string {
  const heading = "## 06/08";
  const start = md.indexOf(heading);
  if (start < 0) throw new Error("Heading ## 06/08 não encontrado");
  const after = md.slice(start);
  const fenceOpen = after.indexOf("```");
  const rest = after.slice(fenceOpen + 3).replace(/^\w*\r?\n/, "");
  const fenceClose = rest.indexOf("```");
  return rest.slice(0, fenceClose).trim();
}

async function main() {
  const email = process.env.LBO_OWNER_EMAIL?.trim() || "lucashcampos667@gmail.com";
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.email, email)),
  );
  const owner = rows[0];
  if (!owner) throw new Error(`Usuário não encontrado: ${email}`);

  const body = extractDay06(fs.readFileSync(MD_PATH, "utf8"));
  const existing = await listStickyNotes(owner.id, { includeArchived: true });
  const prior = existing.find(
    (n) =>
      n.noteDate === "2026-08-06" &&
      n.title.includes("Rascunho oficial") &&
      n.title.includes("06/08"),
  );

  const note = await upsertStickyNote(owner.id, {
    id: prior?.id,
    title: "Rascunho oficial 06/08/2026 — Salgados (ajustado)",
    body,
    color: "mint",
    noteDate: "2026-08-06",
    pinned: false,
    archived: false,
    sortOrder: prior?.sortOrder ?? 0,
    clientUpdatedAt: new Date().toISOString(),
  });

  console.log(`${prior ? "↻" : "+"} 06/08 → ${note.id} · ${owner.email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
