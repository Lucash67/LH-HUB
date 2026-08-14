/**
 * Ajuste pós-confirmação do Lucas:
 * - Quitação do Anderson (fiado 11/08 pago no 12) vai para o 11/08
 * - 12/08 fica com 2 perdas (sem “Recuperação roubo”)
 * - Claudia no 13 já está como 1 (ok)
 *
 * Uso: pnpm tsx scripts/patch-anderson-quitacao-1108.ts
 */
import "./load-env";
import { and, desc, eq } from "drizzle-orm";
import { executeSaleOperation } from "../src/domains/sales/sale-operation-handler";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  cashFlowEvents,
  products,
  saleItems,
  sales,
  stockMovements,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { createClient, listClientsRaw } from "../src/platform/db/repositories/client-repository";

const BUSINESS = "salgados";
const D11 = "2026-08-11";
const D12 = "2026-08-12";
const RECOVERY_SALE_ID = "c827f26d-b6c3-4650-abd8-a2f1be456ffc";

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function recalcProductStock(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;
  const db = await getPostgresDb();
  for (const productId of productIds) {
    const last = await queryAll(
      db
        .select({ balanceAfter: stockMovements.balanceAfter })
        .from(stockMovements)
        .where(eq(stockMovements.productId, productId))
        .orderBy(desc(stockMovements.createdAt))
        .limit(1),
    );
    const balance = last[0]?.balanceAfter ?? 0;
    await queryRun(
      db
        .update(products)
        .set({ stockQuantity: balance, updatedAt: new Date() })
        .where(eq(products.id, productId)),
    );
  }
}

