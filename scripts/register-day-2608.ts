/**
 * Registra 26/08/2026 — Salgados + corrige perda 24/08 → fiado Ismael.
 * Uso: pnpm tsx scripts/register-day-2608.ts
 *
 * 26/08:
 * - Compra 22 · R$77 (próprio 50 + Terceiros 27)
 * - 22 un vendidas · R$110 · lucro R$60 · perda 0
 * - Henrique 5 · R$25 · Tap to Pay cartão · JV = entrega do adiantamento 25
 *
 * 24/08 (correção 26):
 * - 1 “perda” era Ismael sem pagar → venda pending R$5
 * - Diário: vendidos 22 · perdidos 0 · recebido 105 · pend. 5 · lucro 55
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { executeSaleOperation } from "../src/domains/sales/sale-operation-handler";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { products, sales } from "../src/lib/db/postgres/schema";
import { queryAll } from "../src/platform/db/query";
import { listClientsRaw } from "../src/platform/db/repositories/client-repository";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-08-26";
const D24 = "2026-08-24";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  paoQueijo: "Pão de Queijo",
  unknown: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
} as const;

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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

/** Perda 24/08 → fiado Ismael (identificado em 26/08). Ainda pendente. */
async function convertLoss24ToIsmaelPending(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const day24 = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, D24))),
  );
  const already = day24.find((s) => {
    const n = (s.notes ?? "").toLowerCase();
    return n.includes("ismael") && (n.includes("perda") || n.includes("sem pagar") || n.includes("fiado"));
  });
  if (already) {
    console.log("· Fiado Ismael 24/08 já existe");
  } else {
    const clients = await listClientsRaw();
    const ismael = clients.find((c) => {
      const n = norm(c.name);
      return n.includes("ismael") && n.includes("paz");
    });
    if (!ismael) throw new Error("Cliente Ismael Silva da Paz não encontrado");

    const prods = await queryAll(db.select().from(products).where(eq(products.businessId, businessId)));
    const unknown = prods.find((p) => p.name === UNIDENTIFIED_FLAVOR_PRODUCT_NAME) ?? prods[0];
    if (!unknown) throw new Error("Sem produto");

    const result = await executeSaleOperation({
      productId: unknown.id,
      quantity: 1,
      clientId: ismael.id,
      paymentMethod: "pix",
      paymentStatus: "pending",
      date: D24,
      time: "16:30",
      department: DEPT_ACAL,
      notes:
        "Era perda no 24/08; em 26/08 Ismael confirmou que foi ele quem pegou sem pagar. Fiado aberto R$5.",
      unitPrice: 5,
      unitCost: 2.27, // own 50/22
    });
    console.log(`✓ 24/08 Ismael fiado (ex-perda) · sale ${result.saleId}`);
  }

  const entry = await getDiaryEntry(BUSINESS, D24);
  if (!entry) throw new Error("Diário 24/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 55,
    bonusIncome: undefined,
    quantitySold: 22,
    quantityLost: 0,
    lossReason: undefined,
    revenue: {
      received: 105,
      pending: 5,
      total: 110,
    },
    sales: {
      paidCount: 21,
      creditCount: 1,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Correção 26/08 ——",
      "1 un. registrada como perda era Ismael (pegou sem pagar). Virou fiado R$5 pendente.",
      "24/08: vendidos 22 · perdidos 0 · recebido R$105 · pend. R$5 (Ismael) · lucro R$55.",
      "Mikely (21/08) continua em aberto.",
    ]
      .filter((x) => x !== undefined)
      .join("\n"),
    manualInsights:
      "Perda sem aviso pode ser fiado não declarado — confirmar com a pessoa antes de fechar como perda.",
  });
  console.log("✓ Diário 24/08 → 22 un · perda 0 · pend Ismael R$5 · lucro R$55");
}

