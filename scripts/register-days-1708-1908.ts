/**
 * Registra 17–19/08/2026 — Salgados (varredura das Notas do sistema).
 * Quinta 20/08 fica de fora (ainda em anotação).
 *
 * Uso: CONFIRM_1708_1908=1 pnpm tsx scripts/register-days-1708-1908.ts
 *
 * 17/08: 18 un · próprio R$30 + Flaviana R$33 · fat dia R$85 · Mikely fiado R$5 (quita 18) · lucro R$55
 *        + quita Laura do 14/08 (R$5 → caixa do 14)
 * 18/08: 22 un · próprio R$77 · fat dia R$105 · 1 perda · lucro R$28
 *        + quita Mikely no 17 (R$5 → caixa do 17)
 * 19/08: 25 un · próprio R$0 + terceiros R$87,50 · fat dia R$100 · 3 fiados · 2 perdas · lucro R$100
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";
const DEPT_UNIFOR = "Unifor";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  paoQueijo: "Pão de Queijo",
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

/** Quita Laura (fiado 14/08 pago em 17/08) — fat permanece no 14. */
async function settleLauraOn14(settlementDate: string): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, "2026-08-14"))),
  );
  const laura = daySales.find(
    (s) =>
      s.paymentStatus === "pending" &&
      ((s.notes ?? "").toLowerCase().includes("laura") || s.id === "bb2993f5-b20c-41ad-a2a5-ff645a304c8e"),
  );
  if (!laura) {
    console.warn("⚠ Laura 14/08 pendente não encontrada (já quitada?)");
    return;
  }

  await queryRun(
    db
      .update(sales)
      .set({
        paymentStatus: "paid",
        amountReceived: "5.00",
        settlementDate,
        notes:
          "Fiado avisado do 14/08 quitado em 17/08 por Laura — faturamento permanece no 14/08.",
        updatedAt: new Date(),
      })
      .where(eq(sales.id, laura.id)),
  );

  const entry = await getDiaryEntry(BUSINESS, "2026-08-14");
  if (!entry) throw new Error("Diário 14/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    quantitySold: 21,
    quantityLost: 2,
    revenue: { received: 105, pending: 0, total: 105 },
    sales: {
      paidCount: 21,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitação 17/08 (conta no 14/08) ——",
      "Laura R$5 quitada. Fat. final 14/08: R$105 · lucro R$60 · pendente R$0.",
      "Ainda restam 2 perdas/roubos sem identificação.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "Laura quitou em 17/08; caixa do 14 atualizado. 2 perdas do 14 seguem abertas.",
  });
  console.log("✓ 14/08 Laura quitada → fat R$105 · lucro R$60 · pend R$0");
}

/** Quita Mikely (fiado silencioso do 17, identificado/pago no 18) — fat no 17. */
async function settleMikelyOn17(settlementDate: string): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, "2026-08-17"))),
  );
  const mikely = daySales.find(
    (s) =>
      s.paymentStatus === "pending" &&
      ((s.notes ?? "").toLowerCase().includes("mikel") ||
        (s.notes ?? "").toLowerCase().includes("fiado silencioso")),
  );
  if (!mikely) {
    console.warn("⚠ Mikely/fiado 17/08 pendente não encontrado");
    return;
  }

  await queryRun(
    db
      .update(sales)
      .set({
        paymentStatus: "paid",
        amountReceived: "5.00",
        settlementDate,
        notes:
          "Fiado silencioso do 17/08 — identificada Mikely e pago em 18/08; fat. permanece no 17/08.",
        updatedAt: new Date(),
      })
      .where(eq(sales.id, mikely.id)),
  );

  const entry = await getDiaryEntry(BUSINESS, "2026-08-17");
  if (!entry) throw new Error("Diário 17/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 60,
    quantitySold: 18,
    quantityLost: 0,
    revenue: { received: 90, pending: 0, total: 90 },
    sales: {
      paidCount: 18,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitação 18/08 (conta no 17/08) ——",
      "Mikely R$5 (fiado silencioso identificado). Fat. final 17/08: R$90 · lucro R$60 · pendente R$0.",
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights: "Mikely quitou o fiado silencioso do 17 em 18/08; caixa do 17 atualizado.",
  });
  console.log("✓ 17/08 Mikely quitada → fat R$90 · lucro R$60 · pend R$0");
}

