/**
 * Registra 11/08/2026 — Salgados + quita fiados do 10/08.
 * Uso: pnpm tsx scripts/register-day-1108.ts
 *
 * 11/08 (oficial):
 * - Compra 20 un · R$70 (próprio R$30 + Flaviana R$40)
 * - Vendidos 18 · perdidos 2 · fat. do dia R$90 · lucro R$60 (90 − 30)
 * - Quitações R$12,50 atualizam o 10/08 (não entram no lucro do 11)
 * - Cofrinho teórico: R$1.150,50 (= 1.078 + 12,50 no 10 + 60 no 11)
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

const DATE = "2026-08-11";
const PREV = "2026-08-10";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";

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

/** Quita fiados do 10/08 e atualiza diário → lucro R$63 / fat R$150. */
async function settleDay10Pendings(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, PREV))),
  );

  const byId = new Map(daySales.map((s) => [s.id, s]));

  // Ana Laura — R$5
  const ana = daySales.find((s) => s.id === "5b9c93cb-9931-4689-a1f4-a6d80baefecd");
  if (ana) {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: DATE,
          notes:
            "Fiado quitado em 11/08 por Ana Laura — faturamento permanece no 10/08.",
        })
        .where(eq(sales.id, ana.id)),
    );
    console.log("✓ 10/08 Ana Laura quitada (R$5)");
  } else {
    console.warn("⚠ Ana Laura 10/08 não encontrada");
  }

  // Rapaz → Israel — R$5
  const rapaz = daySales.find((s) => s.id === "fe6935dd-bbf3-426e-af47-8d86685f7afa");
  if (rapaz) {
    if (rapaz.clientId) {
      await queryRun(
        db
          .update(clients)
          .set({ name: "Israel", updatedAt: new Date() })
          .where(eq(clients.id, rapaz.clientId)),
      );
    }
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: DATE,
          notes:
            "Fiado quitado em 11/08 — cliente identificado: Israel (ex-Rapaz do setor de baixo). Fat. no 10/08.",
        })
        .where(eq(sales.id, rapaz.id)),
    );
    console.log("✓ 10/08 Israel (ex-Rapaz) quitado (R$5)");
  } else {
    console.warn("⚠ Rapaz/Israel 10/08 não encontrado");
  }

  // Metade restante — Adriana (venda Daniele) — +R$2,50 → total R$5
  const daniele = byId.get("eb30a72d-3119-4d23-907a-7b706bbcaab8");
  if (daniele) {
    await queryRun(
      db
        .update(sales)
        .set({
          paymentStatus: "paid",
          amountReceived: "5.00",
          settlementDate: DATE,
          notes:
            "Metade Daniele (R$2,50) + metade Adriana (R$2,50) quitada em 11/08 — fat. no 10/08.",
        })
        .where(eq(sales.id, daniele.id)),
    );
    console.log("✓ 10/08 Adriana/Daniele fechado (R$5 total)");
  } else {
    console.warn("⚠ Daniele 10/08 não encontrada");
  }

  const entry = await getDiaryEntry(BUSINESS, PREV);
  if (!entry) throw new Error("Diário 10/08 ausente — não dá para quitar");

  await upsertDiaryEntry({
    ...entry,
    profit: 63,
    bonusIncome: undefined,
    quantitySold: 30,
    quantityLost: 0,
    revenue: {
      received: 150,
      pending: 0,
      total: 150,
    },
    sales: {
      paidCount: 30,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitações 11/08 (contam no 10/08) ——",
      "Ana Laura R$5 · Israel R$5 · Adriana (metade c/ Daniele) R$2,50 = R$12,50.",
      "Fat. final 10/08: R$150 · lucro R$63 · pendente R$0.",
    ]
      .filter((x) => x !== undefined)
      .join("\n"),
    manualInsights:
      "Pendências do 10/08 quitadas em 11/08 sem criar faturamento novo no 11.",
  });
  console.log("✓ Diário 10/08 → fat R$150 · lucro R$63 · pend. R$0");
}

