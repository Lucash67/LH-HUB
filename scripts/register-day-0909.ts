/**
 * Registra 09/09/2026 — Salgados + quitações + baixa Anderson.
 * Uso: pnpm tsx scripts/register-day-0909.ts
 *
 * - Compra 30 un · R$90 (próprio R$80 + Terceiros R$10) · bônus R$0
 * - Vendidos 30 · fat R$150 · lucro op R$70 (= 150 − 80)
 * - Quita no dia original: Ana Laura 02/09 · Ana Laura 08/09 · 2 Desconhecido 08/09
 * - Anderson 24/08 → perda (não vai pagar)
 * - Rodrigues 31/08 segue aberto
 * - Lista tinha 33 linhas: Ana 3 = 2 vendas + 1 quit; “Não identificadas 2” = quits NN
 */
import "./load-env";
import { and, desc, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import {
  cashFlowEvents,
  clients,
  products,
  saleItems,
  sales,
  stockMovements,
} from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-09-09";
const D02 = "2026-09-02";
const D08 = "2026-09-08";
const D24 = "2026-08-24";
const D31 = "2026-08-31";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  frangoCat: "Frango com Catupiry",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  queijoFrito: "Queijo Frito",
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

/** Anderson 24/08 pendente → perda (não pagará). */
async function writeOffAnderson24(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D24))),
  );

  const anderson = daySales.find((s) => s.paymentStatus === "pending");
  if (!anderson) {
    console.log("· Anderson 24/08 já sem pendência");
  } else {
    const movements = await queryAll(
      db
        .select({ productId: stockMovements.productId })
        .from(stockMovements)
        .where(eq(stockMovements.saleId, anderson.id)),
    );
    const productIds = [...new Set(movements.map((m) => m.productId))];
    await queryRun(db.delete(cashFlowEvents).where(eq(cashFlowEvents.saleId, anderson.id)));
    await queryRun(db.delete(stockMovements).where(eq(stockMovements.saleId, anderson.id)));
    await queryRun(db.delete(saleItems).where(eq(saleItems.saleId, anderson.id)));
    await queryRun(db.delete(sales).where(eq(sales.id, anderson.id)));
    await recalcProductStock(productIds);
    console.log(`✓ Anderson 24/08 baixado como perda (sale ${anderson.id} removida)`);
  }

  const entry = await getDiaryEntry(BUSINESS, D24);
  if (!entry) throw new Error("Diário 24/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 55,
    quantitySold: 21,
    quantityLost: 1,
    lossReason:
      "1 un. fiado Anderson das Chagas (ex-Ismael) — baixado como perda em 09/09 (não vai pagar).",
    revenue: { received: 105, pending: 0, total: 105 },
    sales: {
      paidCount: 21,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Ajuste 09/09 ——",
      "Anderson das Chagas R$5 baixado como perda (não pagará). Fat. final 24/08: R$105 · lucro R$55 · sold 21 · lost 1.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "Fiado Anderson convertido em perda. Quando havia expectativa de quitação, o dia mirava lucro R$60.",
  });
  console.log("✓ Diário 24/08 → fat R$105 · lucro R$55 · sold 21 · lost 1 · pend. R$0");
}

/** Ana Laura 02/09 quitada em 09/09 — fat. permanece no 02. */
async function settleAnaLaura02(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D02))),
  );

  const ana = daySales.find((s) => {
    if (s.paymentStatus !== "pending") return false;
    return true;
  });

  if (!ana) {
    console.log("· Ana Laura 02/09 já quitada / sem pendência");
  } else {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: DATE,
          notes: "Fiado 02/09 quitado em 09/09 por Ana Laura — faturamento permanece no 02/09.",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, ana.id)),
    );
    console.log(`✓ 02/09 Ana Laura quitada (R$5) · sale ${ana.id}`);
  }

  const entry = await getDiaryEntry(BUSINESS, D02);
  if (!entry) throw new Error("Diário 02/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 65,
    quantitySold: 19,
    quantityLost: 1,
    lossReason: entry.lossReason ?? "1 un. não identificada — perdido/não pago (R$5).",
    revenue: { received: 95, pending: 0, total: 95 },
    sales: {
      paidCount: 19,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitação 09/09 ——",
      "Ana Laura R$5 quitada em 09/09 — fat. permanece no 02/09.",
      "Fat. final 02/09: R$95 · lucro R$65 (= 95 − 30) · pend. R$0 · perda 1.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights: "Fiado Ana Laura quitado; lucro do 02 sobe de R$60 para R$65 no bolso.",
  });
  console.log("✓ Diário 02/09 → fat R$95 · lucro R$65 · pend. R$0");
}