async function registerDay(
  plan: DayRegistrationPlan,
  extras: {
    profit: number;
    quantitySold: number;
    quantityLost: number;
    lossReason?: string;
    revenueReceived: number;
    revenuePending?: number;
    paidCount: number;
    creditCount: number;
    fatherSale?: { units: number; amount: number; buyerName: string };
  },
) {
  console.log(`\n======== SALGADOS ${plan.date} ========`);
  await cleanupOperationDay(BUSINESS, plan.date);
  const existing = await countSalesForDate(BUSINESS, plan.date);
  if (existing > 0) throw new Error(`${plan.date}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} ticket(s) · diary ${result.diaryId}`);

  // Só corrige split de investimento quando há terceiro — 100% próprio quebra INV-03 no meio do rewrite.
  const thirdPartyAmount = plan.purchase?.thirdParty?.amount ?? 0;
  if (thirdPartyAmount > 0.01) {
    await fixDayPricing(BUSINESS, plan.date);
  }

  const entry = await getDiaryEntry(BUSINESS, plan.date);
  if (!entry) throw new Error(`Diário ${plan.date} ausente`);

  const pending = extras.revenuePending ?? 0;
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
      pending,
      total: extras.revenueReceived + pending,
    },
    sales: {
      paidCount: extras.paidCount,
      creditCount: extras.creditCount,
      fatherSale: extras.fatherSale,
    },
  });

  const nSales = await countSalesForDate(BUSINESS, plan.date);
  const after = await getDiaryEntry(BUSINESS, plan.date);
  console.log(
    `✅ ${plan.date} OK — ${nSales} tickets · fat R$${after?.revenue?.received} · pend R$${after?.revenue?.pending} · lucro R$${after?.profit} · sold ${after?.quantitySold} · lost ${after?.quantityLost}`,
  );
}

function plan17(): { plan: DayRegistrationPlan; extras: Parameters<typeof registerDay>[1] } {
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Henrique 6 un (2 Mistão frito + 2 Croissant + 2 Carne forno) · 100% vendidos R$30.",
    }),
    // Manhã Acal
    sale({ time: "09:00", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:05", clientName: "Jose Maclaurem Rodrigues", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Jackson Mendes Pinheiro", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Joao Pedro De Souza Pereira Marques", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:20", clientName: "Vanderson Dias", productName: P.unknown, quantity: 2 }),
    // Tarde Acal
    sale({
      time: "14:00",
      clientName: "Thalita Hivia De Almeida Freitas",
      productName: P.unknown,
      quantity: 1,
      notes: "Pix R$5.",
    }),
    sale({
      time: "14:05",
      clientName: "Francisco Nazareno Da Silva Raquel",
      productName: P.unknown,
      quantity: 1,
      notes: "Pix R$5.",
    }),
    sale({
      time: "14:10",
      clientName: "Nayana Lemos Galvão",
      productName: P.unknown,
      quantity: 2,
      notes: "Pix R$10.",
    }),
    // Fiado silencioso — identificado depois como Mikely (quita 18/08)
    sale({
      time: "11:00",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes:
        "Fiado silencioso da manhã (na nota como perda). Identificada Mikely em 18/08 — quitação prevista no 18, fat no 17.",
    }),
  ];

  assertUnits(salesList, 18, "17/08");
  const paid = salesList.filter((s) => s.paymentStatus !== "pending").reduce((n, s) => n + s.quantity, 0);
  const pending = salesList.filter((s) => s.paymentStatus === "pending").reduce((n, s) => n + s.quantity, 0);
  if (paid !== 17 || pending !== 1) throw new Error(`17/08 paid/pend ${paid}/${pending}`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: "2026-08-17",
    purchase: {
      totalUnits: 18,
      investment: 63,
      ownInvestment: 30,
      thirdParty: { name: "Flaviana", amount: 33 },
      products: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 5 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 8 },
        { name: P.carneForno, quantity: 2 },
        { name: P.croissant, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 2 },
        { name: P.croissant, quantity: 2 },
        { name: P.carneForno, quantity: 2 },
      ],
    },
    summary: {
      revenue: 85,
      profit: 55,
      quantitySold: 18,
      quantityLost: 0,
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "FECHAMENTO 17/08 — Notas do sistema.",
      "Encomenda 18 un = R$63 (próprio R$30 + Flaviana R$33).",
      "Henrique 6 un · 100% R$30.",
      "Acal pagos 11 un · fat Acal R$55 · total dia R$85.",
      "Mikely: 1 fiado silencioso (nota chamava de perda) — quita 18/08, fat no 17.",
      "Quitação Laura (14/08) R$5 → caixa do 14, não no fat do 17.",
      "Lucro R$55 (= 85 − 30). Após Mikely: esperado R$60.",
      "Cofrinho prática na nota: R$1.383,65 (conferir extrato).",
    ].join("\n"),
    manualInsights:
      "Laura quitou o 14 neste dia. Mikely do 17 é quitada no registro do 18.",
  };

  return {
    plan,
    extras: {
      profit: 55,
      quantitySold: 18,
      quantityLost: 0,
      revenueReceived: 85,
      revenuePending: 5,
      paidCount: 17,
      creditCount: 1,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  };
}

