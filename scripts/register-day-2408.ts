/**
 * Registra 24/08/2026 — Salgados (rascunho oficial).
 * Uso: pnpm tsx scripts/register-day-2408.ts
 *
 * - Compra 22 un · R$77 (próprio R$50 + Terceiros R$27)
 * - Pago 19 · fiado Ana Laura 2 · perda 1
 * - Fat. recebido R$95 · pend. R$10 · lucro R$45 (95 − 50)
 * - Henrique Alberto na lista = PIX do lote Colegas do Henrique (6 · R$30), sem double-count
 * - Mikely (fiado antigo): ainda não quitou — não inventar quitação
 */
import "./load-env";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-08-24";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
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

async function main() {
  const salesList: DraftSale[] = [
    sale({
      time: "09:00",
      clientName: "Jackson Mendes Pinheiro",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:05",
      clientName: "Leonardo De Sousa Sena",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:10",
      clientName: "Anselmo Gabriel Freire Da Silva",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:15",
      clientName: "Mardem Leandro De Almeida Adonias",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:20",
      clientName: "Joaquim Neto",
      productName: P.unknown,
      quantity: 2,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:25",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:30",
      clientName: "Yasmin Michelle Nunes Rodrigues",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:35",
      clientName: "Nu Pagamentos S.A. - Instituição De Pagamento",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · Pix Nubank sem nome real · sabor não anotado.",
    }),
    sale({
      time: "09:40",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    sale({
      time: "09:45",
      clientName: "Raimunda Raimunda Sousa",
      productName: P.unknown,
      quantity: 1,
      notes: "Unifor & Acal · sabor não anotado · Pix.",
    }),
    // PIX "Henrique Alberto…" = pagamento do lote do trabalho (não double-count na lista).
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 3 Mistão frito + 1 Croissant + 1 Mistão forno + 1 Carne forno · 100% vendidos (R$30). PIX via Henrique Alberto Matos Da Rocha.",
    }),
    sale({
      time: "15:00",
      clientName: "Vanderson Dias",
      productName: P.unknown,
      quantity: 2,
      paymentMethod: "cash",
      notes: "Unifor & Acal · espécie · sabor não anotado.",
    }),
    sale({
      time: "16:00",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 2,
      paymentStatus: "pending",
      notes: "Fiado avisado — prometeu pagar amanhã (25/08); fat. fica no 24/08 quando quitar.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 21) throw new Error(`Units vendidas ${units} ≠ 21 (19 pago + 2 fiado)`);

  const paidUnits = salesList
    .filter((s) => s.paymentStatus !== "pending")
    .reduce((n, s) => n + s.quantity, 0);
  if (paidUnits !== 19) throw new Error(`Units pagas ${paidUnits} ≠ 19`);

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
        { name: P.carneForno, quantity: 4 },
        { name: P.croissant, quantity: 4 },
        { name: P.mistaoForno, quantity: 4 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 7 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.croissant, quantity: 1 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.carneForno, quantity: 1 },
      ],
    },
    summary: {
      revenue: 95,
      profit: 45,
      quantitySold: 21,
      quantityLost: 1,
      lossReason:
        "1 salgado sem aviso (suspeita Mikelly). Não quitado — registrado como perda.",
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 22 un = R$77 (Mistão frito 10 · Carne forno 4 · Croissant 4 · Mistão forno 4).",
      "Custo próprio R$50 + Terceiros R$27 · bônus R$0.",
      "Henrique 6 (todos vendidos R$30) · Unifor & Acal 16 (13 pagos + 2 fiado Ana Laura + 1 perda).",
      "Lista paga 19 un | R$95 (inclui PIX Henrique Alberto = lote Colegas, sem double-count).",
      "Fiado: Ana Laura 2 (amanhã). Perda: 1. Inventário 22/22.",
      "Fat. esperado R$110 · real recebido R$95 · pend. R$10 · lucro R$45 (= 95 − 50).",
      "Mikely (fiado antigo): ainda não — cobrar amanhã; NÃO inventar quitação no 24.",
      "OBS: integrar Mercado Pago (ideia registrada).",
      "Cofrinho prático (rascunho): R$1.687,74 (com rendimento — conferir extrato).",
    ].join("\n"),
    manualInsights:
      "Sabores Unifor/Acal não anotados (não estava presente). Canal Henrique fecha 6/6.",
    lessonsLearned:
      "Pix Nubank sem nome real (Nu Pagamentos) — cruzar com contexto no dia. Fiado Ana Laura avisou; perda sem aviso = custo.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(
    `Preview: ${units} un vendidas · 1 perda · fat R$95 · pend R$10 · lucro R$45 · custo próprio R$50`,
  );

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 24/08 ausente após commit");

  await upsertDiaryEntry({
    ...entry,
    profit: 45,
    bonusIncome: undefined,
    quantitySold: 21,
    quantityLost: 1,
    lossReason: plan.summary.lossReason,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: 95,
      pending: 10,
      total: 105,
    },
    sales: {
      paidCount: 19,
      creditCount: 2,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$45 · fat R$95 (+ R$10 pend.) · perda 1`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
