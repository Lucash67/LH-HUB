/**
 * Registra 01/09/2026 — Salgados (Notas + confirmação Cursor).
 * Uso: pnpm tsx scripts/register-day-0109.ts
 *
 * - Compra 21 un · R$73,50 (próprio R$55 + Terceiros R$18,50) · 5 Carne Frito
 * - Vendidos 23 · R$115 · lucro R$60 (21 novas + 2 do estoque 31/08)
 * - Henrique 6 · R$30 · Unifor 2 · Acal 15
 * - Também: ajusta 31/08 (perda 3 + R$10 quitações NN) e renomeia Ismael → Anderson
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { clients, sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-09-01";
const PREV = "2026-08-31";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  frangoCat: "Frango com Catupiry",
  carneFrito: "Carne Frito",
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

function clientsFromSales(salesList: DraftSale[]): DayRegistrationPlan["newClients"] {
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

/** Ismael 24/08 pendente → Anderson das Chagas (mesmo dia no sistema). */
async function renameIsmaelToAnderson(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, "2026-08-24"))),
  );

  const ismael = daySales.find((s) => s.paymentStatus === "pending");
  if (!ismael?.clientId) {
    console.warn("⚠ Fiado Ismael 24/08 não encontrado para renomear");
    return;
  }

  await queryRun(
    db
      .update(clients)
      .set({ name: "Anderson das Chagas", updatedAt: new Date() })
      .where(eq(clients.id, ismael.clientId)),
  );
  await queryRun(
    db
      .update(sales)
      .set({
        notes:
          "Fiado aberto R$5 — cliente corrigido: Anderson das Chagas (antes lançado como Ismael). Pegou ~21/08; registro no 24/08. Ainda pendente.",
        updatedAt: new Date(),
      })
      .where(eq(sales.id, ismael.id)),
  );
  console.log("✓ 24/08 fiado renomeado Ismael → Anderson das Chagas (R$5 pendente)");
}

/** 31/08: perda 3 + 3 geladeira; +R$10 quitações NN pagas em 01/09 (Rodrigues segue aberto). */
async function adjustDay31(): Promise<void> {
  const entry = await getDiaryEntry(BUSINESS, PREV);
  if (!entry) throw new Error("Diário 31/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 65,
    bonusIncome: undefined,
    quantitySold: 20,
    quantityLost: 3,
    lossReason:
      "3 un. da sobra do trabalho não venderam (não foi roubo). Restaram 3 na geladeira — 2 entraram nas vendas de 01/09.",
    observations: [
      "Encomenda 26 un (teoria R$91) · cobrado R$77 (Mistão frito 14 · Mistão forno 4 · Frango c/ catupiry 4 · Carne frito 4).",
      "Custo próprio R$40 + Terceiros R$37 · bônus R$0.",
      "Henrique 5 (R$25) · Acal/Unifor 15 pagos + 1 fiado Rodrigues · inventário 20 vendidos / 3 perda / 3 geladeira.",
      "—— Ajuste 01/09 ——",
      "Perda 3 un. (não vendeu). Geladeira 3 un.; 2 delas vendidas em 01/09.",
      "2 quitações NN do 31/08 (R$10) pagas em 01/09 — sem identificação do pagador; fat. permanece no 31/08.",
      "Rodrigues R$5 continua pendente. Anderson das Chagas (ex-Ismael) 24/08 continua pendente.",
      "Fat. recebido R$105 (95 + 10 quit. NN) · pend. R$5 · total R$110 · lucro R$65 (= 105 − 40).",
    ].join("\n"),
    manualInsights:
      "Sobra esclarecida em 01/09: 3 perda + 3 geladeira (2 usadas no dia seguinte).",
    lessonsLearned: "Contar sobra no fim do dia. Quitações sem nome ainda precisam de identificação.",
    revenue: { received: 105, pending: 5, total: 110 },
    sales: {
      paidCount: 19,
      creditCount: 1,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });
  console.log("✓ 31/08 ajustado — perda 3 · rec R$105 · pend R$5 · lucro R$65");
}

async function main() {
  await renameIsmaelToAnderson();
  await adjustDay31();

  const salesList: DraftSale[] = [
    sale({ time: "09:00", clientName: "Raimunda Raimunda Sousa", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Levi Sampaio Benevides", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Ana Angelica Magalhaes Martins", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Lucas Moraes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Francisco Vanderson Oliveira Dias", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:30",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 3,
      notes: "Compra Acal (não é lote Colegas).",
    }),
    sale({ time: "09:35", clientName: "Nayana Lemos Galvão", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Francisco De Assis Soares Pereira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:45", clientName: "Jonas Ferreira Dos Santos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:50",
      clientName: "Israel Ferreira De Freitas",
      productName: P.unknown,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({ time: "09:55", clientName: "Joao Guilherme Da Silva Lima", productName: P.unknown, quantity: 2 }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 4 Mistão frito + 2 Carne frito — 100% vendidos (R$30).",
    }),
    sale({ time: "14:00", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "15:00",
      clientName: "João Victor Dos Santos",
      productName: P.unknown,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 23) throw new Error(`Units ${units} ≠ 23`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 21,
      investment: 73.5,
      ownInvestment: 55,
      thirdParty: { name: "Terceiros", amount: 18.5 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.carneFrito, quantity: 5 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 6 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.carneFrito, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.carneFrito, quantity: 2 },
      ],
    },
    summary: {
      revenue: 115,
      profit: 60,
      quantitySold: 23,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 21 un = R$73,50 (Mistão frito 10 · Mistão forno 3 · Frango c/ catupiry 3 · Carne frito 5).",
      "Custo próprio R$55 + Terceiros R$18,50 · bônus R$0.",
      "Henrique 6 (R$30) · Unifor 2 · Acal 15 · +2 un. do estoque 31/08 (geladeira) = 23 vendidos.",
      "Fat. dia R$115 · recebido R$115 · pend. novo R$0 · lucro R$60 (= 115 − 55).",
      "Quitações NN do 31/08 (R$10) lançadas no 31/08 (não neste dia). Rodrigues e Anderson seguem abertos.",
      "Cofrinho prático (rascunho): R$2.068,04 (com rendimento).",
      "OBS: fidelidade / cardápio / anti-furto (Ideias).",
    ].join("\n"),
    manualInsights:
      "Primeiro dia de setembro: volume 23 com 2 un. herdadas do 31/08. Meta diária R$60 batida.",
    lessonsLearned: "Estoque remanescente precisa entrar no inventário do dia seguinte.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$115 · lucro R$60 · compra 21/R$73,50`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 01/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 23,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 115, pending: 0, total: 115 },
    sales: {
      paidCount: 23,
      creditCount: 0,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$115`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
