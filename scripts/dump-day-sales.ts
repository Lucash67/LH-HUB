/** Lista vendas de um dia com produtos — diagnóstico. */
import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { sales, saleItems, products, clients } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import { fromDbBusinessId } from "../src/platform/db/business-id";

async function dump(date: string): Promise<void> {
  const db = await getPostgresDb();
  const daySales = await queryAll(
    db.select().from(sales).where(eq(sales.saleDate, date)),
  );

  console.log(`\n=== ${date} (${daySales.length} vendas) ===`);
  for (const s of daySales.sort((a, b) => (a.saleTime ?? "").localeCompare(b.saleTime ?? ""))) {
    const items = await queryAll(
      db.select().from(saleItems).where(eq(saleItems.saleId, s.id)),
    );
    const client = s.clientId
      ? await queryAll(db.select().from(clients).where(eq(clients.id, s.clientId)))
      : [];
    const names: string[] = [];
    for (const it of items) {
      const prods = await queryAll(
        db.select().from(products).where(eq(products.id, it.productId)),
      );
      names.push(`${it.quantity}x ${prods[0]?.name ?? "?"}`);
    }
    console.log(
      `${s.saleTime} | ${client[0]?.name ?? "—"} | ${names.join(", ")} | ${s.paymentStatus} | ${s.notes ?? ""}`,
    );
  }
}

async function main(): Promise<void> {
  await dump("2026-07-28");
  await dump("2026-07-29");
}

main();
