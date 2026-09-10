/**
 * Registra 08/09/2026 — Salgados (Notas + confirmação Cursor).
 * Uso: pnpm tsx scripts/register-day-0809.ts
 *
 * - Compra 22 un · R$77 (próprio R$25 + Terceiros R$52) · bônus R$16
 * - Pagos 19 · R$95 · fiados 3 · R$15 (Ana Laura + 2 Desconhecido)
 * - Lucro op R$70 (= 95 − 25) · cofrinho dia R$86 (op + bônus)
 * - Henrique 6 · R$30 · Acal/Unifor 16
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

const DATE = "2026-09-08";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";
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

async function main() {
  const salesList: DraftSale[] = [
    sale({ time: "09:00", clientName: "Joaquim Francisco Da Silva Neto", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:10", clientName: "Lucas Moraes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Suellen Priscilla R Marculino", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:20", clientName: "Anselmo Gabriel", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Francisco Vanderson Oliveira Dias", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Davi Oliveira Da Silva Ayoub", productName: P.unknown, quantity: 2 }),
    sale({
      time: "09:35",
      clientName: "Francisco Anderson Das Chagas Xavier Rocha",
      productName: P.unknown,
      quantity: 2,
      notes: "Venda paga do dia (não confundir com fiado antigo 24/08).",
    }),
    sale({
      time: "09:40",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 4 Mistão frito + 1 Croissant + 1 Mistão forno — 100% vendidos (R$30).",
    }),
    sale({
      time: "15:00",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 08/09 — R$5. Quitado em 09/09 (fat. permanece no 08/09).",
    }),
    sale({
      time: "15:05",
      clientName: "Desconhecido",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 08/09 — R$5 (NN #1). Quitado em 09/09 (fat. permanece no 08/09).",
    }),
    sale({
      time: "15:10",
      clientName: "Desconhecido",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 08/09 — R$5 (NN #2). Quitado em 09/09 (fat. permanece no 08/09).",
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
      ownInvestment: 25,
      thirdParty: { name: "Terceiros", amount: 52 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 6 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.croissant, quantity: 1 },
        { name: P.mistaoForno, quantity: 1 },
      ],
    },
    summary: {
      revenue: 110,
      profit: 70,
      quantitySold: 22,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 22 un = R$77 (Mistão frito 10 · Frango c/ catupiry 3 · Croissant 4 · Carne forno 3 · Mistão forno 1 · Queijo frito 1).",
      "Custo próprio R$25 + Terceiros R$52 · bônus Henrique R$16.",
      "Henrique 6 (R$30) · Acal/Unifor 16 (13 pagos + 3 fiados) · inventário 22/22.",
      "Pagos 19 · R$95 · fiados Ana Laura + 2 Desconhecido · R$15 · lucro op R$70 (= 95 − 25) · cofrinho R$86 (op + bônus).",
      "Nota: alocação Acal citava “pão de queijo” — canônico Queijo Frito (mesmo item da encomenda).",
      "Fiados abertos neste momento: Anderson 24/08 · Rodrigues 31/08 · Ana Laura 02/09 · + 3 do 08/09.",
      "Cofrinho prático (rascunho): R$2.380,25 (com rendimento).",
      "OBS: fidelidade / cardápio / anti-furto (Ideias).",
    ].join("\n"),
    manualInsights:
      "Split favorável (own R$25). Bônus R$16 empurra cofrinho para R$86; 3 fiados ainda pendentes até 09/09.",
    lessonsLearned: "Terceiros = R$52 (não R$77). Queijo frito = produto canônico (não Pão de Queijo).",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: 19 pagos + 3 fiados · fat R$110 · rec R$95 · lucro R$70 + bônus R$16 · compra 22/R$77 own 25`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 08/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 70,
    bonusIncome: 16,
    bonusIncomeDescription: "Bonificação do Henrique: R$16,00.",
    quantitySold: 22,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 95, pending: 15, total: 110 },
    sales: {
      paidCount: 19,
      creditCount: 3,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$70 · bônus R$16 · fat R$110 · rec R$95 · pend R$15`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
