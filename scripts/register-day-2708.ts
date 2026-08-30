/**
 * Registra 27/08/2026 — Salgados (rascunho oficial nas Notas).
 * Uso: pnpm tsx scripts/register-day-2708.ts
 *
 * - Compra 22 un · R$77 (próprio R$50 + Terceiros R$27)
 * - Vendidos 22 · R$110 · lucro R$60 · perda 0 · fiado novo 0
 * - Henrique 5 · R$25 (3 Mistão frito + 1 Mistão forno + 1 Carne forno)
 * - Acal/Unifor 17 · R$85
 * - Quitações: nenhuma neste dia (Mikely 21 + Ismael 24 seguem abertos)
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

const DATE = "2026-08-27";
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
    sale({ time: "09:00", clientName: "Joao Pedro Souza P Marques", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Diego Martins Pinheiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Juan Vasco Meneses Ferreira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Danilo Duarte Nobre", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Raimunda Raimunda Sousa", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Jose Maclaurem Rodrigues", productName: P.unknown, quantity: 3 }),
    sale({ time: "09:35", clientName: "Francisco De Assis Soares Pereira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Helano Clysman Fernandes Dos Santos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:45",
      clientName: "Jose Maclaurem Rodrigues",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({ time: "09:50", clientName: "Anselmo Gabriel", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:55",
      clientName: "Raimunda Raimunda Sousa",
      productName: P.unknown,
      quantity: 2,
      notes: "2ª compra do dia.",
    }),
    sale({ time: "10:00", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:05", clientName: "Arthur Cavalcante Passos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 3 Mistão frito + 1 Mistão forno + 1 Carne forno — 100% vendidos (R$25). PIX via Henrique.",
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
        { name: P.croissant, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.paoQueijo, quantity: 2 },
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
      "Encomenda 22 un = R$77 (Mistão frito 13 · Croissant 3 · Carne forno 2 · Mistão forno 2 · Pão de Queijo 2).",
      "Custo próprio R$50 + Terceiros R$27 · perdas 0 · fiado novo 0.",
      "Henrique 5 (R$25) · Acal/Unifor 17 (R$85) · inventário 22/22.",
      "Fat. dia R$110 · lucro operacional R$60 (= 110 − 50).",
      "Quitações neste dia: nenhuma (no 27). Mikely do 21 foi quitada depois, em 28/08. Ismael (24/08) segue em aberto.",
      "OBS: providenciar fidelidade, novo cardápio e estratégia anti-furto (Ideias).",
      "Cofrinho prático (rascunho): R$1.881,14 (com rendimento — conferir extrato).",
    ].join("\n"),
    manualInsights:
      "Dia limpo (22/22). No 27 não entrou quitação. Mikely resolvida no 28; Ismael ainda pendente.",
    lessonsLearned:
      "Providenciar fidelidade, novo cardápio e estratégia para ninguém me roubar mais.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$110 · lucro R$60`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 27/08 ausente");

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
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$110`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
