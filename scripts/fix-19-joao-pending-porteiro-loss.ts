/**
 * Corrige 19/08 conforme Lucas:
 * - João Victor: PENDENTE (ainda cobrar) — não entra no fat recebido
 * - Porteiro: PERDA proposital (brinde) — não é venda
 * - Resultado: fat R$113,50 · pend R$5 · sold 24 · lost 1
 *
 * Uso: CONFIRM_FIX_19B=1 pnpm tsx scripts/fix-19-joao-pending-porteiro-loss.ts
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  cashFlowEvents,
  clients,
  saleItems,
  sales,
  stockMovements,
  stickyNotes,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { desc } from "drizzle-orm";
import { products } from "../src/lib/db/postgres/schema";

const BUSINESS = "salgados";
const D19 = "2026-08-19";

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
    await queryRun(
      db
        .update(products)
        .set({ stockQuantity: last[0]?.balanceAfter ?? 0, updatedAt: new Date() })
        .where(eq(products.id, productId)),
    );
  }
}

async function deleteSale(saleId: string): Promise<void> {
  const db = await getPostgresDb();
  const movements = await queryAll(
    db
      .select({ productId: stockMovements.productId })
      .from(stockMovements)
      .where(eq(stockMovements.saleId, saleId)),
  );
  const productIds = [...new Set(movements.map((m) => m.productId))];
  await queryRun(db.delete(cashFlowEvents).where(eq(cashFlowEvents.saleId, saleId)));
  await queryRun(db.delete(stockMovements).where(eq(stockMovements.saleId, saleId)));
  await queryRun(db.delete(saleItems).where(eq(saleItems.saleId, saleId)));
  await queryRun(db.delete(sales).where(eq(sales.id, saleId)));
  await recalcProductStock(productIds);
}

async function main() {
  if (process.env.CONFIRM_FIX_19B !== "1") {
    console.error("Abortado: CONFIRM_FIX_19B=1");
    process.exit(1);
  }

  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D19))),
  );
  const allClients = await queryAll(db.select().from(clients));
  const nameById = new Map(allClients.map((c) => [c.id, c.name]));

  let joao = daySales.find((s) => {
    const n = norm(s.notes ?? "");
    const c = norm(nameById.get(s.clientId ?? "") ?? "");
    return n.includes("joao victor") || c.includes("joao victor");
  });
  let porteiro = daySales.find((s) => {
    const n = norm(s.notes ?? "");
    const c = norm(nameById.get(s.clientId ?? "") ?? "");
    return n.includes("porteiro") || c.includes("porteiro") || n.includes("cortesia");
  });

  // João Victor → pending (ainda cobrar)
  if (joao) {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "pending",
          amountReceived: "0.00",
          totalAmount: "5.00",
          settlementDate: null,
          notes:
            "João Victor (Unifor) — ainda a cobrar. Costuma pagar; às vezes esquece. Pendente no 19/08.",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, joao.id)),
    );
    console.log("✓ João Victor → pending R$5 (a cobrar)");
  } else {
    console.warn("⚠ João Victor não encontrado");
  }

  // Porteiro: remover venda (vira perda no diário, não ticket)
  if (porteiro) {
    await deleteSale(porteiro.id);
    console.log("✓ Venda porteiro removida (conta como perda proposital no diário)");
  } else {
    console.log("· Sem venda porteiro (ok se já era só perda)");
  }

  const entry = await getDiaryEntry(BUSINESS, D19);
  if (!entry) throw new Error("Diário 19 ausente");

  const received = 113.5; // sem João Victor
  const pending = 5; // João Victor
  await upsertDiaryEntry({
    ...entry,
    profit: received, // custo próprio 0
    quantitySold: 24, // 23 pagos + 1 João pending
    quantityLost: 1,
    lossReason:
      "1 Pão de Queijo de brinde ao porteiro (proposital — redenção por plástico em salgado anterior). Conta como perda, porém intencional.",
    revenue: {
      received,
      pending,
      total: received + pending,
    },
    sales: {
      paidCount: 23,
      creditCount: 1, // João Victor
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      "FECHAMENTO 19/08 (ajustado 22/08).",
      "Encomenda 25 un · próprio R$0 · terceiros R$87,50.",
      "23 pagos (inclui quits Ana/Mikely/Paulo) + João Victor 1 pendente + porteiro 1 perda proposital = 25.",
      `Fat recebido R$${received} · pend João Victor R$${pending} · lucro R$${received}.`,
      "Porteiro: perda intencional (brinde). João Victor: ainda cobrar.",
    ].join("\n"),
    manualInsights:
      "João Victor pendente R$5. Porteiro = perda proposital (não cortesia zerada).",
  });
  console.log(
    `✓ Diário 19 → fat R$${received} · pend R$${pending} · lucro R$${received} · sold 24 · lost 1`,
  );

  // Atualiza nota 19 se existir
  const notes = await queryAll(
    db.select().from(stickyNotes).where(and(eq(stickyNotes.noteDate, D19), eq(stickyNotes.archived, false))),
  );
  for (const note of notes) {
    let body = note.body ?? "";
    const footer = [

      "",
      "—— Sistema (ajustado) ——",
      "24 vendas (23 pagas + João Victor pendente R$5) · 1 perda proposital (porteiro/brinde).",
      "Fat recebido R$113,50 · pend R$5 · lucro R$113,50.",
    ].join("\n");
    if (!body.includes("João Victor pendente")) {
      body = `${body.trim()}\n${footer}`;
    }
    await queryRun(
      db
        .update(stickyNotes)
        .set({
          title: note.title.includes("FECHADO") ? note.title : "Salgados — 19/08 FECHADO ✓",
          body,
          updatedAt: new Date(),
          clientUpdatedAt: new Date(),
        })
        .where(eq(stickyNotes.id, note.id)),
    );
    console.log("✓ Nota 19 atualizada");
  }

  const after = await getDiaryEntry(BUSINESS, D19);
  console.log("\nCONFERÊNCIA:", {
    fat: after?.revenue?.received,
    pend: after?.revenue?.pending,
    lucro: after?.profit,
    sold: after?.quantitySold,
    lost: after?.quantityLost,
    lossReason: after?.lossReason,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