async function main() {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  // 1) Remove venda artificial “Recuperação roubo” do 12/08
  const recovery = await queryAll(db.select().from(sales).where(eq(sales.id, RECOVERY_SALE_ID)));
  if (recovery[0]) {
    const movements = await queryAll(
      db.select({ productId: stockMovements.productId }).from(stockMovements).where(eq(stockMovements.saleId, RECOVERY_SALE_ID)),
    );
    const productIds = [...new Set(movements.map((m) => m.productId))];
    await queryRun(db.delete(cashFlowEvents).where(eq(cashFlowEvents.saleId, RECOVERY_SALE_ID)));
    await queryRun(db.delete(stockMovements).where(eq(stockMovements.saleId, RECOVERY_SALE_ID)));
    await queryRun(db.delete(saleItems).where(eq(saleItems.saleId, RECOVERY_SALE_ID)));
    await queryRun(db.delete(sales).where(eq(sales.id, RECOVERY_SALE_ID)));
    await recalcProductStock(productIds);
    console.log("✓ Removida venda 'Recuperação roubo' do 12/08");
  } else {
    console.log("· Venda recuperação já ausente");
  }

  // 2) Garante cliente Anderson
  const allClients = await listClientsRaw();
  let anderson = allClients.find((c) => {
    const n = norm(c.name);
    return n.includes("anderson") && n.includes("chagas");
  });
  if (!anderson) {
    anderson = await createClient({
      name: "Francisco Anderson das Chagas",
      sector: "Acal",
      notes: "Quitou fiado/roubo do 11/08 no dia 12.",
    });
    console.log("✓ Cliente Anderson criado");
  } else {
    console.log(`· Cliente Anderson: ${anderson.name}`);
  }

  // 3) Evita duplicar a quitação no 11 se já rodamos o patch
  const day11Sales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D11))),
  );
  const already = day11Sales.find((s) =>
    (s.notes ?? "").toLowerCase().includes("quitação anderson") ||
    (s.notes ?? "").toLowerCase().includes("quitacao anderson"),
  );
  if (already) {
    console.log("· Quitação Anderson já existe no 11/08");
  } else {
    const prods = await queryAll(
      db.select().from(products).where(eq(products.businessId, businessId)),
    );
    const unknown =
      prods.find((p) => p.name === UNIDENTIFIED_FLAVOR_PRODUCT_NAME) ?? prods[0];
    if (!unknown) throw new Error("Sem produto para a quitação");

    const result = await executeSaleOperation({
      productId: unknown.id,
      quantity: 1,
      clientId: anderson.id,
      paymentMethod: "pix",
      paymentStatus: "paid",
      date: D11,
      time: "17:00",
      department: "Acal",
      notes:
        "Quitação Anderson das Chagas — fiado/roubo do 11/08 pago em 12/08; fat. permanece no 11/08.",
      unitPrice: 5,
      unitCost: 1.5, // custo próprio do dia (R$30 / 20 un)
    });
    console.log(`✓ Quitação Anderson no 11/08 · sale ${result.saleId}`);
  }

  // 4) Diário 11/08: 19 vendidos · 1 perda · fat 95 · lucro 65
  const e11 = await getDiaryEntry(BUSINESS, D11);
  if (!e11) throw new Error("Diário 11/08 ausente");
  await upsertDiaryEntry({
    ...e11,
    profit: 65,
    quantitySold: 19,
    quantityLost: 1,
    lossReason:
      "1 salgado perdido (roubo/fiado sem autorização). O outro foi quitado por Anderson das Chagas em 12/08.",
    revenue: { received: 95, pending: 0, total: 95 },
    sales: { paidCount: 19, creditCount: 0, fatherSale: e11.sales?.fatherSale },
    observations: [
      e11.observations,
      "",
      "—— Ajuste 14/08 ——",
      "Anderson das Chagas quitou em 12/08 1 un do 11/08 (fiado/roubo). Conta no 11: fat R$95 · lucro R$65 · 1 perda restante.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "Quitação Anderson atualiza o 11/08. Estagiário loiro do 13/08 continua como perda até pagar.",
  });
  console.log("✓ Diário 11/08 → fat R$95 · lucro R$65 · sold 19 · lost 1");

  // 5) Diário 12/08: 28 vendidos · 2 perdas · fat 140 · lucro 53
  const e12 = await getDiaryEntry(BUSINESS, D12);
  if (!e12) throw new Error("Diário 12/08 ausente");
  await upsertDiaryEntry({
    ...e12,
    profit: 53,
    quantitySold: 28,
    quantityLost: 2,
    lossReason: "2 roubos no dia (sem quitação neste dia). Anderson quitou fiado do 11, não destes.",
    revenue: { received: 140, pending: 0, total: 140 },
    sales: {
      paidCount: 28,
      creditCount: 0,
      fatherSale: { units: 12, amount: 60, buyerName: "Colegas do Henrique" },
    },
    observations: [
      "Encomenda 30 un = R$87 (100% próprio).",
      "Henrique 12 un · 100% vendidos R$60.",
      "Unifor/Acal: 16 un na lista + 2 perdas = 18.",
      "Fat. R$140 (28×5) · lucro R$53. Quitação Anderson é do 11/08 (não entra no fat. do 12).",
      "Rascunho citava fat R$145 / lucro R$58 contando a quitação no caixa do 12 — no sistema a quitação fica no 11.",
      "Cofrinho teórico pós-12: R$1.208,50 (= 1.150,50 + 65 + 53, com 11 ajustado).",
    ].join("\n"),
    manualInsights:
      "Claudia no 13 confirmada como 1 un. Estagiário loiro: perda até avisar pagamento.",
  });
  console.log("✓ Diário 12/08 → fat R$140 · lucro R$53 · sold 28 · lost 2");

  const a11 = await getDiaryEntry(BUSINESS, D11);
  const a12 = await getDiaryEntry(BUSINESS, D12);
  const a13 = await getDiaryEntry(BUSINESS, "2026-08-13");
  console.log("\n======== CONFERÊNCIA ========");
  console.log(`11: fat ${a11?.revenue?.received} · lucro ${a11?.profit} · sold ${a11?.quantitySold} · lost ${a11?.quantityLost}`);
  console.log(`12: fat ${a12?.revenue?.received} · lucro ${a12?.profit} · sold ${a12?.quantitySold} · lost ${a12?.quantityLost}`);
  console.log(`13: fat ${a13?.revenue?.received} · lucro ${a13?.profit} · sold ${a13?.quantitySold} · lost ${a13?.quantityLost}`);
  const cof =
    1150.5 -
    60 +
    Number(a11?.profit ?? 0) +
    Number(a12?.profit ?? 0) +
    Number(a13?.profit ?? 0);
  console.log(`Cofrinho teórico (11→13): R$${cof.toFixed(2)} (esperado R$1263.50)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
