/**
 * 1) Ajusta 19/08: João Victor pago + porteiro como cortesia (não perda)
 * 2) Registra 21/08 (sexta) a partir da nota
 *
 * Uso: CONFIRM_FIX_1921=1 pnpm tsx scripts/fix-19-register-21.ts
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
import { executeSaleOperation } from "../src/domains/sales/sale-operation-handler";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { products, sales, stickyNotes } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { createClient, listClientsRaw } from "../src/platform/db/repositories/client-repository";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const BUSINESS = "salgados";
const D19 = "2026-08-19";
const D21 = "2026-08-21";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";
const DEPT_UNIFOR = "Unifor";

const P = {
  mistaoFrito: "Mistão Frito",
  carneForno: "Carne com Cheddar de Forno",
  croissant: "Croissant",
  paoQueijo: "Pão de Queijo",
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

async function ensureClient(name: string, sector: string, notes: string) {
  const all = await listClientsRaw();
  const found = all.find((c) => norm(c.name) === norm(name) || norm(c.name).includes(norm(name)));
  if (found) return found;
  return createClient({ name, sector, notes });
}

async function fixDay19(): Promise<void> {
  console.log("\n======== AJUSTE 19/08 ========");
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D19))),
  );

  const alreadyJoao = daySales.find((s) => norm(s.notes ?? "").includes("joao victor"));
  const alreadyPorteiro = daySales.find((s) => norm(s.notes ?? "").includes("porteiro"));

  const prods = await queryAll(db.select().from(products).where(eq(products.businessId, businessId)));
  const unknown = prods.find((p) => p.name === UNIDENTIFIED_FLAVOR_PRODUCT_NAME) ?? prods[0];
  const pao = prods.find((p) => norm(p.name).includes("pao de queijo")) ?? unknown;
  if (!unknown) throw new Error("Sem produto");

  if (!alreadyJoao) {
    const joao = await ensureClient(
      "Joao Victor",
      DEPT_UNIFOR,
      "Unifor — sempre paga; às vezes esquece. Baixa 19/08.",
    );
    const result = await executeSaleOperation({
      productId: unknown.id,
      quantity: 1,
      clientId: joao.id,
      paymentMethod: "pix",
      paymentStatus: "paid",
      date: D19,
      time: "16:00",
      department: DEPT_UNIFOR,
      notes:
        "João Victor (Unifor · Carne forno reservada) — baixa como pago (costuma esquecer, mas sempre quita).",
      unitPrice: 5,
      unitCost: 0,
    });
    console.log(`✓ João Victor pago no 19 · sale ${result.saleId}`);
  } else {
    console.log("· João Victor já lançado");
  }

  if (!alreadyPorteiro) {
    const porteiro = await ensureClient(
      "Porteiro (cortesia)",
      DEPT_ACAL,
      "Brinde — compensação por salgado com plástico em dia anterior.",
    );
    const result = await executeSaleOperation({
      productId: pao.id,
      quantity: 1,
      clientId: porteiro.id,
      paymentMethod: "cash",
      paymentStatus: "paid",
      date: D19,
      time: "16:30",
      department: DEPT_ACAL,
      notes:
        "CORTESIA/BRINDE ao porteiro — Pão de Queijo de graça (redenção por plástico em salgado anterior). Não é perda.",
      unitPrice: 0,
      unitCost: 0,
    });
    // força R$0 no ticket
    await queryRun(
      db
        .update(sales)
        .set({
          totalAmount: "0.00",
          amountReceived: "0.00",
          profit: "0.00",
          notes:
            "CORTESIA/BRINDE ao porteiro — Pão de Queijo de graça (redenção por plástico). Não é perda.",
          updatedAt: new Date(),
        })
        .where(eq(sales.id, result.saleId)),
    );
    console.log(`✓ Porteiro cortesia R$0 no 19 · sale ${result.saleId}`);
  } else {
    console.log("· Porteiro já lançado");
  }

  const entry = await getDiaryEntry(BUSINESS, D19);
  if (!entry) throw new Error("Diário 19 ausente");

  // Antes: fat 113.50 (com quits) · sold 23 · lost 2
  // Depois: + João Victor R$5 · porteiro R$0 · sold 25 · lost 0
  const received = 118.5;
  await upsertDiaryEntry({
    ...entry,
    profit: received, // custo próprio 0
    quantitySold: 25,
    quantityLost: 0,
    lossReason: undefined,
    revenue: { received, pending: 0, total: received },
    sales: {
      paidCount: 24, // pagos com valor (inclui João); cortesia à parte na obs
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Ajuste 22/08 ——",
      "João Victor: baixa como pago R$5 (Unifor — sempre quita, às vezes esquece).",
      "Porteiro: 1 Pão de Queijo de CORTESIA/BRINDE (plástico) — não conta como perda.",
      `Fat. final 19/08: R$${received.toFixed(2)} · lucro R$${received.toFixed(2)} · lost 0 · sold 25.`,
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "19/08 fechado: João Victor pago · porteiro cortesia. Sem perdas operacionais neste dia.",
  });
  console.log(`✓ Diário 19 → fat R$${received} · lucro R$${received} · sold 25 · lost 0`);
}

async function registerFriday(): Promise<void> {
  console.log("\n======== SALGADOS 21/08 ========");

  // Henrique Alberto 6 = lote trabalho (não duplicar)
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Lote Henrique trabalho 6 un · R$30 (= item 13 da lista Acal).",
    }),
    sale({ time: "09:00", clientName: "Davi Oliveira Da Silva Ayoub", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Francisco Nazareno Da Silva Raquel", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Vanderson Dias", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Shirley Lima Vieira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Cássio Adriel De Oliveira Silva", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:35", clientName: "Jackson Mendes Pinheiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Ana Laura Ferreira Pinto", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:45", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:50",
      clientName: "Francisco Nazareno Da Silva Raquel",
      productName: P.unknown,
      quantity: 1,
      notes: "Segunda compra do dia.",
    }),
    sale({
      time: "09:55",
      clientName: "Francisco Ricardo Feijao Pinho",
      productName: P.unknown,
      quantity: 2,
      notes: "Compra adicional · R$10.",
    }),
    sale({
      time: "15:00",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado avisado — cobrar na segunda (24/08).",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 21) throw new Error(`21/08 units ${units} ≠ 21`);

  const paid = salesList.filter((s) => s.paymentStatus !== "pending").reduce((n, s) => n + s.quantity, 0);
  const pending = salesList.filter((s) => s.paymentStatus === "pending").reduce((n, s) => n + s.quantity, 0);
  if (paid !== 20 || pending !== 1) throw new Error(`paid/pend ${paid}/${pending}`);

  const revenue = 100;
  const ownCost = 33.5;
  const profit = 60; // conforme nota + cofrinho (+R$60)
  const pendingRevenue = 5;

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: D21,
    purchase: {
      totalUnits: 21,
      investment: 73.5,
      ownInvestment: ownCost,
      thirdParty: { name: "Terceiros", amount: 40 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 4 },
        { name: P.paoQueijo, quantity: 4 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 6 },
        { name: P.carneForno, quantity: 1 },
        { name: P.croissant, quantity: 4 },
        { name: P.paoQueijo, quantity: 4 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.carneForno, quantity: 2 },
      ],
    },
    summary: {
      revenue,
      profit,
      quantitySold: 21,
      quantityLost: 0,
      forecastProfit: 65,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "FECHAMENTO 21/08 — nota preenchida.",
      "Encomenda 21 un = R$73,50 (próprio R$33,50 + terceiros R$40).",
      "Henrique 6 · R$30. Acal pagos 14 · R$70. Fat dia R$100.",
      "Fiado: Mikely 1 — cobrar segunda.",
      "Perdas do dia: nenhuma. (As 2 cegas do 20 seguem no 20.)",
      "Lucro nota R$60 · cofrinho prática R$1.631,95.",
      "OBS: backlog — módulo de idéias/observações futuras (cardápio, estratégias).",
    ].join("\n"),
    manualInsights:
      "Dia limpo de controle. Mikely pendente R$5. Lucro lançado R$60 conforme nota/cofrinho.",
    lessonsLearned: "Guardar demandas futuras (cardápio/estratégias) em backlog/módulo de idéias.",
  };

  await cleanupOperationDay(BUSINESS, D21);
  const existing = await countSalesForDate(BUSINESS, D21);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} ticket(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, D21);

  const entry = await getDiaryEntry(BUSINESS, D21);
  if (!entry) throw new Error("Diário 21 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit,
    bonusIncome: undefined,
    quantitySold: 21,
    quantityLost: 0,
    lossReason: undefined,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: revenue,
      pending: pendingRevenue,
      total: revenue + pendingRevenue,
    },
    sales: {
      paidCount: 20,
      creditCount: 1,
      fatherSale: {
        units: 6,
        amount: 30,
        buyerName: "Henrique Alberto Matos Da Rocha",
      },
    },
  });

  // Mark Friday note closed
  const db = await getPostgresDb();
  const notes = await queryAll(
    db.select().from(stickyNotes).where(and(eq(stickyNotes.noteDate, D21), eq(stickyNotes.archived, false))),
  );
  for (const note of notes) {
    await queryRun(
      db
        .update(stickyNotes)
        .set({
          title: "Salgados — 21/08 FECHADO ✓",
          updatedAt: new Date(),
          clientUpdatedAt: new Date(),
        })
        .where(eq(stickyNotes.id, note.id)),
    );
  }
  console.log(`✓ Nota(s) 21/08 FECHADO (${notes.length})`);
}

async function main() {
  if (process.env.CONFIRM_FIX_1921 !== "1") {
    console.error("Abortado: CONFIRM_FIX_1921=1");
    process.exit(1);
  }

  await fixDay19();
  await registerFriday();

  console.log("\n======== VERIFICAÇÃO FINAL ========");
  for (const d of ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21"] as const) {
    const e = await getDiaryEntry(BUSINESS, d);
    const n = await countSalesForDate(BUSINESS, d);
    console.log(
      `${d}: tickets=${n} fat=${e?.revenue?.received} pend=${e?.revenue?.pending} lucro=${e?.profit} sold=${e?.quantitySold} lost=${e?.quantityLost}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