function plan18(): { plan: DayRegistrationPlan; extras: Parameters<typeof registerDay>[1] } {
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Henrique 6 un (4 Mistão frito + 2 Carne forno) · 100% R$30.",
    }),
    sale({
      time: "09:00",
      clientName: "Cristiano Messias Lopes",
      productName: P.unknown,
      quantity: 3,
      notes: "2 Mistão frito + 1 Croissant · Pix R$15.",
    }),
    sale({
      time: "09:05",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "09:10",
      clientName: "Francisco Ricardo Feijao Pinho",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "09:15",
      clientName: "Yasmin Michelle Nunes Rodrigues",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "09:20",
      clientName: "Jose Maclaurem Rodrigues",
      productName: P.unknown,
      quantity: 2,
      notes: "1 Mistão frito + 1 Croissant · Pix R$10.",
    }),
    // 1 un de hoje (a quitação do fiado do 17 é lançada no 17, não aqui)
    sale({
      time: "09:25",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
      notes: "1 un de hoje (Pix). Quitação do fiado do 17/08 lançada no caixa do 17.",
    }),
    sale({
      time: "09:30",
      clientName: "Lucas Moraes",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie R$5.",
    }),
    sale({
      time: "09:35",
      clientName: "Gerb Da Silva Maganos",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "09:40",
      clientName: "Davi Oliveira Da Silva Ayoub",
      productName: P.carneForno,
      quantity: 2,
      notes: "2 Carne forno · Pix R$10.",
    }),
    sale({
      time: "09:45",
      clientName: "Joao Pedro Souza P Marques",
      productName: P.unknown,
      quantity: 2,
      notes: "Sabor não identificado · Pix R$10.",
    }),
  ];

  // 6 + 15 = 21 sold tickets; 1 loss separate in summary
  assertUnits(salesList, 21, "18/08 sales");

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: "2026-08-18",
    purchase: {
      totalUnits: 22,
      investment: 77,
      ownInvestment: 77,
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.carneForno, quantity: 5 },
        { name: P.croissant, quantity: 5 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 8 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 5 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.carneForno, quantity: 2 },
      ],
    },
    summary: {
      revenue: 105,
      profit: 28,
      quantitySold: 21,
      quantityLost: 1,
      lossReason:
        "1 un pessoa desconhecida (não quitou — confirmado na nota do 19/08). Conta como perda.",
      forecastProfit: 60,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "FECHAMENTO 18/08 — Notas do sistema.",
      "Encomenda 22 un = R$77 (100% próprio).",
      "Henrique 6 un · R$30. Acal pagos 15 un · R$75. Fat dia R$105.",
      "Mikely: pagou fiado do 17 (R$5 → caixa 17) + comprou 1 un hoje.",
      "Perda: 1 desconhecida — na nota do 19: não quitou.",
      "Lucro R$28 (= 105 − 77).",
      "OBS: comprar vasilha transparente; levar hambúrguer de carne e queijo.",
      "Cofrinho prática na nota: R$1.417,31 (conferir extrato).",
    ].join("\n"),
    manualInsights: "Quitação Mikely atualiza o 17/08. Perda do 18 permanece aberta.",
    lessonsLearned: "Vasilha transparente + novos sabores (hambúrguer/queijo) como ação.",
  };

  return {
    plan,
    extras: {
      profit: 28,
      quantitySold: 21,
      quantityLost: 1,
      lossReason: plan.summary.lossReason,
      revenueReceived: 105,
      revenuePending: 0,
      paidCount: 21,
      creditCount: 0,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
  };
}

