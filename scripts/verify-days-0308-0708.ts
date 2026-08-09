/**
 * Varredura independente 03–07/08/2026.
 * Uso: pnpm tsx scripts/verify-days-0308-0708.ts
 */
import "./load-env";
import { and, eq, inArray } from "drizzle-orm";
import { getDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  clients,
  dailyInvestments,
  dailyPurchases,
  operationDays,
  products,
  saleItems,
  sales,
} from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";

const BUSINESS = "salgados";

const EXPECTED = [
  {
    date: "2026-08-03",
    units: 19,
    paid: 18,
    pending: 1,
    lost: 1,
    revenue: 90,
    profit: 55,
    bonus: 0,
    total: 55,
    depts: ["Acal", "Colegas do Henrique"],
  },
  {
    date: "2026-08-04",
    units: 18,
    paid: 18,
    pending: 0,
    lost: 0,
    revenue: 90,
    profit: 60,
    bonus: 19,
    total: 79,
    depts: ["Acal", "Unifor"],
  },
  {
    date: "2026-08-05",
    units: 14,
    paid: 14,
    pending: 0,
    lost: 1,
    revenue: 70,
    profit: 17.5,
    bonus: 15,
    total: 32.5,
    depts: ["Acal", "Unifor"],
  },
  {
    date: "2026-08-06",
    units: 18,
    paid: 18,
    pending: 0,
    lost: 0,
    revenue: 90,
    profit: 27,
    bonus: 30,
    total: 57,
    depts: ["Acal"],
  },
  {
    date: "2026-08-07",
    units: 24,
    paid: 24,
    pending: 0,
    lost: 0,
    revenue: 120,
    profit: 120,
    bonus: 0,
    total: 120,
    depts: ["Acal", "Colegas do Henrique"],
  },
] as const;

async function main() {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  let failures = 0;
  let cof = 664;

  console.log("=== VARREDURA 03–07/08/2026 ===\n");

  for (const exp of EXPECTED) {
    const issues: string[] = [];
    const entry = await getDiaryEntry(BUSINESS, exp.date);
    if (!entry) {
      console.log(`❌ ${exp.date}: sem diário`);
      failures += 1;
      continue;
    }

    const daySales = await queryAll(
      db
        .select()
        .from(sales)
        .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, exp.date))),
    );

    let units = 0;
    let paidUnits = 0;
    let pendingUnits = 0;
    const deptSet = new Set<string>();
    const productNames = new Set<string>();

    for (const s of daySales) {
      const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
      const qty = items.reduce((a, it) => a + it.quantity, 0);
      units += qty;
      if (s.paymentStatus === "paid") paidUnits += qty;
      else pendingUnits += qty;
      if (s.department) deptSet.add(s.department);
      for (const it of items) {
        const prod = await queryAll(db.select().from(products).where(eq(products.id, it.productId)));
        if (prod[0]?.name) productNames.add(prod[0].name);
      }
    }

    const total = deriveDiaryTotalProfit(entry);
    cof = Math.round((cof + total) * 100) / 100;

    if (units !== exp.units) issues.push(`unidades ${units}≠${exp.units}`);
    if (paidUnits !== exp.paid) issues.push(`pagas ${paidUnits}≠${exp.paid}`);
    if (pendingUnits !== exp.pending) issues.push(`pendentes ${pendingUnits}≠${exp.pending}`);
    if ((entry.quantityLost ?? 0) !== exp.lost) issues.push(`perda diary ${entry.quantityLost}≠${exp.lost}`);
    if (Math.abs((entry.revenue?.received ?? 0) - exp.revenue) > 0.01) {
      issues.push(`fat ${entry.revenue?.received}≠${exp.revenue}`);
    }
    if (Math.abs((entry.profit ?? 0) - exp.profit) > 0.01) issues.push(`profit ${entry.profit}≠${exp.profit}`);
    if (Math.abs((entry.bonusIncome ?? 0) - exp.bonus) > 0.01) {
      issues.push(`bonus ${entry.bonusIncome}≠${exp.bonus}`);
    }
    if (Math.abs(total - exp.total) > 0.01) issues.push(`total ${total}≠${exp.total}`);

    for (const d of exp.depts) {
      if (![...deptSet].some((x) => x.toLowerCase() === d.toLowerCase())) {
        issues.push(`dept ausente: ${d} (tem: ${[...deptSet].join(", ")})`);
      }
    }

    // Investimentos = compra
    const od = await queryAll(
      db
        .select({ id: operationDays.id })
        .from(operationDays)
        .where(
          and(eq(operationDays.businessId, businessId), eq(operationDays.operationDate, exp.date)),
        ),
    );
    if (od[0]) {
      const purch = await queryAll(
        db.select().from(dailyPurchases).where(eq(dailyPurchases.operationDayId, od[0].id)),
      );
      const inv = await queryAll(
        db.select().from(dailyInvestments).where(eq(dailyInvestments.operationDayId, od[0].id)),
      );
      const purchTotal = purch.reduce((a, p) => a + Number(p.totalInvestment), 0);
      const invTotal = inv.reduce((a, i) => a + Number(i.amount), 0);
      if (Math.abs(purchTotal - invTotal) > 0.01) {
        issues.push(`INV-03 compra ${purchTotal} ≠ invest ${invTotal}`);
      }
    }

    // Preço unitário R$5 nas vendas pagas
    for (const s of daySales.filter((x) => x.paymentStatus === "paid")) {
      const amt = Number(s.totalAmount);
      const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
      const qty = items.reduce((a, it) => a + it.quantity, 0);
      if (qty > 0 && Math.abs(amt / qty - 5) > 0.01) {
        issues.push(`preço ticket ${s.id.slice(0, 8)}= ${amt / qty}`);
        break;
      }
    }

    if (issues.length) {
      failures += 1;
      console.log(`❌ ${exp.date}`);
      for (const i of issues) console.log(`   - ${i}`);
    } else {
      console.log(
        `✅ ${exp.date} · ${units} un · fat R$${exp.revenue} · lucro R$${total} · depts [${[...deptSet].join(", ")}]`,
      );
      console.log(`   produtos: ${[...productNames].join(" · ")}`);
    }
  }

  const cofOk = Math.abs(cof - 1007.5) < 0.01;
  console.log(`\nCofrinho fim 07/08: R$${cof.toFixed(2)} ${cofOk ? "✅" : "❌ esperado 1007.50"}`);
  if (!cofOk) failures += 1;

  // Jackson quitação presente no 04
  const jackson = await queryAll(
    db.select().from(clients).where(eq(clients.name, "Jackson Mendes Pinheiro")),
  );
  if (jackson[0]) {
    const jSales = await queryAll(
      db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.clientId, jackson[0].id),
            inArray(sales.saleDate, ["2026-08-03", "2026-08-04"]),
          ),
        ),
    );
    const hasPending03 = jSales.some((s) => s.saleDate === "2026-08-03" && s.paymentStatus === "pending");
    const hasPaid04 = jSales.some(
      (s) => s.saleDate === "2026-08-04" && s.paymentStatus === "paid" && (s.notes ?? "").toLowerCase().includes("quit"),
    );
    console.log(
      `Jackson: fiado 03=${hasPending03 ? "✅" : "❌"} · quitação 04=${hasPaid04 ? "✅" : "❌"}`,
    );
    if (!hasPending03 || !hasPaid04) failures += 1;
  } else {
    console.log("Jackson: ❌ cliente não encontrado");
    failures += 1;
  }

  console.log(failures === 0 ? "\n🎉 VARREDURA 100% OK" : `\n💥 ${failures} falha(s)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
