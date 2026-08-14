/**
 * Registra 12–13/08/2026 — Salgados (a partir das Notas).
 * Uso: pnpm tsx scripts/register-days-1208-1308.ts
 *
 * 12/08: 30 un · R$87 próprio · 29 vendidos · 1 perda · fat R$145 · lucro R$58
 * 13/08: 23 un · R$80,50 (próprio 55 + Flaviana 25,50) · 22 vendidos · 1 perda · fat R$110 · lucro R$55
 * Cofrinho teórico fim 13: R$1.263,50
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

const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
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

function assertUnits(list: DraftSale[], expected: number, label: string) {
  const n = list.reduce((s, x) => s + x.quantity, 0);
  if (n !== expected) throw new Error(`${label}: units ${n} ≠ ${expected}`);
}

async function registerDay(plan: DayRegistrationPlan, extras: {
  profit: number;
  quantitySold: number;
  quantityLost: number;
  lossReason?: string;
  revenueReceived: number;
  fatherSale?: { units: number; amount: number; buyerName: string };
}) {
  console.log(`\n======== SALGADOS ${plan.date} ========`);
  await cleanupOperationDay(BUSINESS, plan.date);
  const existing = await countSalesForDate(BUSINESS, plan.date);
  if (existing > 0) throw new Error(`${plan.date}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} ticket(s) · diary ${result.diaryId}`);

  const hasFamily = (plan.purchase?.thirdParty?.amount ?? 0) > 0.01;
  if (hasFamily) await fixDayPricing(BUSINESS, plan.date);

  const entry = await getDiaryEntry(BUSINESS, plan.date);
  if (!entry) throw new Error(`Diário ${plan.date} ausente`);

  await upsertDiaryEntry({
    ...entry,
    profit: extras.profit,
    bonusIncome: undefined,
    quantitySold: extras.quantitySold,
    quantityLost: extras.quantityLost,
    lossReason: extras.lossReason,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: {
      received: extras.revenueReceived,
      pending: 0,
      total: extras.revenueReceived,
    },
    sales: {
      paidCount: extras.quantitySold,
      creditCount: 0,
      fatherSale: extras.fatherSale,
    },
  });

  const n = await countSalesForDate(BUSINESS, plan.date);
  const after = await getDiaryEntry(BUSINESS, plan.date);
  console.log(
    `✅ ${plan.date} OK — ${n} tickets · fat R$${after?.revenue?.received} · lucro R$${after?.profit} · sold ${after?.quantitySold} · lost ${after?.quantityLost}`,
  );
}

async function main() {
  // ——— 12/08 ———
  const sales12: DraftSale[] = [
    // Henrique 12 — todos vendidos
    sale({
      time: "11:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 12,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 3 Mistão frito + 3 Croissant + 3 Carne forno + 3 Mistão forno · 100% vendidos (R$60).",
    }),
    // Unifor manhã
    sale({
      time: "08:20",
      clientName: "Xavier",
      productName: P.croissant,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "08:20",
      clientName: "Xavier",
      productName: P.mistaoForno,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "08:25",
      clientName: "Pedro de Castro",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
      paymentMethod: "pix",
    }),
    sale({
      time: "08:30",
      clientName: "João Victor",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    // Acal manhã
    sale({ time: "09:00", clientName: "Leonardo de Sousa", productName: P.unknown, quantity: 2, notes: "Sabor não visto." }),
    sale({ time: "09:05", clientName: "Andressa", productName: P.unknown, quantity: 1, notes: "Sabor não visto." }),
    sale({ time: "09:10", clientName: "Nathanel", productName: P.unknown, quantity: 1, notes: "Sabor não visto." }),
    sale({ time: "09:40", clientName: "Ana Laura", productName: P.unknown, quantity: 1, notes: "Sabor não visto." }),
    sale({
      time: "09:45",
      clientName: "Maria Clara Mororo",
      productName: P.unknown,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Sabor não visto · espécie.",
    }),
    sale({
      time: "09:50",
      clientName: "Francisco Anderson das Chagas",
      productName: P.unknown,
      quantity: 2,
      notes: "Sabor não visto.",
    }),
    // Tarde
    sale({ time: "14:00", clientName: "Ana Angélica", productName: P.unknown, quantity: 1, notes: "Sabor não visto." }),
    sale({ time: "14:20", clientName: "Francisco Bruno", productName: P.unknown, quantity: 2, notes: "Sabor não visto." }),
    sale({ time: "15:00", clientName: "Ana Laura", productName: P.unknown, quantity: 1, notes: "Sabor não visto." }),
  ];
  assertUnits(sales12, 28, "12/08");

  const plan12: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: "2026-08-12",
    purchase: {
      totalUnits: 30,
      investment: 87,
      ownInvestment: 87,
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.croissant, quantity: 6 },
        { name: P.carneForno, quantity: 6 },
        { name: P.mistaoForno, quantity: 6 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 9 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
      ],
    },
    summary: {
      revenue: 140,
      profit: 53,
      quantitySold: 28,
      quantityLost: 2,
      lossReason:
        "2 roubos no dia (sem quitação neste dia). Anderson quitou fiado do 11, não destes.",
      forecastProfit: 63,
    },
    sales: sales12,
    newClients: clientsFromSales(sales12),
    observations: [
      "Encomenda 30 un = R$87 (100% próprio).",
      "Henrique 12 un · 100% vendidos R$60.",
      "Unifor/Acal: 16 un na lista + 2 perdas = 18.",
      "Fat. R$140 (28×5) · lucro R$53. Quitação Anderson é do 11/08 (não entra no fat. do 12).",
      "Rascunho citava fat R$145 / lucro R$58 contando a quitação no caixa do 12 — no sistema a quitação fica no 11.",
      "Cofrinho teórico pós-12: R$1.208,50.",
    ].join("\n"),
    manualInsights:
      "Quitação Anderson atualiza o 11/08. Claudia no 13 = 1 un. Estagiário loiro: perda até avisar.",
    lessonsLearned:
      "Vigilância ainda frágil quando salgados ficam sozinhos — 2 tentativas de roubo no dia.",
  };

  await registerDay(plan12, {
    profit: 53,
    quantitySold: 28,
    quantityLost: 2,
    lossReason: plan12.summary.lossReason,
    revenueReceived: 140,
    fatherSale: { units: 12, amount: 60, buyerName: "Colegas do Henrique" },
  });

  // ——— 13/08 ———
  // Lista Unifor/Acal + Henrique. Claudia = 1 un (confirmado). Perda = estagiário loiro.
  const sales13: DraftSale[] = [
    sale({
      time: "11:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 2 Mistão frito + 2 Croissant + 1 Mistão forno · 100% vendidos (R$25).",
    }),
    sale({
      time: "08:20",
      clientName: "Xavier",
      productName: P.carneForno,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "08:20",
      clientName: "Xavier",
      productName: P.mistaoForno,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "08:25",
      clientName: "João Victor",
      productName: P.croissant,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({ time: "09:00", clientName: "Aluízio Vitoriano Pereira Filho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Ismael Silva da Paz", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Diego Martins Pinheiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Bernardo Ferreira Domingo", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:20",
      clientName: "Francisco Anderson Das Chagas Xavier Rocha",
      productName: P.unknown,
      quantity: 2,
    }),
    sale({ time: "09:25", clientName: "Hilmanita Carvalho Parente", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "João Pedro De Souza Pereira Marques", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:35", clientName: "Maria Mikelly Monteiro Coutinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Ana Laura Ferreira Pinto", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:45", clientName: "Francisco Nazareno Da Silva Raquel", productName: P.unknown, quantity: 1 }),
    sale({ time: "14:00", clientName: "Francisco De Assis Soares Pereira", productName: P.unknown, quantity: 1 }),
    sale({
      time: "14:30",
      clientName: "Claudia Roberta Gagliardi",
      productName: P.unknown,
      quantity: 1,
      notes:
        "Rascunho: 2 un. Registrado 1 un para fechar fat. R$110 (22×5). CONFERIR se foram 1 ou 2.",
    }),
  ];
  assertUnits(sales13, 22, "13/08");

  const plan13: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: "2026-08-13",
    purchase: {
      totalUnits: 23,
      investment: 80.5,
      ownInvestment: 55,
      thirdParty: { name: "Flaviana", amount: 25.5 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.croissant, quantity: 5 },
        { name: P.carneForno, quantity: 4 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 8 },
        { name: P.croissant, quantity: 3 },
        { name: P.carneForno, quantity: 4 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.queijoFrito, quantity: 1 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 2 },
        { name: P.croissant, quantity: 2 },
        { name: P.mistaoForno, quantity: 1 },
      ],
    },
    summary: {
      revenue: 110,
      profit: 55,
      quantitySold: 22,
      quantityLost: 1,
      lossReason:
        "1 un roubada — estagiário loiro baixo (ainda sem nome). Conta como perda até quitação; se pagar depois, atualizar este dia.",
      forecastProfit: 60,
    },
    sales: sales13,
    newClients: clientsFromSales(sales13),
    observations: [
      "Encomenda 23 un = R$80,50 (próprio R$55 + Flaviana R$25,50) incl. 1 Queijo Frito.",
      "Henrique 5 un · 100% vendidos R$25.",
      "Fat. R$110 (22×5) · lucro R$55 · esperado R$115 / R$60.",
      "Lista Unifor/Acal somava 18 un pagas; fat. pede 17 + 1 perda. Claudia registrada 1 (rascunho 2) — CONFERIR.",
      "Roubo do estagiário: perda até receber; se pagar amanhã, quitar neste 13/08.",
      "Cofrinho teórico: R$1.263,50 · prático R$1.268,03.",
    ].join("\n"),
    manualInsights:
      "Claudia = 1 un (confirmado). Estagiário loiro: perda até avisar pagamento.",
    lessonsLearned:
      "Identificar o estagiário loiro para cobrança. Novo sabor no pedido: Queijo Frito.",
  };

  await registerDay(plan13, {
    profit: 55,
    quantitySold: 22,
    quantityLost: 1,
    lossReason: plan13.summary.lossReason,
    revenueReceived: 110,
    fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
  });

  console.log("\n======== COFRINHO ========");
  console.log("Esperado teórico fim 13/08: R$1.263,50 (= 1.150,50 − 60 + 65 + 53 + 55)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
