/**
 * Registra 06/10/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-day-0610.ts
 *
 * Compra 45 un · R$140 (sem terceiros). 44 vendidas + 1 perda.
 * Lista de vendas ainda não veio: vendas agrupadas por canal (refazer quando chegar).
 *   Unifor 10 · Acal 16 pagas + JV 1 fiado · Henrique 18 (bonificação R$90).
 * Recebido R$205 = R$130 do dia + quitação Ana Laura R$75.
 * Lucro final R$120 = R$30 operacional + R$90 bônus (205 + 90 − 175).
 * Meu custo R$175: R$140 da compra + R$35 devolvendo terceiros dos dias anteriores.
 * Cofrinho prático → R$4.003,16.
 */
import "./load-env";
import { and, eq, ilike, inArray } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { setPracticalProfitBankBalance } from "../src/lib/profit-bank-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { clients, sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const BUSINESS = "salgados";
const DATE = "2026-10-06";
const PRACTICAL = 4003.16;
const UNKNOWN = `Cliente Não Identificado (${DATE})`;
const HENRIQUE = "Henrique Alberto Matos Da Rocha";
const JV = "João Victor dos Santos Carvalho";

const PROFIT = 30;
const BONUS = 90;
const RECEIVED = 205;
const PENDING = 5;
const SOLD = 44;
const LOST = 1;

function sale(partial: Partial<DraftSale> & Pick<DraftSale, "time" | "clientName" | "quantity" | "department">): DraftSale {
  return {
    productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
    paymentMethod: "pix",
    paymentStatus: "paid",
    ...partial,
  };
}

/** Ana Laura quitou todos os fiados em 06/10 — caixa entra no dia, faturamento fica nos dias de origem. */
async function settleAnaLaura() {
  const db = await getPostgresDb();
  const rows = await queryAll(
    db
      .select({ id: sales.id, total: sales.totalAmount })
      .from(sales)
      .innerJoin(clients, eq(clients.id, sales.clientId))
      .where(
        and(
          eq(sales.businessId, toDbBusinessId(BUSINESS)),
          inArray(sales.paymentStatus, ["pending", "partial"]),
          ilike(clients.name, "Ana Laura%"),
        ),
      ),
  );
  for (const row of rows) {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: row.total,
          settlementDate: DATE,
          notes: "Fiado quitado em 06/10 por Ana Laura (R$75 no total da nota).",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, row.id)),
    );
  }
  console.log(`✓ Ana Laura: ${rows.length} fiado(s) quitado(s) em 06/10`);
}

async function main() {
  const daySales: DraftSale[] = [
    sale({ time: "10:00", clientName: UNKNOWN, quantity: 10, department: "Unifor", notes: "Vendas Unifor agrupadas — lista ainda não enviada." }),
    sale({ time: "12:00", clientName: UNKNOWN, quantity: 16, department: "Acal", notes: "Vendas Acal agrupadas — lista ainda não enviada." }),
    sale({ time: "17:00", clientName: HENRIQUE, quantity: 18, department: "Henrique", notes: "Comprou 18 un — bonificação R$90 no diário." }),
    sale({ time: "18:00", clientName: JV, quantity: 1, department: "Acal", paymentStatus: "pending", notes: "Fiado 06/10 — R$5." }),
  ];

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 45,
      investment: 140,
      ownInvestment: 140,
      products: [
        { name: "Mistão Frito", quantity: 12 },
        { name: "Queijo Frito", quantity: 8 },
        { name: "Mistão de Forno", quantity: 6 },
        { name: "Frango com Catupiry", quantity: 6 },
        { name: "Coxinha", quantity: 5 },
        { name: "Croissant", quantity: 4 },
        { name: "Carne com Cheddar de Forno", quantity: 4 },
      ],
    },
    summary: { revenue: RECEIVED, profit: PROFIT + BONUS, quantitySold: SOLD, quantityLost: LOST, forecastProfit: 77 },
    sales: daySales,
    newClients: [
      { name: UNKNOWN, sector: "Acal", notes: "Vendas agrupadas de 06/10" },
      { name: HENRIQUE, sector: "Henrique", notes: "Cliente — Henrique" },
      { name: JV, sector: "Acal", notes: "Cliente — Acal" },
    ],
    observations: [
      "Compra 45 un · R$140, sem terceiros. 44 vendidas + 1 perda = 45 (separações somavam 46 — mantido o total da nota).",
      "Unifor 10 · Acal 17 (16 pagas + JV 1 fiado) · Henrique 18 (sobras compradas por ele).",
      "Lista de vendas ainda não enviada — vendas registradas agrupadas por canal.",
      "Recebido R$205 = R$130 do dia + quitação Ana Laura R$75 (no sistema constavam R$60 em fiados dela).",
      "Meu custo R$175 = R$140 da compra + R$35 devolvendo terceiros dos dias anteriores.",
      "Lucro final R$120 = R$30 operacional + R$90 bonificação (Henrique 18 un).",
      "Fiados em aberto: JV R$5 (06/10), Mikelly R$15 (02/10).",
      "Jamile 1 un em espécie, convertido em pix. Troca de R$25 com o Henrique.",
      "Cofrinho prático R$4.003,16 (inclui ~R$2,50 de rendimento).",
    ].join("\n"),
    manualInsights: "Lucro R$120 com quitação da Ana Laura e sobras compradas pelo Henrique.",
    lessonsLearned: "Planejar a venda de sanduíches naturais.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`${DATE}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  const patch = {
    profit: PROFIT,
    bonusIncome: BONUS,
    bonusIncomeDescription: "Henrique comprou 18 salgados (R$90), já dentro do lucro final de R$120.",
    quantitySold: SOLD,
    quantityLost: LOST,
    revenue: { received: RECEIVED, pending: PENDING, total: RECEIVED + PENDING },
  };

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error(`${DATE}: diário ausente`);
  await upsertDiaryEntry({
    ...entry,
    ...patch,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    sales: { paidCount: 43, creditCount: 1 },
  });

  // Sem fixDayPricing: ele infere próprio = recebido − lucro (R$175) > compra (R$140), trata a compra
  // como 100% terceiros e o gatilho INV-03 barra. As vendas já saem a R$5/un do commit.
  const after = await getDiaryEntry(BUSINESS, DATE);
  if (!after) throw new Error(`${DATE}: diário ausente após gravar`);
  if (
    after.profit !== PROFIT ||
    (after.bonusIncome ?? 0) !== BONUS ||
    after.revenue.received !== RECEIVED ||
    after.revenue.pending !== PENDING
  ) {
    await upsertDiaryEntry({ ...after, ...patch });
  }

  const saved = await getDiaryEntry(BUSINESS, DATE);
  const total = saved ? saved.profit + (saved.bonusIncome ?? 0) : NaN;
  if (!saved || total !== PROFIT + BONUS || saved.revenue.received !== RECEIVED) throw new Error(`${DATE}: não fechou`);
  console.log(`✅ ${DATE} OK — lucro final R$${total} · rec R$${RECEIVED} · pend R$${PENDING} · vendidos ${saved.quantitySold} · perdas ${saved.quantityLost}`);

  await settleAnaLaura();
  await setPracticalProfitBankBalance(BUSINESS, PRACTICAL);
  console.log("✓ Cofrinho prático → R$4.003,16");
  console.log("ALL_DAYS_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
