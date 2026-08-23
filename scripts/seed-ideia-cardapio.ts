/**
 * Garante a demanda “Novo cardápio + estratégias” em Ideias (idempotente).
 * Uso: pnpm tsx scripts/seed-ideia-cardapio.ts
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { users } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import {
  listIdeaItems,
  upsertIdeaItem,
} from "../src/platform/db/repositories/idea-repository";

const TITLE = "Novo cardápio + estratégias para vender mais";

const BODY = `Demanda registrada a partir da OBS do rascunho diário (ago/2026).

Objetivo: fazer o novo cardápio e novas estratégias para vender mais (volume + mix), sem perder o controle do cofrinho.

Canais a considerar: ACAL, trabalho do Henrique, Unifor.
Consultar também: docs/sprints/future-backlog.md §2.`;

async function main() {
  const email = process.env.LBO_OWNER_EMAIL?.trim() || "lucashcampos667@gmail.com";
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)),
  );
  const owner = rows[0];
  if (!owner) throw new Error(`Usuário não encontrado: ${email}`);

  const existing = await listIdeaItems(owner.id, { includeArchived: true });
  const prior = existing.find(
    (i) => i.title.trim().toLowerCase() === TITLE.toLowerCase() && i.status !== "archived",
  );

  const item = await upsertIdeaItem(owner.id, {
    id: prior?.id,
    title: TITLE,
    body: BODY,
    kind: "demanda",
    status: "open",
    pinned: true,
    sortOrder: prior?.sortOrder ?? 0,
  });

  console.log(`${prior ? "↻" : "+"} Ideia → ${item.id} · ${owner.email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
