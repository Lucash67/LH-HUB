/**
 * Registra 31/08/2026 — Salgados (último dia do mês · rascunho nas Notas).
 * Uso: pnpm tsx scripts/register-day-3108.ts
 *
 * - Compra 26 un · cobrado R$77 (teoria R$91) · próprio R$40 + Terceiros R$37
 * - Vendidos 20 · fat R$100 · recebido R$95 · pend. R$5 (Rodrigues) · lucro R$55
 * - Henrique 5 · R$25 · Graziele espécie R$5
 * - Sobra 6 un. no trabalho — perda NÃO lançada (conferir 01/09)
 * - Ismael 24/08 continua pendente
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

const DATE = "2026-08-31";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
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

async function main() {
  const salesList: DraftSale[] = [
    sale({ time: "09:00", clientName: "Arthur Xavier De Magalhaes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Joao Victor Dos Santos Carvalho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Francisco Nazareno Da Silva Raquel", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Natalia Sena Queiroz", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Juan Vasco Meneses Ferreira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:35", clientName: "Mardem Leandro De Almeida Adonias", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Francisco Vanderson Oliveira Dias", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:45",
      clientName: "Mardem Leandro De Almeida Adonias",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({ time: "09:50", clientName: "Dayanna Kelly Costa Almeida", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:55", clientName: "Andressa Da Silva Monte", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "Hilmanita Carvalho Parente", productName: P.unknown, quantity: 1 }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 4 Mistão frito + 1 Frango com Catupiry — 100% vendidos (R$25). PIX via Henrique.",
    }),
    sale({
      time: "15:00",
      clientName: "Maria Graziele Santos Oliveira",
      productName: P.unknown,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie (Grazi).",
    }),
    sale({
      time: "16:00",
      clientName: "Jose Maclaurem Rodrigues",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado — irá pagar no dia seguinte (01/09).",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 20) throw new Error(`Units ${units} ≠ 20`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 26,
      investment: 77,
      ownInvestment: 40,
      thirdParty: { name: "Terceiros", amount: 37 },
      products: [
        { name: P.mistaoFrito, quantity: 14 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.frangoCat, quantity: 4 },
        { name: P.carneFrito, quantity: 4 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.carneFrito, quantity: 4 },
        { name: P.frangoCat, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.frangoCat, quantity: 1 },
      ],
    },
    summary: {
      revenue: 100,
      profit: 55,
      quantitySold: 20,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 26 un (teoria R$91) · cobrado R$77 (Mistão frito 14 · Mistão forno 4 · Frango c/ catupiry 4 · Carne frito 4).",
      "Custo próprio R$40 + Terceiros R$37 · bônus R$0.",
      "Henrique 5 (R$25) · Acal/Unifor 15 pagos + 1 fiado Rodrigues · inventário vendido 20/26.",
      "Sobra 6 un. deixadas no trabalho — perda NÃO lançada; conferir em 01/09 se houve furto.",
      "Fat. dia R$100 · recebido R$95 · pend. R$5 (Jose Maclaurem Rodrigues) · lucro R$55 (= 95 − 40).",
      "Espécie: Maria Graziele Santos Oliveira R$5.",
      "Ismael (24/08) continua pendente. OBS: fidelidade / cardápio / anti-furto (Ideias).",
      "Cofrinho prático (rascunho): R$2.007,08 (com rendimento).",
    ].join("\n"),
    manualInsights:
      "Último dia do mês. 6 un. em aberto no local de trabalho — fechar perda/sobra em 01/09 antes do Retrato mensal.",
    lessonsLearned:
      "Não sair sem contar sobra. Fiado Rodrigues para quitar em 01/09.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un vendidas · fat R$100 · rec R$95 · pend R$5 · lucro R$55 · compra 26/R$77`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 31/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 55,
    bonusIncome: undefined,
    quantitySold: 20,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 95, pending: 5, total: 100 },
    sales: {
      paidCount: 19,
      creditCount: 1,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$55 · fat R$100 · rec R$95 · pend R$5`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
