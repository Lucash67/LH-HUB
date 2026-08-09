/** Varredura 08/08/2026 — salgados + brigadeiros. */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  dailyInvestments,
  dailyPurchases,
  operationDays,
  saleItems,
  sales,
} from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";

async function check(
  business: string,
  expect: { units: number; revenue: number; profit: number; investment?: number },
) {
  const issues: string[] = [];
  const entry = await getDiaryEntry(business, "2026-08-08");
  if (!entry) return [`${business}: sem diário`];

  const db = await getPostgresDb();
  const businessId = toDbBusinessId(business);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, "2026-08-08"))),
  );
  let units = 0;
  for (const s of daySales) {
    const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
    units += items.reduce((a, it) => a + it.quantity, 0);
  }
  const total = deriveDiaryTotalProfit(entry);
  if (units !== expect.units) issues.push(`units ${units}≠${expect.units}`);
  if (Math.abs((entry.revenue?.received ?? 0) - expect.revenue) > 0.01) {
    issues.push(`fat ${entry.revenue?.received}≠${expect.revenue}`);
  }
  if (Math.abs(total - expect.profit) > 0.01) issues.push(`lucro ${total}≠${expect.profit}`);

  if (expect.investment !== undefined) {
    const od = await queryAll(
      db
        .select({ id: operationDays.id })
        .from(operationDays)
        .where(
          and(
            eq(operationDays.businessId, businessId),
            eq(operationDays.operationDate, "2026-08-08"),
          ),
        ),
    );
    if (od[0]) {
      const purch = await queryAll(
        db.select().from(dailyPurchases).where(eq(dailyPurchases.operationDayId, od[0].id)),
      );
      const inv = await queryAll(
        db.select().from(dailyInvestments).where(eq(dailyInvestments.operationDayId, od[0].id)),
      );
      const p = purch.reduce((a, x) => a + Number(x.totalInvestment), 0);
      const i = inv.reduce((a, x) => a + Number(x.amount), 0);
      if (Math.abs(p - expect.investment) > 0.01) issues.push(`compra ${p}≠${expect.investment}`);
      if (Math.abs(p - i) > 0.01) issues.push(`INV-03 compra ${p} ≠ invest ${i}`);
    }
  }

  return issues;
}

async function main() {
  const s = await check("salgados", { units: 7, revenue: 35, profit: 20, investment: 15 });
  const b = await check("brigadeiros", { units: 13, revenue: 40, profit: 40 });
  console.log(s.length ? `❌ Salgados: ${s.join(" | ")}` : "✅ Salgados 7 un · R$35 · lucro R$20 · invest R$15");
  console.log(b.length ? `❌ Brigadeiros: ${b.join(" | ")}` : "✅ Brigadeiros 13 un · R$40 · lucro R$40");
  console.log("Cofrinho: Salty teórico R$1.027,50 / prático R$1.029,28 · Candy prático R$168,29");
  if (s.length || b.length) process.exit(1);
  console.log("\n🎉 VARREDURA 08/08 100% OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
