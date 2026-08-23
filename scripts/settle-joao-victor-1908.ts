/**
 * Quitação João Victor — fiado 19/08 pago em 22/08.
 * Fat/lucro permanecem no dia da venda (19/08).
 *
 * Uso: set CONFIRM_SETTLE_JV=1 && pnpm tsx scripts/settle-joao-victor-1908.ts
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { sales } from "../src/lib/db/postgres/schema";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { queryOne, queryRun } from "../src/platform/db/query";

const BUSINESS = "salgados";
const SALE_DATE = "2026-08-19";
const SETTLEMENT_DATE = "2026-08-22";
const SALE_ID = "1a7ff80e-88ca-4bbb-83c6-6f08369d03e8";
const AMOUNT = "5.00";

async function main() {
  if (process.env.CONFIRM_SETTLE_JV !== "1") {
    console.error("Defina CONFIRM_SETTLE_JV=1 para executar.");
    process.exit(1);
  }

  const db = await getPostgresDb();
  const sale = await queryOne(db.select().from(sales).where(eq(sales.id, SALE_ID)));
  if (!sale) throw new Error(`Venda ${SALE_ID} não encontrada`);
  if (sale.saleDate !== SALE_DATE) {
    throw new Error(`Venda não é do ${SALE_DATE} (é ${sale.saleDate})`);
  }

  if (sale.paymentStatus === "paid" && Number(sale.amountReceived) >= 5) {
    console.log("João Victor já estava quitado — só alinhando diário se precisar.");
  } else {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: AMOUNT,
          settlementDate: SETTLEMENT_DATE,
          notes:
            "João Victor (Unifor) — fiado 19/08 quitado em 22/08. Faturamento permanece no 19/08.",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, SALE_ID)),
    );
    console.log(`✓ Venda ${SALE_ID} → paid R$5 · settlement ${SETTLEMENT_DATE}`);
  }

  const entry = await getDiaryEntry(BUSINESS, SALE_DATE);
  if (!entry) throw new Error(`Diário ${SALE_DATE} ausente`);

  await upsertDiaryEntry({
    ...entry,
    revenue: {
      received: 118.5,
      pending: 0,
      total: 118.5,
    },
    profit: 118.5,
    quantitySold: 24,
    quantityLost: 1,
    sales: {
      paidCount: 24,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations:
      "FECHAMENTO 19/08 (ajustado 22/08 — João Victor quitou).\n" +
      "Encomenda 25 un · próprio R$0 · terceiros R$87,50.\n" +
      "24 pagos (inclui quits Ana/Mikely/Paulo + João Victor) + porteiro 1 perda proposital = 25.\n" +
      "Fat recebido R$118,50 · pend 0 · lucro R$118,50.\n" +
      "Porteiro: perda intencional (brinde). João Victor: quitado em 22/08.",
    manualInsights:
      "João Victor quitou R$5 em 22/08 (fiado do 19). Porteiro = perda proposital.",
  });

  const check = await getDiaryEntry(BUSINESS, SALE_DATE);
  console.log("======== DIÁRIO 19/08 ========");
  console.log({
    received: check?.revenue.received,
    pending: check?.revenue.pending,
    total: check?.revenue.total,
    profit: check?.profit,
    sold: check?.quantitySold,
    lost: check?.quantityLost,
  });
  console.log("✓ João Victor quitado");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
