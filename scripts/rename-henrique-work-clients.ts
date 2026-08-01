/**
 * Renomeia "Trabalho do Henrique" → "Clientes do trabalho do Henrique" (clientes, setor, departamento).
 * Uso: pnpm tsx scripts/rename-henrique-work-clients.ts
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb, getSqliteDb, isPostgres } from "../src/platform/db";
import { queryAll, queryRun } from "../src/platform/db/query";
import { clients as sqliteClients, sales as sqliteSales } from "../src/lib/db/schema";
import { clients as pgClients, sales as pgSales } from "../src/lib/db/postgres/schema";
import { listDiaryEntries, upsertDiaryEntry } from "../src/lib/diary-service";

const OLD_LABEL = "Trabalho do Henrique";
const NEW_LABEL = "Clientes do trabalho do Henrique";

async function renameInPostgres(): Promise<void> {
  const db = await getPostgresDb();

  const clients = await queryAll(
    db.select().from(pgClients).where(eq(pgClients.name, OLD_LABEL)),
  );
  for (const c of clients) {
    await queryRun(
      db
        .update(pgClients)
        .set({ name: NEW_LABEL, sector: NEW_LABEL, updatedAt: new Date() })
        .where(eq(pgClients.id, c.id)),
    );
    console.log(`Cliente renomeado: ${c.id}`);
  }

  await queryRun(
    db
      .update(pgSales)
      .set({ department: NEW_LABEL })
      .where(eq(pgSales.department, OLD_LABEL)),
  );

  const sectorRows = await queryAll(
    db.select().from(pgClients).where(eq(pgClients.sector, OLD_LABEL)),
  );
  for (const c of sectorRows) {
    if (c.name === NEW_LABEL) continue;
    await queryRun(
      db.update(pgClients).set({ sector: NEW_LABEL, updatedAt: new Date() }).where(eq(pgClients.id, c.id)),
    );
  }
}

async function renameInSqlite(): Promise<void> {
  const db = getSqliteDb();

  const clients = await queryAll(
    db.select().from(sqliteClients).where(eq(sqliteClients.name, OLD_LABEL)),
  );
  for (const c of clients) {
    await queryRun(
      db
        .update(sqliteClients)
        .set({ name: NEW_LABEL, sector: NEW_LABEL })
        .where(eq(sqliteClients.id, c.id)),
    );
    console.log(`Cliente renomeado: ${c.id}`);
  }

  await queryRun(
    db.update(sqliteSales).set({ department: NEW_LABEL }).where(eq(sqliteSales.department, OLD_LABEL)),
  );
}

async function patchDiaryFatherSale(businessId: string): Promise<void> {
  const entries = await listDiaryEntries(businessId);
  for (const entry of entries) {
    const buyer = entry.sales?.fatherSale?.buyerName;
    if (buyer !== OLD_LABEL) continue;
    await upsertDiaryEntry({
      ...entry,
      sales: {
        ...entry.sales!,
        fatherSale: {
          ...entry.sales!.fatherSale!,
          buyerName: NEW_LABEL,
        },
      },
    });
    console.log(`Diário ${entry.date}: fatherSale renomeado.`);
  }
}

async function main(): Promise<void> {
  if (isPostgres()) {
    await renameInPostgres();
  } else {
    await renameInSqlite();
  }
  await patchDiaryFatherSale("salgados");
  console.log(`Concluído: "${OLD_LABEL}" → "${NEW_LABEL}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
