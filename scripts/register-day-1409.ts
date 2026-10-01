/**
 * Registra 14/09/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-day-1409.ts
 *
 * Confirmado: Israel R$5 é quitação de outro dia, já dentro dos R$155/R$75.
 * 2 fiados sem nome (R$10) ficam pendentes, fora da lista. Lucro R$75.
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

const DATE = "2026-09-14";
const BUSINESS = "salgados";
const ACAL = "Acal";
const HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  frango: "Frango com Catupiry",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  queijo: "Queijo Frito",
  unknown: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
} as const;

function sale(
  partial: Omit<DraftSale, "paymentMethod" | "paymentStatus" | "department"> &
    Partial<Pick<DraftSale, "paymentMethod" | "paymentStatus" | "department">>,
): DraftSale {
  return {
    paymentMethod: "pix",
    paymentStatus: "paid",
    department: ACAL,
    productName: P.unknown,
    ...partial,
  };
}

function clientsFromSales(salesList: DraftSale[]): DayRegistrationPlan["newClients"] {
  const seen = new Set<string>();
  const out: DayRegistrationPlan["newClients"] = [];
  for (const item of salesList) {
    const key = item.clientName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: item.clientName, sector: item.department, notes: `Cliente — ${item.department}` });
  }
  return out;
}

function unitsOf(list: DraftSale[]): number {
  return list.reduce((n, item) => n + item.quantity, 0);
}

function buildPlan(): DayRegistrationPlan {
  const lines: Array<[string, string, number, string?]> = [
    ["08:14", "Henrique Alberto Matos Da Rocha", 6, "Trabalho do Henrique — 6/6 vendidos R$30."],
    ["08:45", "Maria Emanuela Sansão Pereira", 1],
    ["08:52", "Vitoria Sammya Oliveira De Souza", 1],
    ["08:52", "Priscilla Vitoria Lima", 1],
    ["08:53", "Priscilla Vitoria Lima", 1],
    ["09:02", "Jackson Mendes Pinheiro", 1],
    ["09:04", "Cássio Adriel De Oliveira Silva", 2],
    ["09:05", "Diego Martins Pinheiro", 1],
    ["09:09", "Mardem Leandro De Almeida Adonias", 1],
    ["09:09", "Leonardo De Sousa Sena", 1],
    ["09:13", "Maria Eduarda Da Silva Santos", 1],
    ["09:45", "Maria Lusangela A C Sousa", 1],
    ["09:45", "Francisco Vanderson Oliveira Dias", 1],
    [
      "09:49",
      "Israel Ferreira De Freitas",
      1,
      "Quitação de outro dia, origem não lembrada. Já entra nos R$155 e no lucro R$75; não somar de novo.",
    ],
    ["09:54", "Maria Graziele Dos Santos Oliveira", 1],
    ["09:58", "Maria Clara Gomes Mororo", 1],
    ["10:06", "Dayanna Kelly Costa Almeida", 1],
    ["10:15", "Gerb Da Silva Maganos", 1],
    ["11:12", "Francisco Anderson Das Chagas Xavier Rocha", 1],
    ["13:23", "Francisca Laize De Oliveira Ribeiro", 1],
    ["13:33", "Francisco Nazareno Da Silva Raquel", 1],
    ["15:05", "Mardem Leandro De Almeida Adonias", 1],
    ["15:09", "Leonardo De Sousa Sena", 1],
    ["15:25", "Mardem Leandro De Almeida Adonias", 1],
    ["18:09", "João Victor dos Santos Carvalho", 1],
  ];

  const salesList: DraftSale[] = lines.map(([time, clientName, quantity, notes]) =>
    sale({
      time,
      clientName,
      quantity,
      department: time === "08:14" ? HENRIQUE : ACAL,
      notes,
    }),
  );
  salesList.push(
    sale({
      time: "19:00",
      clientName: "Fiado não reconhecido A (14/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 14/09 sem nome. R$5. Fora da lista. Não entra no lucro.",
    }),
    sale({
      time: "19:01",
      clientName: "Fiado não reconhecido B (14/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 14/09 sem nome. R$5. Fora da lista. Não entra no lucro.",
    }),
  );

  const paid = unitsOf(salesList.filter((item) => item.paymentStatus !== "pending"));
  if (paid !== 31) throw new Error(`14/09 pagos ${paid} ≠ 31`);
  if (unitsOf(salesList) !== 33) throw new Error("14/09 total ≠ 33");

  return {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 32,
      investment: 93,
      ownInvestment: 80,
      thirdParty: { name: "Terceiros", amount: 13 },
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.croissant, quantity: 4 },
        { name: P.frango, quantity: 4 },
        { name: P.carneForno, quantity: 4 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.queijo, quantity: 4 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.queijo, quantity: 2 },
        { name: P.frango, quantity: 1 },
      ],
    },
    summary: { revenue: 155, profit: 75, quantitySold: 33, quantityLost: 0, forecastProfit: 60 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Compra 32 un · R$93 (own R$80 + terceiros R$13).",
      "Lista paga 31 un · R$155. Inclui Israel R$5, quitação de outro dia já dentro do faturamento e do lucro — não somada de novo.",
      "2 fiados sem nome · R$10, fora da lista, pendentes. Lucro R$75 (= 155 − 80).",
      "Henrique 6/6 · R$30. Sem perda. Bônus R$0.",
      "Cofrinho da nota R$2.703,80. Saldo prático não muda: 17/09 já está em R$2.957,95.",
    ].join("\n"),
    manualInsights: "Lucro R$75. Israel dentro do dia, sem acréscimo. Dois fiados sem nome seguem abertos.",
    lessonsLearned: "Quitação sem dia de origem fica no dia em que entrou no banco, sem somar por cima.",
  };
}

async function main() {
  const plan = buildPlan();
  console.log(`\n======== SALGADOS ${DATE} ========`);
  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 14/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 75,
    bonusIncome: undefined,
    quantitySold: 33,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 155, pending: 10, total: 165 },
    sales: {
      paidCount: 31,
      creditCount: 2,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  });

  await fixDayPricing(BUSINESS, DATE);
  const after = await getDiaryEntry(BUSINESS, DATE);
  if (!after) throw new Error("Diário 14/09 sumiu após preço");
  if (after.profit !== 75 || after.revenue.received !== 155) {
    await upsertDiaryEntry({
      ...after,
      profit: 75,
      bonusIncome: undefined,
      quantitySold: 33,
      quantityLost: 0,
      revenue: { received: 155, pending: 10, total: 165 },
    });
  }

  const saved = await getDiaryEntry(BUSINESS, DATE);
  if (!saved || saved.profit !== 75 || saved.revenue.received !== 155 || saved.revenue.pending !== 10) {
    throw new Error("14/09 não fechou em lucro 75 / rec 155 / pend 10");
  }
  console.log("✅ 2026-09-14 OK — lucro R$75 · rec R$155 · pend R$10");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