/** Atualiza nota do Rodrigues (ainda aberto). */
async function refreshRodriguesNote(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D31))),
  );

  const rodrigues = daySales.find((s) => s.paymentStatus === "pending");
  if (!rodrigues) {
    console.warn("⚠ Rodrigues 31/08 não encontrado como pendente");
    return;
  }

  await queryRun(
    db
      .update(sales)
      .set({
        notes:
          "Fiado aberto R$5 — Jose Maclaurem Rodrigues. Ainda pendente em 09/09 (único fiado antigo restante).",
        updatedAt: new Date(),
      })
      .where(eq(sales.id, rodrigues.id)),
  );
  console.log("✓ Rodrigues 31/08 — nota atualizada (ainda pendente)");
}

/** Quita os 3 fiados do 08/09 (Ana + 2 Desconhecido) pagos em 09/09. */
async function settleDay08Pendings(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D08))),
  );

  const pending = daySales.filter((s) => s.paymentStatus === "pending");
  if (pending.length !== 3) {
    console.warn(`⚠ Esperava 3 pendentes no 08/09, achei ${pending.length}`);
  }

  const clientRows = await queryAll(db.select().from(clients));
  const nameById = new Map(clientRows.map((c) => [c.id, c.name]));

  for (const row of pending) {
    const clientName = row.clientId ? (nameById.get(row.clientId) ?? "?") : "?";
    const isAna = norm(clientName).includes("ana laura");
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: DATE,
          notes: isAna
            ? "Fiado 08/09 quitado em 09/09 por Ana Laura — faturamento permanece no 08/09."
            : "Fiado 08/09 (Desconhecido) quitado em 09/09 — faturamento permanece no 08/09.",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, row.id)),
    );
    console.log(`✓ 08/09 quitado ${clientName} (R$5) · sale ${row.id}`);
  }

  const entry = await getDiaryEntry(BUSINESS, D08);
  if (!entry) throw new Error("Diário 08/09 ausente — rode register-day-0809.ts antes");

  await upsertDiaryEntry({
    ...entry,
    profit: 69,
    bonusIncome: 16,
    bonusIncomeDescription: "Bonificação do Henrique: R$16,00 (já incluída no lucro total R$85).",
    quantitySold: 22,
    quantityLost: 0,
    revenue: { received: 110, pending: 0, total: 110 },
    sales: {
      paidCount: 22,
      creditCount: 0,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
    observations: [
      entry.observations,
      "",
      "—— Quitações 09/09 (contam no 08/09) ——",
      "Ana Laura R$5 · Desconhecido R$5 · Desconhecido R$5 = R$15.",
      "Fat. final 08/09: R$110 · lucro salgados R$69 · bônus R$16 · total/cofrinho R$85 (bônus embutido) · pend. R$0.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "3 fiados do 08 quitados em 09/09 sem criar faturamento novo no 09. Lucro total permanece R$85 (bônus embutido).",
  });
  console.log("✓ Diário 08/09 → fat R$110 · lucro total R$85 (69+16) · pend. R$0");
}

async function main() {
  console.log("\n======== AJUSTES PRÉ-09/09 ========");
  await writeOffAnderson24();
  await settleAnaLaura02();
  await refreshRodriguesNote();

  const salesList: DraftSale[] = [
    sale({ time: "09:00", clientName: "Maria Lusangela A C Sousa", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Gabriela Barreto Vasconcelos", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Joaquim Francisco Da Silva Neto", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Helano Clysman Fernandes Dos Santos", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:25", clientName: "André Da Costa Rebouças", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Nathanael Roberto Da Silva Neto", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:35", clientName: "Cássio Adriel De Oliveira Silva", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:40", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:45", clientName: "Francisco Vanderson Oliveira Dias", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:50", clientName: "Claudia Roberta Gagliardi", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:55", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "Dayanna Kelly Costa Da Silva", productName: P.unknown, quantity: 1 }),
    sale({
      time: "10:05",
      clientName: "Ana Laura Ferreira Pinto",
      productName: P.unknown,
      quantity: 2,
      notes:
        "2 vendas novas do dia. O 3º item da lista era quitação (02/09 e/ou 08/09) — fat. nos dias originais.",
    }),
    sale({ time: "10:10", clientName: "Maria Eduarda Viana Pereira", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:15", clientName: "Shirley Lima Vieira", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:20", clientName: "Barbara Braga Melo", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:25", clientName: "Cristiano Messias Lopes", productName: P.unknown, quantity: 1 }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 8,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 8 Mistão frito — 100% vendidos (R$40).",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 30) throw new Error(`Units ${units} ≠ 30 (excluídos 3 itens de quitação da lista)`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 30,
      investment: 90,
      ownInvestment: 80,
      thirdParty: { name: "Terceiros", amount: 10 },
      products: [
        { name: P.mistaoFrito, quantity: 18 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      fatherAllocation: [{ name: P.mistaoFrito, quantity: 8 }],
    },
    summary: {
      revenue: 150,
      profit: 70,
      quantitySold: 30,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 30 un = R$90 (R$87 + R$3 inflação/taxa cartão) — Mistão frito 18 · Frango c/ catupiry 3 · Croissant 3 · Carne forno 3 · Mistão forno 2 · Queijo frito 1.",
      "Custo próprio R$80 + Terceiros R$10 · bônus R$0.",
      "Henrique 8 (R$40) · Acal/Unifor 22 · inventário 30/30.",
      "Fat. dia R$150 · lucro op R$70 (= 150 − 80). Quitações NÃO entram no lucro deste dia.",
      "Lista tinha 33 linhas: Ana Laura 3 → 2 vendas + quits; “Não identificadas 2” → quits dos NN do 08/09.",
      "Quitações (dias originais): Ana Laura 02/09 R$5 · Ana Laura 08/09 R$5 · 2 Desconhecido 08/09 R$10 (= R$20 no bolso dos dias certos).",
      "Rascunho citava R$165 (150+15) — sistema: Ana quitou os dois fiados → R$20 de quitação nos dias originais.",
      "Anderson 24/08 baixado como perda. Rodrigues 31/08 segue aberto (único fiado antigo).",
      "Cofrinho prático (rascunho): R$2.465,26 (com rendimento).",
      "OBS: imprimir fidelidade / cardápio / cartazes (Ideias).",
    ].join("\n"),
    manualInsights:
      "Own alto (R$80) → lucro só R$70 apesar de fat R$150. Quitações melhoram 02 e 08, não este dia.",
    lessonsLearned:
      "Quitação conta no dia do fiado. Lista 33 ≠ inventário 30 — separar quits das vendas novas.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$150 · lucro R$70 · compra 30/R$90 own 80 · quits nos dias originais`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 09/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 70,
    bonusIncome: undefined,
    quantitySold: 30,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 150, pending: 0, total: 150 },
    sales: {
      paidCount: 30,
      creditCount: 0,
      fatherSale: { units: 8, amount: 40, buyerName: "Colegas do Henrique" },
    },
  });

  console.log("\n======== QUITAÇÕES 08/09 ========");
  await settleDay08Pendings();

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$70 · fat R$150`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
