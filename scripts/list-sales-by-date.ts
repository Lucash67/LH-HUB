import "./load-env";
import { eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { sales } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";

async function main(): Promise<void> {
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select({ saleDate: sales.saleDate }).from(sales),
  );
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.saleDate, (counts.get(row.saleDate) ?? 0) + 1);
  }
  console.log(
    [...counts.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, count]) => `${date}: ${count}`)
      .join("\n"),
  );
}

main();
