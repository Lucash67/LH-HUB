/**
 * Registra 08/08/2026 — Salgados (cota pai) + Brigadeiros (lote amiga da mãe).
 * Uso: pnpm tsx scripts/register-day-0808.ts
 */
import "./load-env";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit, type OperationalDiaryEntry } from "../src/lib/diary/types";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { executeSaleOperation } from "../src/domains/sales/sale-operation-handler";
import { createClient, listClientsRaw } from "../src/platform/db/repositories/client-repository";
import {
  createProduct,
  listProducts,
} from "../src/platform/db/repositories/product-repository";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { and, eq } from "drizzle-orm";
import { saleItems, sales } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";

const DATE = "2026-08-08";
const DEPT_HENRIQUE = "Colegas do Henrique";

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function sumUnits(businessSlug: string): Promise<number> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(businessSlug);
  const rows = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, DATE))),
  );
  let units = 0;
  for (const s of rows) {
    const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
    units += items.reduce((a, it) => a + it.quantity, 0);
  }
  return units;
}

async function registerSalgados(): Promise<void> {
  console.log("\n======== SALGADOS 08/08 ========");
  const plan: DayRegistrationPlan = {
    businessId: "salgados",
    date: DATE,
    purchase: {
      totalUnits: 7,
      investment: 15,
      ownInvestment: 15,
      products: [{ name: UNIDENTIFIED_FLAVOR_PRODUCT_NAME, quantity: 7 }],
    },
    summary: {
      revenue: 35,
      profit: 20,
      quantitySold: 7,
      quantityLost: 0,
    },
    sales: [
      {
        time: "10:00",
        clientName: "Colegas do Henrique",
        productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
        quantity: 7,
        paymentMethod: "pix",
        paymentStatus: "paid",
        department: DEPT_HENRIQUE,
        notes:
          "7 un levados pelo pai ao trabalho — 100% vendidos. Fat. R$35 · custo próprio R$15 · lucro R$20.",
      },
    ],
    newClients: [
      {
        name: "Colegas do Henrique",
        sector: DEPT_HENRIQUE,
        notes: "Canal trabalho do Henrique — 08/08/2026.",
      },
    ],
    observations: [
      "Sábado — sem operação Acal; somente cota do pai (7 un).",
      "Custo próprio R$15 · faturamento R$35 · lucro R$20.",
      "Cofrinho teórico: R$1.007,50 + R$20 = R$1.027,50 · prático R$1.029,28 (com rendimento).",
    ].join("\n"),
  };

  await cleanupOperationDay("salgados", DATE);
  const existing = await countSalesForDate("salgados", DATE);
  if (existing > 0) throw new Error(`Salgados ainda tem ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  // Não chamar fixDayPricing aqui: em dia 100% próprio ele zera investimentos (INV-03).

  const entry = await getDiaryEntry("salgados", DATE);
  if (!entry) throw new Error("Diário salgados 08/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 20,
    bonusIncome: undefined,
    quantitySold: 7,
    quantityLost: 0,
    revenue: { received: 35, pending: 0, total: 35 },
    sales: {
      paidCount: 7,
      fatherSale: { units: 7, amount: 35, buyerName: "Colegas do Henrique" },
    },
    observations: plan.observations,
    manualInsights: [
      "Lucro salgados R$20 (faturamento R$35 − investimento próprio R$15).",
      "Cofrinho teórico fim do dia: R$1.027,50 · prático R$1.029,28.",
    ].join("\n\n"),
  });

  const final = await getDiaryEntry("salgados", DATE);
  const units = await sumUnits("salgados");
  const total = deriveDiaryTotalProfit({
    profit: final?.profit ?? 0,
    bonusIncome: final?.bonusIncome,
  });
  if (units !== 7) throw new Error(`Salgados units=${units}`);
  if (Math.abs((final?.revenue?.received ?? 0) - 35) > 0.01) throw new Error("Salgados fat");
  if (Math.abs(total - 20) > 0.01) throw new Error(`Salgados lucro=${total}`);
  console.log(`✅ Salgados OK — ${units} un · fat R$35 · lucro R$${total}`);
}

async function resolveBrigadeiroProductId(): Promise<string> {
  const products = await listProducts("brigadeiros");
  const exact = products.find((p) => normalizeName(p.name) === "brigadeiro");
  if (exact) return exact.id;
  const partial = products.find((p) => normalizeName(p.name).includes("brigadeiro"));
  if (partial) return partial.id;
  return createProduct({
    businessId: "brigadeiros",
    name: "Brigadeiro",
    category: "Doces",
    price: round2(40 / 13),
    cost: 0,
    stockQuantity: 0,
    minStock: 0,
    status: "active",
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function registerBrigadeiros(): Promise<void> {
  console.log("\n======== BRIGADEIROS 08/08 ========");
  const units = 13;
  const revenue = 40;
  const profit = 40;
  const unitPrice = round2(revenue / units); // ~3.08
  const unitCost = 0;

  await cleanupOperationDay("brigadeiros", DATE);
  const existing = await countSalesForDate("brigadeiros", DATE);
  if (existing > 0) throw new Error(`Brigadeiros ainda tem ${existing} venda(s) após cleanup`);

  const clients = await listClientsRaw();
  const clientName = "Amiga da mãe";
  let clientId = clients.find((c) => normalizeName(c.name) === normalizeName(clientName))?.id;
  if (!clientId) {
    clientId = await createClient({
      businessId: "brigadeiros",
      name: clientName,
      sector: "Pessoal",
      notes: "Comprou lote de 13 brigadeiros em 08/08/2026 por R$40.",
    });
  }

  const productId = await resolveBrigadeiroProductId();
  const sale = await executeSaleOperation({
    productId,
    quantity: units,
    clientId,
    paymentMethod: "pix",
    paymentStatus: "paid",
    date: DATE,
    time: "10:00",
    department: "Pessoal",
    notes:
      "Lote 13 un vendido à amiga da mãe por R$40 — sem custo próprio · lucro R$40. Retomada da operação Candy.",
    unitPrice,
    unitCost,
  });
  console.log(`Venda: ${sale.saleId} · ${units} un × R$${unitPrice}`);

  // Ajusta totais da venda para fechar exatamente R$40 (arredondamento 13×3,08).
  const db = await getPostgresDb();
  const businessId = toDbBusinessId("brigadeiros");
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, DATE))),
  );
  if (daySales.length !== 1) throw new Error(`Esperava 1 venda, veio ${daySales.length}`);
  const s = daySales[0]!;
  const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
  if (items.length !== 1) throw new Error("Esperava 1 item");

  // Se 13 * unitPrice !== 40, corrige para total exato.
  const { queryRun } = await import("../src/platform/db/query");
  await queryRun(
    db
      .update(sales)
      .set({
        totalAmount: String(revenue),
        totalCost: "0",
        profit: String(profit),
        amountReceived: String(revenue),
        updatedAt: new Date(),
      })
      .where(eq(sales.id, s.id)),
  );
  await queryRun(
    db
      .update(saleItems)
      .set({
        unitPrice: String(unitPrice),
        unitCost: "0",
        subtotal: String(revenue),
        profit: String(profit),
      })
      .where(eq(saleItems.id, items[0]!.id)),
  );

  const diary: OperationalDiaryEntry = {
    version: 1,
    businessId: "brigadeiros",
    date: DATE,
    purchase: {
      totalUnits: units,
      investment: 0,
      products: [{ name: "Brigadeiro", quantity: units }],
    },
    sales: { paidCount: units },
    revenue: { received: revenue, pending: 0, total: revenue },
    profit,
    quantitySold: units,
    quantityLost: 0,
    observations: [
      "Retomada da operação Candy após pausa.",
      "13 brigadeiros vendidos à amiga da mãe por R$40 — sem custo próprio.",
      "Lucro do dia R$40. Cofrinho prático R$168,29 (com rendimento).",
    ].join("\n"),
    manualInsights: "Lote fechado sem custo · lucro = faturamento R$40.",
    lessonsLearned: "Volta dos brigadeiros com venda fechada em lote — bom para recomeçar sem complexidade.",
    tags: ["candy", "lote", "retomada"],
  };

  await upsertDiaryEntry(diary);

  const final = await getDiaryEntry("brigadeiros", DATE);
  const soldUnits = await sumUnits("brigadeiros");
  const total = deriveDiaryTotalProfit({
    profit: final?.profit ?? 0,
    bonusIncome: final?.bonusIncome,
  });
  if (soldUnits !== 13) throw new Error(`Brigadeiros units=${soldUnits}`);
  if (Math.abs((final?.revenue?.received ?? 0) - 40) > 0.01) throw new Error("Brigadeiros fat");
  if (Math.abs(total - 40) > 0.01) throw new Error(`Brigadeiros lucro=${total}`);
  console.log(`✅ Brigadeiros OK — ${soldUnits} un · fat R$40 · lucro R$${total}`);
}

async function main(): Promise<void> {
  await registerSalgados();
  await registerBrigadeiros();

  console.log("\n======== RESUMO 08/08 ========");
  console.log("Salgados:     +R$20  → cofrinho teórico R$1.027,50 · prático R$1.029,28");
  console.log("Brigadeiros:  +R$40  → cofrinho prático R$168,29");
  console.log("\n🎉 08/08 registrado e verificado nas duas operações.");
  process.exit(0);
}

main().catch((error) => {
  console.error("\n💥 Falha:", error);
  process.exit(1);
});
