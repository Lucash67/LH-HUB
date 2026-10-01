/**
 * Registra 22/09/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-day-2209.ts
 *
 * Confirmado: lucro R$70 com a quitação do Gerb (18/09) dentro dos R$140, sem somar de novo.
 * Henrique 5 un · R$25. Laura 2 queijo fiado (R$10) pendente, fora do lucro.
 * Cofrinho prático → R$3.096,99.
 */
import "./load-env";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { setPracticalProfitBankBalance } from "../src/lib/profit-bank-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const DATE = "2026-09-22";
const BUSINESS = "salgados";
const ACAL = "Acal";
const HENRIQUE = "Colegas do Henrique";
const PROFIT = 70;
const RECEIVED = 140;
const PENDING = 10;
const PRACTICAL = 3096.99;

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
    ["07:35", "Hellen Alessandra Oliveira Costa", 1],
    ["08:50", "Bruno Jose Furtado E Silva", 1],
    ["08:52", "Maria Clara Gomes Mororo", 1],
    ["08:59", "Valentina Macedo Barbosa", 1],
    ["09:14", "Cicero Carlos Azevedo Dos Santos", 1],
    ["09:20", "Rayca Mirella Carvalho De Lima", 3],
    ["09:27", "Joaquim Neto", 2],
    ["09:42", "Aluízio Vitoriano Pereira Filho", 1],
    ["09:50", "João Pedro De Souza Pereira Marques", 3],
    [
      "09:57",
      "Gerb Da Silva Maganos",
      2,
      "1 un é quitação de 18/09. Já dentro dos R$140 e do lucro R$70; não somar de novo.",
    ],
    ["10:03", "Lucas Moraes", 1],
    ["10:03", "João Guilherme Da Silva Lima", 2],
    ["15:52", "Andressa Da Silva Monte", 1],
    ["16:38", "Francisco Vanderson Oliveira Dias", 1],
    ["17:48", "Henrique Alberto Matos Da Rocha", 5, "Trabalho do Henrique — 5/5 vendidos R$25."],
    ["19:06", "João Victor dos Santos Carvalho", 1],
  ];

  const salesList: DraftSale[] = lines.map(([time, clientName, quantity, notes]) =>
    sale({
      time,
      clientName,
      quantity,
      department: time === "17:48" ? HENRIQUE : ACAL,
      notes,
    }),
  );
  salesList.push(
    sale({
      time: "18:01",
      clientName: "Otávio",
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie, entregue via Henrique (dinheiro trocado). Dentro dos R$140.",
    }),
    sale({
      time: "19:10",
      clientName: "Ana Laura",
      quantity: 2,
      productName: P.queijo,
      paymentStatus: "pending",
      notes: "Fiado 22/09 — 2 queijo frito R$10. Acumulado Laura 7 un · R$35, paga 30/09. Fora do lucro.",
    }),
  );

  const paid = unitsOf(salesList.filter((item) => item.paymentStatus !== "pending"));
  if (paid !== 28) throw new Error(`22/09 pagos ${paid} ≠ 28`);
  if (unitsOf(salesList) !== 30) throw new Error("22/09 total ≠ 30");

  return {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 32,
      investment: 98.5,
      ownInvestment: 70,
      thirdParty: { name: "Terceiros", amount: 28.5 },
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.croissant, quantity: 4 },
        { name: P.frango, quantity: 5 },
        { name: P.carneForno, quantity: 2 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.queijo, quantity: 5 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.croissant, quantity: 1 },
      ],
    },
    summary: { revenue: RECEIVED, profit: PROFIT, quantitySold: 29, quantityLost: 3, forecastProfit: 70 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Compra 32 un · R$98,50 (próprio R$70 + terceiros R$28,50). Cartão +3%; cobrado R$98,50.",
      "Lista paga 28 un · R$140. Inclui 1 un do Gerb, quitação de 18/09 — dentro do faturamento e do lucro, não somada de novo. Só do dia: R$135.",
      "Henrique 5/5 · R$25 (nota lista 6 sabores; vale 5). Otávio 1 un em espécie.",
      "Laura 2 queijo frito fiado · R$10, pendente até 30/09. Acumulado Laura 7 un · R$35.",
      "Perdas 3: 2 dados à Mikelly, 1 comido. Bônus R$0.",
      "Lucro R$70 (= 140 − 70). Cofrinho prático R$3.096,99.",
    ].join("\n"),
    manualInsights: "Lucro R$70 batendo com o esperado. Quitação do Gerb dentro do dia, sem acréscimo.",
    lessonsLearned: "Quitação entra no dia em que cai no banco, sem somar por cima do lucro anotado.",
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

  const diaryPatch = {
    profit: PROFIT,
    bonusIncome: undefined,
    quantitySold: 29,
    quantityLost: 3,
    revenue: { received: RECEIVED, pending: PENDING, total: RECEIVED + PENDING },
  };

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 22/09 ausente");
  await upsertDiaryEntry({
    ...entry,
    ...diaryPatch,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    sales: {
      paidCount: 28,
      creditCount: 2,
      fatherSale: { units: 5, amount: 25, buyerName: HENRIQUE },
    },
  });

  await fixDayPricing(BUSINESS, DATE);
  const after = await getDiaryEntry(BUSINESS, DATE);
  if (!after) throw new Error("Diário 22/09 sumiu após preço");
  if (after.profit !== PROFIT || after.revenue.received !== RECEIVED) {
    await upsertDiaryEntry({ ...after, ...diaryPatch });
  }

  const saved = await getDiaryEntry(BUSINESS, DATE);
  if (!saved || saved.profit !== PROFIT || saved.revenue.received !== RECEIVED || saved.revenue.pending !== PENDING) {
    throw new Error("22/09 não fechou em lucro 70 / rec 140 / pend 10");
  }

  await setPracticalProfitBankBalance(BUSINESS, PRACTICAL);
  console.log("✅ 2026-09-22 OK — lucro R$70 · rec R$140 · pend R$10 · cofrinho R$3.096,99");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