function plan19(): { plan: DayRegistrationPlan; extras: Parameters<typeof registerDay>[1]; warnings: string[] } {
  const warnings: string[] = [];
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Henrique 6 un (2 Mistão + 2 Carne + 2 Croissant) · 100% R$30.",
    }),
    // Manhã / Unifor-Acal
    sale({ time: "09:00", clientName: "Leonardo De Sousa Sena", productName: P.unknown, quantity: 2 }),
    sale({ time: "09:05", clientName: "Vanderson Dias", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:10",
      clientName: "Letícia Paiva Martinelli",
      productName: P.croissant,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor · Croissant.",
    }),
    sale({
      time: "09:15",
      clientName: "Esley Edilon Vieira Gomes",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "09:20",
      clientName: "Francisco Anderson Das Chagas Xavier Rocha",
      productName: P.carneForno,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor · Carne forno (Xavier).",
    }),
    sale({
      time: "09:25",
      clientName: "Pedro De Castro Costa",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
    }),
    sale({
      time: "09:30",
      clientName: "Arthur Xavier De Magalhaes",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({ time: "09:35", clientName: "Maria Clara Gomes Mororo", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:40", clientName: "Gerb Da Silva Maganos", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:45", clientName: "Dayanna Kelly Costa Almeida", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:50", clientName: "Cristiano Messias Lopes", productName: P.unknown, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Mara",
      productName: P.croissant,
      quantity: 1,
      paymentMethod: "cash",
      department: DEPT_UNIFOR,
      notes: "Espécie · Unifor.",
    }),
    sale({
      time: "10:05",
      clientName: "Lucas Moraes",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie R$5. Também deixou R$5 de crédito p/ próxima vez (não conta como venda extra hoje).",
    }),
    // Fiados
    sale({
      time: "15:00",
      clientName: "Ana Laura",
      productName: P.unknown,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado avisado — vai pagar amanhã (20/08). Fat no 19 quando quitar.",
    }),
    sale({
      time: "15:05",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.queijoFrito,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado avisado — 1 salgado de queijo. Cobrar em 20/08 se não pagar.",
    }),
    sale({
      time: "15:10",
      clientName: "Paulo Andre C Oliveira",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentStatus: "pending",
      notes:
        "Mistão aberto — combinado ~R$3–4 (não R$5). Pediu Pix e não pagou. PENDÊNCIA: valor exato ao quitar.",
    }),
  ];

  // 6 + 14 paid + 3 pending = 23; + 2 losses = 25
  assertUnits(salesList, 23, "19/08 sales");
  warnings.push(
    "19/08: Joao Victor (Unifor · Carne forno) não aparece na lista de vendas — lançado como perda 'unidade Unifor sem registro'.",
  );
  warnings.push(
    "19/08: Paulo André pendente a R$3–4 (sistema grava ticket a R$5; ajustar ao quitar).",
  );
  warnings.push(
    "19/08: Lucas Moraes deixou R$5 de crédito p/ próximo dia — NÃO entrou no fat do 19 (vai no dia que ele pegar).",
  );
  warnings.push(
    "19/08: números de fat na nota (100 / 104 / 109) inconsistentes — usei fat recebido R$100 (= Henrique 30 + 14×5) e lucro R$100 (custo próprio 0).",
  );

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: "2026-08-19",
    purchase: {
      totalUnits: 25,
      investment: 87.5,
      ownInvestment: 0,
      thirdParty: { name: "Terceiros", amount: 87.5 },
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.carneForno, quantity: 5 },
        { name: P.croissant, quantity: 5 },
        { name: P.paoQueijo, quantity: 3 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 10 },
        { name: P.carneForno, quantity: 3 },
        { name: P.croissant, quantity: 3 },
        { name: P.paoQueijo, quantity: 3 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 2 },
        { name: P.carneForno, quantity: 2 },
        { name: P.croissant, quantity: 2 },
      ],
    },
    summary: {
      revenue: 100,
      profit: 100,
      quantitySold: 23,
      quantityLost: 2,
      lossReason:
        "1 Pão de Queijo dado ao porteiro (plástico no salgado anterior) + 1 un Unifor sem registro (possível Joao Victor).",
      forecastProfit: 125,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "FECHAMENTO 19/08 — Notas do sistema.",
      "Encomenda 25 un = R$87,50 (próprio R$0 · terceiros R$87,50).",
      "Henrique 6 · R$30. Acal/Unifor pagos 14 · R$70. Fat recebido R$100.",
      "Fiados: Ana Laura 1 · Mikely (queijo) 1 · Paulo André (Mistão ~R$3–4) 1.",
      "Perdas: porteiro (Pão de Queijo) + 1 un sem registro (Joao Victor?).",
      "Quitação desconhecida do 18: não veio — perda do 18 mantida.",
      "Crédito Lucas Moraes R$5 → conta no dia que ele pegar o salgado (não no fat 19).",
      "Lucro R$100 (custo próprio 0).",
      "Cofrinho prática na nota: R$1.477,99 (conferir extrato).",
      "Pendências financeiras no diário: R$15 (2×R$5 + R$5 Paulo a ajustar).",
    ].join("\n"),
    manualInsights:
      "Dia com custo próprio zero — lucro = fat recebido. Conferir fiados e Joao Victor.",
    lessonsLearned: "Levar hambúrguer de carne. Controlar melhor Unifor × Acal na lista.",
  };

  return {
    plan,
    extras: {
      profit: 100,
      quantitySold: 23,
      quantityLost: 2,
      lossReason: plan.summary.lossReason,
      revenueReceived: 100,
      revenuePending: 15,
      paidCount: 20,
      creditCount: 3,
      fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
    },
    warnings,
  };
}

