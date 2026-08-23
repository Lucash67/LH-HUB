/**
 * 22/08 — limpeza de pendências + PIX Jonas:
 * 1) Jackson 03/08 (já pago em 04/08) → paid; diário 03/08 pend=0
 * 2) Jonas Ferreira — 1 un "cega" do 20/08 era fiado; PIX R$5 em 22/08
 *    → venda no 20/08, settlement 22/08; diário 20: sold 25, lost 1, fat+5, lucro+5
 * 3) Saldo prático do cofrinho → R$1.641,95 (extrato + PIX de hoje)
 *
 * Uso: set CONFIRM_SETTLE_JJ=1 && pnpm tsx scripts/settle-jackson-jonas-2208.ts
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { setPracticalProfitBankBalance } from "../src/lib/profit-bank-service";
import { sales, saleItems } from "../src/lib/db/postgres/schema";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { queryOne, queryRun } from "../src/platform/db/query";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { ensureOperationDayId } from "../src/platform/db/repositories/operation-day-repository";

const BUSINESS = "salgados";
const JACKSON_SALE_ID = "6d4e6ff9-d7aa-4d5d-a6d2-95cb7c4258ad";
const JONAS_CLIENT_ID = "d79e8a37-d8d9-4379-be3e-53aeac9a0939";
const PRODUCT_ID = "4da6e5b2-86ad-4f3e-8e71-9492f43f8291";
const TODAY = "2026-08-22";
const DAY20 = "2026-08-20";
const PRACTICAL = 1641.95;

async function settleJackson(db: Awaited<ReturnType<typeof getPostgresDb>>) {
  const sale = await queryOne(db.select().from(sales).where(eq(sales.id, JACKSON_SALE_ID)));
  if (!sale) throw new Error("Venda Jackson 03/08 não encontrada");

  if (sale.paymentStatus !== "paid") {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: "2026-08-04",
          notes:
            "Fiado 03/08 — quitação no dia 04/08 (não era perda). Marcado pago em 22/08 (caixa já no 04/08).",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, JACKSON_SALE_ID)),
    );
    console.log("✓ Jackson 03/08 → paid · settlement 04/08");
  } else {
    console.log("· Jackson já estava paid");
  }

  const entry = await getDiaryEntry(BUSINESS, "2026-08-03");
  if (!entry) throw new Error("Diário 03/08 ausente");

  // Caixa da quitação já entrou no 04/08; só zera pendência aberta no diário.
  await upsertDiaryEntry({
    ...entry,
    revenue: {
      received: entry.revenue.received,
      pending: 0,
      total: entry.revenue.received,
    },
    sales: {
      paidCount: entry.sales?.paidCount ?? entry.quantitySold,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations:
      (entry.observations ?? "") +
      "\n[22/08] Pendência Jackson R$5 encerrada — quitação já estava no caixa de 04/08.",
  });
  console.log("✓ Diário 03/08 · pending 0");
}

async function settleJonas(db: Awaited<ReturnType<typeof getPostgresDb>>) {
  const businessUuid = toDbBusinessId(BUSINESS);
  const operationDayId = await ensureOperationDayId(BUSINESS, DAY20);

  const allJonas = await db.select().from(sales).where(eq(sales.clientId, JONAS_CLIENT_ID));
  const already = allJonas.find(
    (s) => s.saleDate === DAY20 && (s.notes ?? "").includes("cega do 20/08"),
  );
  if (already) {
    console.log(`· Jonas 20/08 já lançado (${already.id})`);
  } else {
    const saleId = randomUUID();
    const unitCost = "1.54";
    const unitPrice = "5.00";
    const profit = "3.46";

    await queryRun(
      db.insert(sales).values({
        id: saleId,
        businessId: businessUuid,
        operationDayId,
        clientId: JONAS_CLIENT_ID,
        saleDate: DAY20,
        saleTime: "12:00:00",
        department: "ACAL",
        paymentMethod: "pix",
        paymentStatus: "paid",
        amountReceived: "5.00",
        settlementDate: TODAY,
        totalAmount: "5.00",
        totalCost: unitCost,
        profit,
        notes:
          "Era 1 un cega/perda do 20/08 — identificada como fiado Jonas Ferreira. PIX R$5 em 22/08. Fat permanece no 20/08.",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await queryRun(
      db.insert(saleItems).values({
        id: randomUUID(),
        saleId,
        productId: PRODUCT_ID,
        quantity: 1,
        unitPrice,
        unitCost,
        subtotal: "5.00",
        profit,
        flavorConfidence: "unknown",
      }),
    );
    console.log(`✓ Jonas 20/08 venda ${saleId} · paid · settlement ${TODAY}`);
  }

  const entry = await getDiaryEntry(BUSINESS, DAY20);
  if (!entry) throw new Error("Diário 20/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    revenue: {
      received: 124,
      pending: 0,
      total: 124,
    },
    profit: 84,
    quantitySold: 25,
    quantityLost: 1,
    sales: {
      paidCount: 25,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations:
      "FECHAMENTO 20/08 (ajustado 22/08 — Jonas Ferreira).\n" +
      "Encomenda 26 un = R$91 (próprio R$40 + terceiros R$51).\n" +
      "Fat dia R$124 · lucro R$84 (= 124 − 40).\n" +
      "25 vendidos · 1 perda cega restante.\n" +
      "Jonas Ferreira: 1 un que era cega → fiado, PIX R$5 em 22/08.\n" +
      "Henrique Alberto 6 = lote trabalho (não duplicar).",
    manualInsights:
      "Jonas Ferreira quitou R$5 em 22/08 (fiado/cego do 20). Resta 1 perda cega. Mikely do 21 segue pendente.",
  });
  console.log("✓ Diário 20/08 · fat 124 · lucro 84 · sold 25 · lost 1");
}

async function main() {
  if (process.env.CONFIRM_SETTLE_JJ !== "1") {
    console.error("Defina CONFIRM_SETTLE_JJ=1 para executar.");
    process.exit(1);
  }

  const db = await getPostgresDb();
  await settleJackson(db);
  await settleJonas(db);
  await setPracticalProfitBankBalance(BUSINESS, PRACTICAL);
  console.log(`✓ Cofrinho prático → R$ ${PRACTICAL.toFixed(2)}`);

  const d03 = await getDiaryEntry(BUSINESS, "2026-08-03");
  const d20 = await getDiaryEntry(BUSINESS, DAY20);
  const d21 = await getDiaryEntry(BUSINESS, "2026-08-21");
  console.log("======== RESUMO ========");
  console.log({
    "03/08 pending": d03?.revenue.pending,
    "20/08": {
      received: d20?.revenue.received,
      pending: d20?.revenue.pending,
      profit: d20?.profit,
      sold: d20?.quantitySold,
      lost: d20?.quantityLost,
    },
    "21/08 pending (Mikely)": d21?.revenue.pending,
    practical: PRACTICAL,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