async function main() {
  console.log("\n======== CORREÇÃO 24/08 (Ismael) ========");
  await convertLoss24ToIsmaelPending();

  const salesList: DraftSale[] = [
    sale({
      time: "08:30",
      clientName: "Venda com Tap to Pay",
      productName: P.unknown,
      quantity: 1,
      paymentMethod: "card",
      notes: "Tap to Pay · cartão.",
    }),
    sale({
      time: "09:00",
      clientName: "Francisco Ricardo Feijao Pinho",
      productName: P.unknown,
      quantity: 2,
    }),
    sale({
      time: "09:05",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:10",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:15",
      clientName: "Gerb Da Silva Maganos",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:20",
      clientName: "Lucas Moraes",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:25",
      clientName: "Davi Oliveira Da Silva Ayoub",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:30",
      clientName: "Ana Laura Ferreira Pinto",
      productName: P.unknown,
      quantity: 2,
      notes: "Pix + espécie (R$1 em dinheiro).",
    }),
    sale({
      time: "09:35",
      clientName: "Maria Eduarda Viana Pereira",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:40",
      clientName: "Jackson Mendes Pinheiro",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "09:45",
      clientName: "Vanderson Dias",
      productName: P.unknown,
      quantity: 1,
      notes: "Pix + espécie (R$1 em dinheiro).",
    }),
    sale({
      time: "09:50",
      clientName: "Letícia Paiva Martinelli",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 3 Mistão frito + 1 Mistão forno + 1 Carne forno + 1 Croissant · 100% vendidos (R$25). PIX via Henrique Alberto.",
    }),
    sale({
      time: "14:00",
      clientName: "Joaquim Neto",
      productName: P.unknown,
      quantity: 2,
    }),
    sale({
      time: "15:00",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      notes:
        "Entrega do adiantamento pago em 25/08 (R$5). Consome estoque de 26; sem novo caixa.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 22) throw new Error(`Units ${units} ≠ 22`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 22,
      investment: 77,
      ownInvestment: 50,
      thirdParty: { name: "Terceiros", amount: 27 },
      products: [
        { name: P.mistaoFrito, quantity: 13 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 2 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.paoQueijo, quantity: 2 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.carneForno, quantity: 1 },
        { name: P.croissant, quantity: 2 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.paoQueijo, quantity: 2 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.carneForno, quantity: 1 },
        { name: P.croissant, quantity: 1 },
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
      "Encomenda 22 un = R$77 (Mistão frito 13 · Croissant 3 · Carne forno 2 · Mistão forno 2 · Pão de Queijo 2).",
      "Custo próprio R$50 + Terceiros R$27 · perdas 0 · fiado novo 0.",
      "Henrique 5 (R$25) · demais 17 · inventário 22/22 (lista de todas as vendas).",
      "Fat. dia R$110 · lucro operacional R$60 (= 110 − 50).",
      "Caixa novo ~R$105 (JV R$5 já no 25) → lucro 'prática' R$55; sistema usa R$60.",
      "Tap to Pay cartão · Ana Laura/Vanderson com R$1 espécie cada.",
      "Pendências abertas: Mikely 21/08 R$5 · Ismael 24/08 R$5 (ex-perda). Sem quitação no 26.",
      "Cofrinho prático (rascunho): R$1.819,40.",
    ].join("\n"),
    manualInsights:
      "João Victor: adiantamento 25 entregue em 26. Ismael: perda 24 reclassificada como fiado.",
    lessonsLearned:
      "Antes de fechar perda, perguntar no grupo — às vezes é fiado não declarado (Ismael).",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$110 · lucro R$60`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);
  await fixDayPricing(BUSINESS, D24);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 26/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 22,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 110, pending: 0, total: 110 },
    sales: {
      paidCount: 22,
      creditCount: 0,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  const d24 = await getDiaryEntry(BUSINESS, D24);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$110`);
  console.log(
    `✅ ${D24} pós-correção — vendidos ${d24?.quantitySold} · perdidos ${d24?.quantityLost} · fat R$${d24?.revenue?.received} · pend R$${d24?.revenue?.pending} · lucro R$${d24?.profit}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
