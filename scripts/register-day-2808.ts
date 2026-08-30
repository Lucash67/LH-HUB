/**
 * Registra 28/08/2026 — Salgados + quita Mikely do 21/08.
 * Uso: pnpm tsx scripts/register-day-2808.ts
 *
 * - Compra 20 un · R$70 (próprio R$40 + Terceiros R$30)
 * - Vendidos 20 · R$100 · lucro R$60 · perda 0
 * - Henrique 4 · R$20
 * - Lista Acal: Mikely 2/R$10 = 1 venda do dia + R$5 quitação 21/08
 * - Caixa R$105 = 100 (dia) + 5 (quit Mikely → 21)
 * - Ismael 24/08 continua pendente
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
import { sales } from "../src/lib/db/postgres/schema";
import { queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-08-28";
const D21 = "2026-08-21";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";
const MIKELY_21_ID = "7cf5aac7-c7ff-4599-b6df-05f0e44fd3c6";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  carneFrito: "Carne Frito",
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

async function settleMikely21(): Promise<void> {
  const db = await getPostgresDb();
  await queryRun(
    db
      .update(sales)
      .set({
        paymentStatus: "paid",
        amountReceived: "5.00",
        settlementDate: DATE,
        notes:
          "Fiado quitado em 28/08 por Maria Mikelly — faturamento permanece no 21/08.",
      })
      .where(and(eq(sales.id, MIKELY_21_ID), eq(sales.saleDate, D21))),
  );
  console.log("✓ 21/08 Mikely quitada (R$5)");

  const entry = await getDiaryEntry(BUSINESS, D21);
  if (!entry) throw new Error("Diário 21/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 65,
    bonusIncome: undefined,
    quantitySold: entry.quantitySold ?? 21,
    quantityLost: entry.quantityLost ?? 0,
    revenue: {
      received: 105,
      pending: 0,
      total: 105,
    },
    sales: {
      paidCount: (entry.sales?.paidCount ?? 20) + 1,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitação 28/08 ——",
      "Mikely R$5 (fiado 21/08). Fat. final 21/08: R$105 · lucro R$65 · pendente R$0.",
      "Ismael (24/08) continua em aberto.",
    ]
      .filter((x) => x !== undefined)
      .join("\n"),
  });
  console.log("✓ Diário 21/08 → fat R$105 · lucro R$65 · pend. R$0");
}

async function main() {
  console.log("\n======== QUITAÇÃO 21/08 (Mikely) ========");
  await settleMikely21();

  // 16 Acal do dia + 4 Henrique = 20 (Mikely qty 1 no dia; o outro R$5 é quitação)
  const salesList: DraftSale[] = [
    sale({
      time: "09:00",
      clientName: "Leonardo De Sousa Sena",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:05",
      clientName: "Francisco Ricardo Feijao Pinho",
      productName: P.unknown,
      quantity: 2,
    }),
    sale({
      time: "09:10",
      clientName: "Francisco Vanderson Oliveira Dias",
      productName: P.unknown,
      quantity: 1,
      notes: "1ª compra do dia.",
    }),
    sale({
      time: "09:15",
      clientName: "Francisco Vanderson Oliveira Dias",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({
      time: "09:20",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
      notes:
        "1 un. do dia. Outro R$5 na lista = quitação do fiado 21/08 (não consome estoque de 28).",
    }),
    sale({
      time: "09:25",
      clientName: "Joao Pedro Souza P Marques",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:30",
      clientName: "Ana Angelica Magalhaes Martins",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:35",
      clientName: "Dayanna Kelly Costa Almeida",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:40",
      clientName: "Davi Oliveira Da Silva Ayoub",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:45",
      clientName: "Raimunda Raimunda Sousa",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:50",
      clientName: "Thalita Hivia De Almeida Freitas",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Jose Maclaurem Rodrigues",
      productName: P.unknown,
      quantity: 3,
    }),
    sale({
      time: "10:05",
      clientName: "Maria Eduarda Viana Pereira",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.mistaoFrito,
      quantity: 4,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 4 Mistão frito · 100% vendidos (R$20). PIX via Henrique.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 20) throw new Error(`Units ${units} ≠ 20`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 20,
      investment: 70,
      ownInvestment: 40,
      thirdParty: { name: "Terceiros", amount: 30 },
      products: [
        { name: P.mistaoFrito, quantity: 9 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 2 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.paoQueijo, quantity: 2 },
        { name: P.carneFrito, quantity: 2 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 5 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 2 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.paoQueijo, quantity: 2 },
        { name: P.carneFrito, quantity: 2 },
      ],
      fatherAllocation: [{ name: P.mistaoFrito, quantity: 4 }],
    },
    summary: {
      revenue: 100,
      profit: 60,
      quantitySold: 20,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 20 un = R$70 (Mistão frito 9 · Croissant 3 · Carne forno 2 · Mistão forno 2 · Pão de Queijo 2 · Carne frito 2).",
      "Custo próprio R$40 + Terceiros R$30 · perdas 0 · fiado novo 0.",
      "Henrique 4 (R$20) · Acal/Unifor 16 · inventário 20/20.",
      "Fat. dia R$100 · lucro operacional R$60 (= 100 − 40).",
      "Caixa R$105 = R$100 (dia) + R$5 (quit Mikely → 21/08).",
      "Lista Mikely 2/R$10 = 1 un. do dia + quitação 21/08.",
      "Ismael (24/08) continua pendente. OBS: fidelidade / cardápio / anti-furto (Ideias).",
      "Cofrinho prático (rascunho): R$1.946,14.",
    ].join("\n"),
    manualInsights:
      "Quitação Mikely atualiza o 21/08. Não misturar quitação com unidade do estoque do dia.",
    lessonsLearned:
      "Providenciar fidelidade, novo cardápio e estratégia para reduzir furto/fiado não declarado.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$100 · lucro R$60`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);
  await fixDayPricing(BUSINESS, D21);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 28/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 20,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 100, pending: 0, total: 100 },
    sales: {
      paidCount: 20,
      creditCount: 0,
      fatherSale: { units: 4, amount: 20, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  const d21 = await getDiaryEntry(BUSINESS, D21);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$100`);
  console.log(
    `✅ ${D21} pós-quitação — fat R$${d21?.revenue?.received} · lucro R$${d21?.profit} · pend R$${d21?.revenue?.pending}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
