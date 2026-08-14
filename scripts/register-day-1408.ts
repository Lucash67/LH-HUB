/**
 * Registra 14/08/2026 — Salgados (parcial, a partir da nota de sexta).
 * Uso: pnpm tsx scripts/register-day-1408.ts
 *
 * Situação às ~09h35 (manhã):
 * - Compra 23 un · R$80,50 (próprio R$80 + Henrique R$0,50)
 * - Vendidos 11 · fat R$55 · lucro parcial ~R$16,74
 * - 12 un ainda em estoque (não são perda)
 * Atualizar no fim do dia quando a nota fechar.
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

const DATE = "2026-08-14";
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
  // Manhã Acal (6) + Henrique (5) = 11
  const salesList: DraftSale[] = [
    sale({
      time: "11:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 2 Mistão frito + 2 Croissant + 1 Mistão forno · 100% vendidos (R$25).",
    }),
    sale({
      time: "09:00",
      clientName: "Leonardo De Sousa Sena",
      productName: P.unknown,
      quantity: 2,
      notes: "Sabor não anotado · Pix.",
    }),
    sale({
      time: "09:05",
      clientName: "Rodrigo David Gadelha De Sousa",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado · Pix.",
    }),
    sale({
      time: "09:10",
      clientName: "Francisco Ricardo Feijão Pinho",
      productName: P.unknown,
      quantity: 1,
      notes: "Sabor não anotado · Pix.",
    }),
    sale({
      time: "09:15",
      clientName: "Ielda Maria Bezerra Lima",
      productName: P.unknown,
      quantity: 2,
      notes: "Sabor não anotado · Pix.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 11) throw new Error(`Units vendidas ${units} ≠ 11`);

  // Lucro parcial: fat − custo próprio proporcional às un vendidas
  const ownCost = 80;
  const totalUnits = 23;
  const revenue = 55;
  const profitPartial = Math.round((revenue - (ownCost * units) / totalUnits) * 100) / 100; // 16.74

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 23,
      investment: 80.5,
      ownInvestment: 80,
      thirdParty: { name: "Henrique", amount: 0.5 },
      products: [
        { name: P.mistaoFrito, quantity: 11 },
        { name: P.croissant, quantity: 5 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 4 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 9 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 2 },
        { name: P.croissant, quantity: 2 },
        { name: P.mistaoForno, quantity: 1 },
      ],
    },
    summary: {
      revenue,
      profit: profitPartial,
      quantitySold: 11,
      quantityLost: 0,
      lossReason: undefined,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "⚠️ REGISTRO PARCIAL (manhã) — atualizar no fim do dia.",
      "Encomenda 23 un = R$80,50 (próprio R$80 + Henrique R$0,50).",
      "Henrique 5 un · 100% vendidos R$25.",
      "Acal manhã: Leonardo 2 · Rodrigo 1 · Ricardo Feijão 1 · Ielda 2 (= 6 un).",
      "Fat. parcial R$55 (11×5) · lucro parcial R$16,74 · 12 un ainda em estoque (não perda).",
      "Esperado fim do dia: fat R$115 · lucro R$60 (conforme nota).",
      "Cofrinho teórico ontem (13): R$1.263,50 — atualizar após fechar o 14.",
    ].join("\n"),
    manualInsights:
      "Parcial para a dash de sexta. Completar lista da manhã/tarde e fechar fat/lucro no fim do dia.",
    lessonsLearned: undefined,
  };

  console.log(`\n======== SALGADOS ${DATE} (parcial) ========`);
  console.log(`Preview: ${units} un · fat R$${revenue} · lucro ~R$${profitPartial} · estoque restante 12`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 14/08 ausente após commit");

  await upsertDiaryEntry({
    ...entry,
    profit: profitPartial,
    bonusIncome: undefined,
    quantitySold: 11,
    quantityLost: 0,
    lossReason: undefined,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: revenue,
      pending: 0,
      total: revenue,
    },
    sales: {
      paidCount: 11,
      creditCount: 0,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  const after = await getDiaryEntry(BUSINESS, DATE);
  console.log(
    `✅ ${DATE} OK (parcial) — ${nSales} tickets · fat R$${after?.revenue?.received} · lucro R$${after?.profit} · sold ${after?.quantitySold} · lost ${after?.quantityLost}`,
  );
  console.log("Atualizar no fim do dia quando a nota fechar.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
