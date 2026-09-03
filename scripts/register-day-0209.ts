/**
 * Registra 02/09/2026 — Salgados (Notas + confirmação Cursor).
 * Uso: pnpm tsx scripts/register-day-0209.ts
 *
 * - Compra 20 un · R$70 (próprio R$30 + Terceiros R$40)
 * - Pagos 18 · R$90 · fiado Ana Laura R$5 · perda 1 · lucro R$60
 * - Henrique 5 · R$25 · espécie: Vanderson, Ismael, Ana Laura (2ª)
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

const DATE = "2026-09-02";
const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  frangoCat: "Frango com Catupiry",
  carneFrito: "Carne Frito",
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
    sale({ time: "09:00", clientName: "Alexsandro Soares De Souza", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Francisco De Assis Soares Pereira", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Raimunda Raimunda Sousa", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:15", clientName: "Maria Lusangela A C Sousa", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Davi Oliveira Da Silva Ayoub", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:25", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:30", clientName: "Paulo Andre C Oliveira", productName: P.unknown, quantity: 1 }),
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 5,
      department: DEPT_HENRIQUE,
      notes: "Trabalho do Henrique — 3 Frango c/ catupiry + 2 Mistão forno — 100% vendidos (R$25).",
    }),
    sale({
      time: "14:00",
      clientName: "Francisco Vanderson Oliveira Dias",
      productName: P.unknown,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie (depois convertida p/ Pix no banco pessoal — no sistema fica espécie).",
    }),
    sale({
      time: "14:10",
      clientName: "Ismael Silva da Paz",
      productName: P.unknown,
      quantity: 2,
      paymentMethod: "cash",
      notes: "Espécie (depois convertida p/ Pix no banco pessoal — no sistema fica espécie).",
    }),
    sale({
      time: "14:20",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 2,
      paymentMethod: "cash",
      notes: "Espécie (depois convertida p/ Pix no banco pessoal — no sistema fica espécie).",
    }),
    sale({
      time: "15:00",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado — pagará sexta-feira 04/09/2026.",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 19) throw new Error(`Units ${units} ≠ 19 (18 pagos + 1 fiado; perda à parte)`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 20,
      investment: 70,
      ownInvestment: 30,
      thirdParty: { name: "Terceiros", amount: 40 },
      products: [
        { name: P.mistaoForno, quantity: 6 },
        { name: P.frangoCat, quantity: 6 },
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.carneFrito, quantity: 2 },
        { name: P.carneForno, quantity: 2 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.frangoCat, quantity: 3 },
        { name: P.carneFrito, quantity: 2 },
        { name: P.carneForno, quantity: 2 },
      ],
      fatherAllocation: [
        { name: P.frangoCat, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
      ],
    },
    summary: {
      revenue: 95,
      profit: 60,
      quantitySold: 19,
      quantityLost: 1,
      lossReason: "1 un. não identificada — perdido/não pago (R$5).",
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 20 un = R$70 (Mistão forno 6 · Frango c/ catupiry 6 · Mistão frito 4 · Carne frito 2 · Carne forno 2).",
      "Custo próprio R$30 + Terceiros R$40 · bônus R$0. (Topo da nota dizia R$73 — corrigido: total R$70.)",
      "Henrique 5 (R$25) · Acal/Unifor 15 (14 pagos + 1 fiado Ana Laura) · 1 perda NN.",
      "Pagos 18 · R$90 · fiado Ana Laura R$5 (04/09) · perda R$5 · lucro R$60 (= 90 − 30).",
      "Espécie: Vanderson R$5 · Ismael R$10 · Ana Laura R$10 (convertidos p/ Pix só no banco pessoal).",
      "Fiado antigo Anderson das Chagas (ex-Ismael) 24/08 R$5 continua aberto.",
      "Cofrinho prático (rascunho): R$2.129,03 (com rendimento).",
      "OBS: fidelidade / cardápio / anti-furto (Ideias).",
    ].join("\n"),
    manualInsights: "Dia limpo em lucro R$60 com split favorável (próprio só R$30). Atenção à perda NN + fiado Ana Laura.",
    lessonsLearned: "Frango forno = Frango com Catupiry. Espécie fica espécie no sistema mesmo se converter depois.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: 18 pagos + 1 fiado + 1 perda · fat R$95 · rec R$90 · lucro R$60 · compra 20/R$70`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 02/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 19,
    quantityLost: 1,
    lossReason: plan.summary.lossReason,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 90, pending: 5, total: 95 },
    sales: {
      paidCount: 18,
      creditCount: 1,
      fatherSale: { units: 5, amount: 25, buyerName: "Colegas do Henrique" },
    },
  });

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$95 · rec R$90 · pend R$5 · perda 1`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
