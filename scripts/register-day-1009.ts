/**
 * Registra 10/09/2026 — Salgados (Notas + confirmação Cursor).
 * Uso: pnpm tsx scripts/register-day-1009.ts
 *
 * - Compra 34 un · R$104 (manhã 30/R$90 + tarde 4/R$14) · own R$70 · terc R$34
 * - Pagos 26 · R$130 · fiados 4 · R$20 · geladeira Henrique 4 (vende 11/09)
 * - Lucro R$60 (= 130 − 70) · bônus R$0
 * - Henrique trabalho: 7 alocados · 3 vendidos · 4 geladeira
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

const DATE = "2026-09-10";
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
  carneFrito: "Carne Frito",
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
    sale({ time: "09:08", clientName: "Anselmo Gabriel", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:14", clientName: "Sarah Gabriolly Parente Marreiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:21", clientName: "Raimunda Raimunda Sousa", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:31",
      clientName: "Joaquim Francisco Da Silva Neto",
      productName: P.unknown,
      quantity: 1,
      notes: "Joaquim Neto — pago em duas partes (R$2 + R$3 às 18:44).",
    }),
    sale({ time: "09:35", clientName: "Valentina Macedo Barbosa", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:36", clientName: "Suellen Priscilla R Marculino", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:39", clientName: "Ismael Silva Da Paz", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:48", clientName: "Maria Lusangela A C Sousa", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:09", clientName: "Dayanna Kelly Costa Da Silva", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:10", clientName: "Mauricio De Sa Machado Junior", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:39", clientName: "Barbara Braga Melo", productName: P.unknown, quantity: 1 }),
    sale({ time: "13:02", clientName: "Shirley Lima Vieira", productName: P.unknown, quantity: 1 }),
    sale({
      time: "13:36",
      clientName: "Suellen Priscilla R Marculino",
      productName: P.unknown,
      quantity: 1,
      notes: "2ª compra do dia.",
    }),
    sale({ time: "14:26", clientName: "Paulo Andre Cavalcante Oliveira", productName: P.unknown, quantity: 1 }),
    sale({ time: "15:40", clientName: "Francisco De Assis Soares Pereira", productName: P.unknown, quantity: 1 }),
    sale({ time: "16:12", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "16:24",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 3,
      department: DEPT_HENRIQUE,
      notes:
        "Trabalho do Henrique — 3 de 7 Mistão frito vendidos (R$15). Restam 4 na geladeira para 11/09.",
    }),
    sale({ time: "16:43", clientName: "Jonas Ferreira Dos Santos", productName: P.unknown, quantity: 1 }),
    sale({ time: "17:34", clientName: "Joao Guilherme Da Silva Lima", productName: P.unknown, quantity: 1 }),
    sale({
      time: "18:13",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 3,
      notes:
        "Compra pessoal do Henrique (Acal/Unifor) — não é a cota de trabalho (trabalho = só 3 un às 16:24).",
    }),
    sale({
      time: "18:56",
      clientName: "Joao Victor Dos Santos Carvalho",
      productName: P.unknown,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    // Fiados
    sale({
      time: "19:00",
      clientName: "Mikely",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 10/09 — Mikelly/Mikely (mesma pessoa). R$5 pendente.",
    }),
    sale({
      time: "19:05",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 10/09 — Ana Laura. R$5 pendente.",
    }),
    sale({
      time: "19:10",
      clientName: "Negão do compras",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 10/09 — Negão do compras. R$5 pendente.",
    }),
    sale({
      time: "19:15",
      clientName: "Jackson Mendes Pinheiro",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 10/09 — Jackson. R$5 pendente. OBS: checar se pegou sem pagar na terça (09/09).",
    }),
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 30) throw new Error(`Units ${units} ≠ 30 (26 pagos + 4 fiados; geladeira 4 à parte)`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 34,
      investment: 104,
      ownInvestment: 70,
      thirdParty: { name: "Terceiros", amount: 34 },
      products: [
        { name: P.mistaoFrito, quantity: 18 },
        { name: P.frangoCat, quantity: 4 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.queijoFrito, quantity: 2 },
        { name: P.carneFrito, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 11 },
        { name: P.frangoCat, quantity: 4 },
        { name: P.croissant, quantity: 4 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 2 },
        { name: P.queijoFrito, quantity: 2 },
        { name: P.carneFrito, quantity: 1 },
      ],
      fatherAllocation: [{ name: P.mistaoFrito, quantity: 7 }],
    },
    summary: {
      revenue: 150,
      profit: 60,
      quantitySold: 30,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Encomenda 34 un = R$104 — manhã 30 (R$90 = 87+3) + tarde 4 (R$14: Mistão frito 1 · Carne frito 1 · Croissant 1 · Frango c/ catupiry 1).",
      "Mix total: Mistão frito 18 · Frango 4 · Croissant 4 · Carne forno 3 · Mistão forno 2 · Queijo frito 2 · Carne frito 1.",
      "Custo próprio R$70 + Terceiros R$34 · bônus R$0.",
      "Henrique: 7 Mistão frito alocados · 3 vendidos (R$15, 16:24) · 4 na geladeira para tentar vender em 11/09.",
      "Henrique 18:13 (3 un · R$15) = compra pessoal dele (Acal/Unifor), fora da cota de trabalho.",
      "Pagos 26 · R$130 · fiados 4 · R$20 (Mikely · Ana Laura · Negão do compras · Jackson) · lucro R$60 (= 130 − 70).",
      "Canais (pago): Henrique trabalho 3 · Unifor ~7 · Acal restante; fiados na Acal.",
      "Joaquim Neto: R$2 + R$3 = R$5 pago.",
      "Fiado antigo: Rodrigues 31/08 R$5 segue aberto.",
      "OBS: imprimir fidelidade / cardápio / cartazes. Checar se Jackson pegou sem pagar na terça 09/09.",
      "Cofrinho prático: R$2.526,41 (com rendimento — já inclui lucro 10/09).",
    ].join("\n"),
    manualInsights:
      "Lucro R$60 no alvo apesar de 4 fiados e 4 na geladeira. Own R$70 alto — vigilância no split.",
    lessonsLearned:
      "Separar cota Henrique (3/7) da compra pessoal dele. Geladeira 4 → fechar no 11/09.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(
    `Preview: 26 pagos + 4 fiados + 4 geladeira · fat R$150 · rec R$130 · lucro R$60 · compra 34/R$104 own 70`,
  );

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 10/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    bonusIncome: undefined,
    quantitySold: 30,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 130, pending: 20, total: 150 },
    sales: {
      paidCount: 26,
      creditCount: 4,
      fatherSale: { units: 3, amount: 15, buyerName: "Colegas do Henrique" },
    },
  });

  await setPracticalProfitBankBalance(BUSINESS, 2526.41);
  console.log("✓ Cofrinho prático → R$2.526,41");

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$60 · fat R$150 · rec R$130 · pend R$20 · geladeira 4`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