async function main() {
  console.log("\n======== QUITAÇÕES 10/08 ========");
  await settleDay10Pendings();

  const salesList: DraftSale[] = [
    // Manhã — Unifor
    sale({
      time: "08:20",
      clientName: "Joaquim",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      department: DEPT_UNIFOR,
      notes: "Unifor — Pastel (= Mistão Frito) · espécie.",
    }),
    sale({
      time: "08:25",
      clientName: "Xavier",
      productName: P.croissant,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor.",
    }),
    sale({
      time: "08:30",
      clientName: "João Victor",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor — Pastel (= Mistão Frito).",
    }),
    // Manhã — Acal
    sale({
      time: "09:00",
      clientName: "Francisco Ricardo",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:05",
      clientName: "Maria Clara Mororo",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:10",
      clientName: "Mikelly",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:15",
      clientName: "Iury",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:20",
      clientName: "Gerb",
      productName: P.mistaoFrito,
      quantity: 1,
      notes: "Pastel (= Mistão Frito).",
    }),
    sale({
      time: "09:25",
      clientName: "Lucas Moraes",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:30",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado. (Quitação do fiado 10/08 é à parte.)",
    }),
    sale({
      time: "09:35",
      clientName: "Danilo Duarte",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "09:40",
      clientName: "Francisco de Assis",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    // Tarde — Acal
    sale({
      time: "14:00",
      clientName: "Francisco Bruno",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado.",
    }),
    sale({
      time: "14:30",
      clientName: "Raimunda",
      productName: P.croissant,
      quantity: 1,
    }),
    // Henrique levou 4 un para vender — vendeu todos.
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 4,
      department: "Colegas do Henrique",
      notes: "Henrique levou 4 un para vender no trabalho — 100% vendidos.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 18) throw new Error(`Units vendidas ${units} ≠ 18`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 20,
      investment: 70,
      ownInvestment: 30,
      thirdParty: { name: "Flaviana", amount: 40 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
    },
    summary: {
      revenue: 90,
      profit: 60,
      quantitySold: 18,
      quantityLost: 2,
      lossReason:
        "2 salgados perdidos (roubo ou fiado sem autorização) — deixados sozinhos ~8h30–9h.",
      forecastProfit: 30,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 20 un = R$70 (Mistão frito 10 · Croissant 4 · Carne forno 3 · Mistão forno 3).",
      "Custo próprio R$30 + Flaviana R$40 · bônus R$0.",
      "Vendidos 18 · perdidos 2 · inventário 20/20.",
      "Fat. do dia R$90 (sem quitação) · com quitação do 10 no caixa mental R$102,50 · esperado c/ 20 vendidos R$112,50.",
      "Lucro R$60 (= 90 − 30). Quitação R$12,50 só no 10/08 (lucro 10 → R$63).",
      "Lista escrita: 14 un Unifor/Acal + 4 Henrique (colegas) = 18.",
      "Experimento: salgados sozinhos a partir ~8h30 (mãe vai cobrir) — hoje −2 un.",
      "Decisão: parar de forçar anotação de horário/sabor para focar no trabalho Acal.",
      "Cofrinho teórico: R$1.150,50 · prático: R$1.153,28.",
    ].join("\n"),
    manualInsights:
      "Quitações Ana Laura / Israel / Adriana gravadas no 10/08. Perdas = roubo/fiado não autorizado, não fiado combinado.",
    lessonsLearned:
      "Deixar salgados sem vigilância custa unidades. Priorizar operação Acal vs. anotar sabor/hora de cada venda.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$90 · lucro R$60 · perda 2 · custo próprio R$30`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 11/08 ausente após commit");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 18,
    quantityLost: 2,
    lossReason: plan.summary.lossReason,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: 90,
      pending: 0,
      total: 90,
    },
    sales: {
      paidCount: 18,
      creditCount: 0,
      fatherSale: { units: 4, amount: 20, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  const d10 = await getDiaryEntry(BUSINESS, PREV);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$90 · perda 2`);
  console.log(
    `✅ ${PREV} pós-quitação — fat R$${d10?.revenue?.received} · lucro R$${d10?.profit} · pend R$${d10?.revenue?.pending}`,
  );
  console.log("Cofrinho teórico esperado: R$1.150,50");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
