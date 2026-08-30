/**
 * Registra 25/08/2026 — Salgados + quita Ana Laura do 24/08.
 * Uso: pnpm tsx scripts/register-day-2508.ts
 *
 * - Compra 22 un · R$77 (próprio R$50 + Terceiros R$27)
 * - Henrique 5 · todos R$25 (lista dizia 6 — corrigido para fechar 22 + R$25)
 * - Acal/Unifor 17 · João Victor: 1 hoje + R$5 adiantado p/ 26 (não consome estoque)
 * - Fat. dia R$110 · lucro operacional R$60 (110 − 50)
 * - Quitação Ana Laura R$10 → atualiza 24/08 (não entra no lucro do 25)
 * - Caixa do dia R$125 = 110 + 10 quit + 5 adiantamento
 * - Mikely (21/08): ainda aberta — não inventar
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
import { sales } from "../src/lib/db/postgres/schema";
import { queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-08-25";
const PREV = "2026-08-24";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";
const ANA_LAURA_24_ID = "9c5d5faf-0b64-452d-bd41-b2dd0b418882";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
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

async function settleAnaLaura24(): Promise<void> {
  const db = await getPostgresDb();
  await queryRun(
    db
      .update(sales)
      .set({
        paymentStatus: "paid",
        amountReceived: "10.00",
        settlementDate: DATE,
        notes:
          "Fiado quitado em 25/08 por Ana Laura Ferreira Pinto — faturamento permanece no 24/08.",
      })
      .where(and(eq(sales.id, ANA_LAURA_24_ID), eq(sales.saleDate, PREV))),
  );
  console.log("✓ 24/08 Ana Laura quitada (R$10)");

  const entry = await getDiaryEntry(BUSINESS, PREV);
  if (!entry) throw new Error("Diário 24/08 ausente — não dá para quitar");

  await upsertDiaryEntry({
    ...entry,
    profit: 55,
    bonusIncome: undefined,
    quantitySold: 21,
    quantityLost: 1,
    lossReason: entry.lossReason,
    revenue: {
      received: 105,
      pending: 0,
      total: 105,
    },
    sales: {
      paidCount: 21,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitação 25/08 ——",
      "Ana Laura R$10 (2 un. fiado). Fat. final 24/08: R$105 · lucro R$55 · pendente R$0.",
      "Mikely (21/08) continua em aberto.",
    ]
      .filter((x) => x !== undefined)
      .join("\n"),
  });
  console.log("✓ Diário 24/08 → fat R$105 · lucro R$55 · pend. R$0");
}

async function main() {
  console.log("\n======== QUITAÇÃO 24/08 ========");
  await settleAnaLaura24();

  const salesList: DraftSale[] = [
    sale({
      time: "09:00",
      clientName: "Francisco Ricardo Feijao Pinho",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:05",
      clientName: "Daniele Gomes Silva",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:10",
      clientName: "Ismael Silva Da Paz",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:15",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:20",
      clientName: "Cristiano Messias Lopes",
      productName: P.unknown,
      quantity: 3,
    }),
    sale({
      time: "09:25",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:30",
      clientName: "Lucas Moraes",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:35",
      clientName: "Davi Oliveira Da Silva Ayoub",
      productName: P.unknown,
      quantity: 1,
      notes: "1ª compra do dia.",
    }),
    sale({
      time: "09:40",
      clientName: "Francisco De Assis Soares Pereira",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:45",
      clientName: "Clarissa De Oliveira Silva",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:50",
      clientName: "Maria Eduarda Viana Pereira",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Raimunda Raimunda Sousa",
      productName: P.unknown,
      quantity: 2,
    }),
    sale({
      time: "10:05",
      clientName: "Davi Oliveira Da Silva Ayoub",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 3 Mistão frito + 1 Mistão forno + 1 Carne forno · 100% vendidos (R$25). PIX via Henrique Alberto. Lista dizia 6 un.; fechado em 5 para bater estoque/R$25.",
    }),
    sale({
      time: "15:00",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      notes:
        "1 un. do dia. Outro R$5 pago adiantado para 26/08 — não consome estoque de 25 (só caixa).",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 22) throw new Error(`Units vendidas ${units} ≠ 22`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 22,
      investment: 77,
      ownInvestment: 50,
      thirdParty: { name: "Terceiros", amount: 27 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.paoQueijo, quantity: 3 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 7 },
        { name: P.carneForno, quantity: 2 },
        { name: P.croissant, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.paoQueijo, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.carneForno, quantity: 1 },
      ],
    },
    summary: {
      revenue: 110,
      profit: 60,
      quantitySold: 22,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 22 un = R$77 (Mistão frito 10 · Carne forno 3 · Croissant 3 · Mistão forno 3 · Pão de Queijo 3).",
      "Custo próprio R$50 + Terceiros R$27 · bônus R$0 · perdas 0 · fiado novo 0.",
      "Henrique 5 (R$25) · Acal/Unifor 17 · inventário 22/22.",
      "Fat. dia R$110 · lucro operacional R$60 (= 110 − 50).",
      "Caixa do dia R$125 = R$110 (dia) + R$10 (quit Ana Laura → 24/08) + R$5 (adiantamento João Victor p/ 26).",
      "Rascunho: lucro 'R$75' = caixa R$125 − R$50 (mistura quit+adiantamento); no sistema o 25 fica R$60 e o 24 sobe para R$55.",
      "Lista: Henrique Alberto 6→5; João Victor 2 = 1 hoje + 1 pago p/ amanhã.",
      "Mikely (21/08): ainda não paga. Cofrinho prático (rascunho): R$1.763,55.",
    ].join("\n"),
    manualInsights:
      "Adiantamento João Victor R$5: entregar 1 un. em 26/08 sem cobrar de novo. Quitação Ana Laura no 24.",
    lessonsLearned:
      "Bater un. Henrique com o lote separado (5) evita double-count na lista PIX.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$110 · lucro R$60 · custo próprio R$50`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 25/08 ausente após commit");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 22,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: 110,
      pending: 0,
      total: 110,
    },
    sales: {
      paidCount: 22,
      creditCount: 0,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  const d24 = await getDiaryEntry(BUSINESS, PREV);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$110 · perda 0`);
  console.log(
    `✅ ${PREV} pós-quitação — fat R$${d24?.revenue?.received} · lucro R$${d24?.profit} · pend R$${d24?.revenue?.pending}`,
  );
  console.log("Caixa do dia (rascunho): R$125 = 110 + 10 quit + 5 adiantamento João");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
