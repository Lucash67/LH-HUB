/**
 * Registra 03/09/2026 — Salgados (Notas + confirmação Cursor).
 * Uso: pnpm tsx scripts/register-day-0309.ts
 *
 * - Compra 22 un · R$77 (próprio R$0 + Terceiros R$77) · bônus R$17
 * - 22 un pagas · fat R$110 · lucro op R$110 · cofrinho R$127
 * - Henrique 5 · R$25 · descartado “Não identificado” (lista ia a 23)
 * - Fiados abertos: Anderson, Rodrigues, Ana Laura
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

const DATE = "2026-09-03";
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

async function main() {
  const salesList: DraftSale[] = [
    sale({ time: "09:00", clientName: "Francisco Vanderson Oliveira Dias", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Ana Angelica Magalhaes Martins", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:10", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Cássio Adriel De Oliveira Silva", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Jackson Mendes Pinheiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Lucas Moraes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:35", clientName: "Maria Lusangela A C Sousa", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:40", clientName: "Anselmo Gabriel", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:45", clientName: "Mardem Leandro De Almeida Adonias", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:50", clientName: "Danilo Duarte Nobre", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:55",
      clientName: "Mardem Leandro De Almeida Adonias",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 4 Mistão frito + 1 Frango c/ catupiry — 100% vendidos (R$25).",
    }),
    sale({
      time: "12:30",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 1,
      notes: "Compra Acal (além do lote Colegas).",
    }),
    sale({
      time: "14:00",
      clientName: "Anselmo Gabriel",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({
      time: "15:00",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 22) throw new Error(`Units ${units} ≠ 22 (descartado Não identificado)`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 22,
      investment: 77,
      ownInvestment: 0,
      thirdParty: { name: "Terceiros", amount: 77 },
      products: [
        { name: P.mistaoFrito, quantity: 9 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.paoQueijo, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 5 },
        { name: P.frangoCat, quantity: 2 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.paoQueijo, quantity: 1 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.frangoCat, quantity: 1 },
      ],
    },
    summary: {
      revenue: 110,
      profit: 110,
      quantitySold: 22,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 22 un = R$77 (Mistão frito 9 · Frango c/ catupiry 3 · Croissant 3 · Carne forno 3 · Mistão forno 3 · Pão de queijo 1).",
      "Custo próprio R$0 + Terceiros R$77 · bônus Henrique R$17.",
      "Henrique 5 (R$25) · Acal/Unifor 17 · inventário 22/22.",
      "Lista tinha 23ª linha “Não identificado / pagamento não localizado” — descartada; dia canônico = 22 un · R$110.",
      "Fat. dia R$110 · recebido R$110 · lucro op R$110 · cofrinho R$127 (op + bônus).",
      "Fiados abertos: Anderson das Chagas R$5 (24/08) · Jose Maclaurem Rodrigues R$5 (31/08) · Ana Laura R$5 (02/09).",
      "Cofrinho prático (rascunho): R$2.258,00 (com rendimento).",
      "OBS: fidelidade / cardápio / anti-furto (Ideias).",
    ].join("\n"),
    manualInsights:
      "Dia 100% capital família + bônus R$17 → cofrinho R$127. Meta diária R$60 amplamente superada no cofrinho.",
    lessonsLearned: "Conferir lista vs inventário (23 na lista → 22 reais).",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$110 · lucro op R$110 + bônus R$17 = R$127 · compra 22/R$77 own 0`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 03/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 110,
    bonusIncome: 17,
    bonusIncomeDescription: "Bonificação do Henrique: R$17,00.",
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
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro op R$110 · bônus R$17 · fat R$110`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
