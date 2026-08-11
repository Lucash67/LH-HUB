/**
 * Registra 10/08/2026 — Salgados (Unifor + Acal + Colegas do Henrique).
 * Uso: pnpm tsx scripts/register-day-1008.ts
 *
 * Números oficiais (ledger de vendas + diário alinhados):
 * - Custo próprio R$87 (30 × R$2,90)
 * - Fat. R$150 · recebido R$137,50 · pendente R$12,50 · lucro R$50,50
 * - Cofrinho teórico R$1.078,00 (1.027,50 fim 08/08 + 50,50)
 *
 * Nota: o rascunho citava fat. R$132,50 / lucro R$48,50 / cofrinho R$1.076 —
 * inconsistente com 30×R$5 − R$12,50 pend. (conta correta = R$137,50 / R$50,50).
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-08-10";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  unknown: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
} as const;

function sale(
  partial: Omit<DraftSale, "paymentMethod" | "paymentStatus" | "department"> &
    Partial<Pick<DraftSale, "paymentMethod" | "paymentStatus" | "department">>,
): DraftSale {
  return {
    paymentMethod: "pix",
    paymentStatus: "paid",
    department: DEPT_ACAL,
    ...partial,
  };
}

function clientsFromSales(salesList: DraftSale[]) {
  const seen = new Set<string>();
  const out: DayRegistrationPlan["newClients"] = [];
  for (const s of salesList) {
    const key = s.clientName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: s.clientName, sector: s.department, notes: `Cliente — ${s.department}` });
  }
  return out;
}

async function patchAmountReceived(clientName: string, amount: number): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, DATE))),
  );
  // Client name is on join — patch via notes match for Daniele
  const match = daySales.find(
    (s) => s.notes?.toLowerCase().includes("daniele") || s.notes?.toLowerCase().includes("metade"),
  );
  if (!match) {
    console.warn(`⚠ Não achei venda da Daniele para patch de R$${amount}`);
    return;
  }
  await queryRun(
    db
      .update(sales)
      .set({ amountReceived: String(amount), paymentStatus: "partial" })
      .where(eq(sales.id, match.id)),
  );
  console.log(`✓ amountReceived Daniele → R$${amount.toFixed(2)} (${match.id})`);
}

async function main() {
  const salesList: DraftSale[] = [
    // Unifor
    sale({
      time: "08:30",
      clientName: "Joaquim",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      department: DEPT_UNIFOR,
      notes: "Unifor — espécie.",
    }),
    sale({
      time: "08:40",
      clientName: "Xavier",
      productName: P.mistaoForno,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor — novo cliente.",
    }),
    sale({
      time: "08:40",
      clientName: "Xavier",
      productName: P.carneForno,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor — novo cliente.",
    }),
    // Acal
    sale({ time: "09:10", clientName: "Bernardo", productName: P.carneForno, quantity: 1 }),
    sale({
      time: "09:20",
      clientName: "Davi",
      productName: P.unknown,
      quantity: 2,
      notes: "Sabor não visto.",
    }),
    sale({
      time: "09:25",
      clientName: "João Pedro",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não visto.",
    }),
    sale({
      time: "09:30",
      clientName: "Maria Mikelly",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não visto.",
    }),
    sale({ time: "09:35", clientName: "Jonas", productName: P.croissant, quantity: 1 }),
    sale({
      time: "09:40",
      clientName: "Francisco Bruno Ribeiro",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não visto.",
    }),
    sale({
      time: "09:45",
      clientName: "Ana Angelica",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não visto.",
    }),
    sale({
      time: "09:50",
      clientName: "Daniele Gomes",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentStatus: "partial",
      notes:
        "Paga pela metade R$2,50 (duas pessoas dividindo). Falta R$2,50 da outra pessoa — quitar no 11/08 contando no 10/08. Daniele.",
    }),
    sale({
      time: "10:00",
      clientName: "Vanderson Dias",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não visto.",
    }),
    sale({ time: "10:05", clientName: "Bernardo", productName: P.mistaoFrito, quantity: 1 }),
    sale({
      time: "10:10",
      clientName: "Cliente não identificado (X)",
      productName: P.mistaoFrito,
      quantity: 1,
      notes: "Nome não anotado (X no rascunho).",
    }),
    sale({ time: "10:15", clientName: "Cássio Adriel", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:20", clientName: "Paulo André", productName: P.carneForno, quantity: 1 }),
    sale({ time: "10:25", clientName: "Gerb", productName: P.mistaoForno, quantity: 1 }),
    sale({
      time: "10:30",
      clientName: "Ana Laura",
      productName: P.croissant,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado — prometeu pagar 11/08; faturamento fica no 10/08 quando quitar.",
    }),
    sale({
      time: "10:35",
      clientName: "Rapaz do setor de baixo",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado — nome ainda não identificado; cobrar 11/08 no 10/08.",
    }),
    sale({
      time: "10:40",
      clientName: "Henrique",
      productName: P.croissant,
      quantity: 2,
      notes: "Compra do Henrique (2 croissant).",
    }),
    sale({
      time: "10:40",
      clientName: "Henrique",
      productName: P.mistaoFrito,
      quantity: 1,
      notes: "Compra do Henrique — 1 Pastel (= Mistão Frito).",
    }),
    // Colegas do Henrique — lote (7 un): lista nominal Unifor/Acal+Henrique = 23;
    // 23+7=30. Rascunho citava 8 no canal; fechamos 7 no lote para bater 30/30.
    sale({
      time: "11:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 7,
      department: DEPT_HENRIQUE,
      notes:
        "Lote trabalho do Henrique — rascunho 8 un; 7 no lote + vendas nominais fecham 30. 100% vendidos.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 30) throw new Error(`Units ${units} ≠ 30`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 30,
      investment: 87,
      ownInvestment: 87,
      products: [
        { name: P.mistaoFrito, quantity: 15 }, // 12 Acal/Unifor + 3 colegas
        { name: P.croissant, quantity: 6 }, // 4 + 2
        { name: P.carneForno, quantity: 4 },
        { name: P.mistaoForno, quantity: 5 }, // 2 + 3
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 4 },
        { name: P.mistaoForno, quantity: 2 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.croissant, quantity: 2 },
      ],
    },
    summary: {
      revenue: 137.5,
      profit: 50.5,
      quantitySold: 30,
      quantityLost: 0,
      forecastProfit: 63,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Unifor + Acal (22) + Colegas Henrique (8 no rascunho; lote 7 + nominais = 30).",
      "Custo 30 × R$2,90 = R$87 (100% próprio).",
      "Pendências (contam no 10/08 quando quitarem): Ana Laura R$5 · Rapaz setor de baixo R$5 · Daniele falta R$2,50 = R$12,50.",
      "Fat. total R$150 · recebido R$137,50 · lucro R$50,50 (previsto c/ quitações R$63).",
      "Rascunho tinha fat. R$132,50 / lucro R$48,50 — ajustado ao ledger (30×R$5 − pend. R$12,50).",
      "Lista nominal somava 23 un.; lote colegas com 7 para fechar 30/30.",
      "Novo cliente Unifor: Xavier.",
      "Horário limite Unifor→Acal; ideia sanduíches naturais; manhã fraca em recorrentes.",
      "Cofrinho teórico: R$1.078,00 · prático (rascunho): R$1.080,27 (+ rendimento; base teórica +R$2 vs rascunho).",
    ].join("\n"),
    manualInsights:
      "Quitações de 11/08 (Laura, Rapaz, restante Daniele) devem atualizar as vendas do 10/08 — não criar fat. novo no 11.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$${plan.summary.revenue} · lucro R$${plan.summary.profit}`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await patchAmountReceived("Daniele Gomes", 2.5);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário ausente após commit");

  await upsertDiaryEntry({
    ...entry,
    profit: 50.5,
    bonusIncome: undefined,
    quantitySold: 30,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    revenue: {
      received: 137.5,
      pending: 12.5,
      total: 150,
    },
    sales: {
      paidCount: 27,
      creditCount: 3,
      fatherSale: { units: 7, amount: 35, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$50,50 · fat R$137,50 (+ R$12,50 pend.)`);
  console.log("Cofrinho teórico esperado: R$1.078,00");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