async function main() {
  if (process.env.CONFIRM_1708_1908 !== "1") {
    console.error("Abortado: rode com CONFIRM_1708_1908=1");
    process.exit(1);
  }

  const only = process.env.ONLY_DATE; // ex.: 2026-08-19

  if (!only || only === "2026-08-17") {
    console.log("\n======== QUITAÇÃO Laura → 14/08 ========");
    await settleLauraOn14("2026-08-17");
    const d17 = plan17();
    await registerDay(d17.plan, d17.extras);
  }

  if (!only || only === "2026-08-18") {
    console.log("\n======== QUITAÇÃO Mikely → 17/08 ========");
    await settleMikelyOn17("2026-08-18");
    const d18 = plan18();
    await registerDay(d18.plan, d18.extras);
  }

  if (!only || only === "2026-08-19") {
    const d19 = plan19();
    for (const w of d19.warnings) console.warn(`⚠ ${w}`);
    await registerDay(d19.plan, d19.extras);
  }

  // Verificação final
  console.log("\n======== VERIFICAÇÃO ========");
  for (const date of ["2026-08-14", "2026-08-17", "2026-08-18", "2026-08-19"] as const) {
    const e = await getDiaryEntry(BUSINESS, date);
    const n = await countSalesForDate(BUSINESS, date);
    console.log(
      `${date}: tickets=${n} fat=${e?.revenue?.received} pend=${e?.revenue?.pending} lucro=${e?.profit} sold=${e?.quantitySold} lost=${e?.quantityLost}`,
    );
  }
  console.log("\n20/08 (quinta) NÃO registrado — anotação ainda em andamento.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
