/**
 * Registra 20/08/2026 — Salgados (nota finalizada) + quita fiados do 19/08.
 *
 * Uso: CONFIRM_2008=1 pnpm tsx scripts/register-day-2008.ts
 *
 * Nota: fat R$132,50 / lucro R$92,50 misturam quitações do 19.
 * Sistema (padrão): quitações no 19; fat do 20 = vendas do dia.
 *
 * 20/08: 26 un · R$91 (próprio 40 + terceiros 51) · Henrique 6 · perdas divergência lista
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
import { clients, sales, stickyNotes } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const BUSINESS = "salgados";
const DATE = "2026-08-20";
const PREV = "2026-08-19";
const DEPT_ACAL = "Acal";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  paoQueijo: "Pão de Queijo",
  hamburguer: "Carne de Hambúrguer",
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

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Quita Ana Laura (R$5), Mikely (R$5) e Paulo André (R$3,50) no 19/08. */
async function settleDay19Fiados(): Promise<{ added: number }> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, PREV))),
  );

  // Resolve client names
  const clientRows = await queryAll(db.select().from(clients));
  const nameById = new Map(clientRows.map((c) => [c.id, c.name]));

  let added = 0;
  const pending = daySales.filter((s) => s.paymentStatus === "pending");

  for (const s of pending) {
    const clientName = norm(nameById.get(s.clientId ?? "") ?? "");
    const n = norm(s.notes ?? "");

    if (clientName.includes("ana laura") || (n.includes("vai pagar amanha") && !n.includes("mikel") && !n.includes("paulo") && !n.includes("queijo") && !n.includes("mistao aberto"))) {
      await queryRun(
        db
          .update(sales)
          .set({
            paymentStatus: "paid",
            amountReceived: "5.00",
            settlementDate: DATE,
            notes:
              "Fiado 19/08 quitado em 20/08 por Ana Laura (R$5) — faturamento permanece no 19/08.",
            updatedAt: new Date(),
          })
          .where(eq(sales.id, s.id)),
      );
      added += 5;
      console.log("✓ 19/08 Ana Laura quitada (R$5)");
    } else if (clientName.includes("mikel") || n.includes("queijo")) {
      await queryRun(
        db
          .update(sales)
          .set({
            paymentStatus: "paid",
            amountReceived: "5.00",
            settlementDate: DATE,
            notes:
              "Fiado 19/08 (queijo) quitado em 20/08 por Mikely (R$5) — fat. permanece no 19/08.",
            updatedAt: new Date(),
          })
          .where(eq(sales.id, s.id)),
      );
      added += 5;
      console.log("✓ 19/08 Mikely quitada (R$5)");
    } else if (clientName.includes("paulo") || n.includes("paulo") || n.includes("mistao aberto") || n.includes("3–4") || n.includes("3-4")) {
      await queryRun(
        db
          .update(sales)
          .set({
            paymentStatus: "paid",
            totalAmount: "3.50",
            amountReceived: "3.50",
            settlementDate: DATE,
            notes:
              "Fiado 19/08 quitado em 20/08 por Paulo André a R$3,50 (Mistão aberto) — fat. no 19/08.",
            updatedAt: new Date(),
          })
          .where(eq(sales.id, s.id)),
      );
      added += 3.5;
      console.log("✓ 19/08 Paulo André quitado (R$3,50)");
    } else {
      console.warn("⚠ Pendente 19/08 não classificado:", s.id, clientName, s.notes);
    }
  }

  if (added < 13) {
    console.warn(`⚠ Soma quitações R$${added} < R$13,50 — conferir pendentes do 19`);
  }

  const entry = await getDiaryEntry(BUSINESS, PREV);
  if (!entry) throw new Error("Diário 19/08 ausente");

  const received = round2(100 + added);
  await upsertDiaryEntry({
    ...entry,
    profit: received,
    quantitySold: 23,
    quantityLost: 2,
    revenue: { received, pending: 0, total: received },
    sales: {
      paidCount: 23,
      creditCount: 0,
      fatherSale: entry.sales?.fatherSale,
    },
    observations: [
      entry.observations,
      "",
      "—— Quitações 20/08 (contam no 19/08) ——",
      `Ana Laura R$5 · Mikely R$5 · Paulo André R$3,50 = R$${added.toFixed(2)}.`,
      `Fat. final 19/08: R$${received.toFixed(2)} · lucro R$${received.toFixed(2)} · pendente R$0.`,
    ]
      .filter(Boolean)
      .join("\n"),
    manualInsights:
      "Fiados do 19 quitados em 20/08. Paulo a R$3,50 (não R$5). Joao Victor / 2 perdas do 19 seguem abertas.",
  });
  console.log(`✓ Diário 19/08 → fat R$${received} · lucro R$${received} · pend R$0`);
  return { added };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function markNoteClosed(): Promise<void> {
  const db = await getPostgresDb();
  const rows = await queryAll(
    db.select().from(stickyNotes).where(and(eq(stickyNotes.noteDate, DATE), eq(stickyNotes.archived, false))),
  );
  for (const row of rows) {
    await queryRun(
      db
        .update(stickyNotes)
        .set({
          title: "Salgados — 20/08 FECHADO ✓",
          updatedAt: new Date(),
          clientUpdatedAt: new Date(),
        })
        .where(eq(stickyNotes.id, row.id)),
    );
  }
  console.log(`✓ Nota(s) 20/08 marcadas FECHADO (${rows.length})`);
}

async function main() {
  if (process.env.CONFIRM_2008 !== "1") {
    console.error("Abortado: rode com CONFIRM_2008=1");
    process.exit(1);
  }

  console.log("\n======== QUITAÇÕES 19/08 ========");
  const { added } = await settleDay19Fiados();

  // Interpretação da lista:
  // - Bloco "Henrique trabalho 6 · R$30" = mesma venda que "Henrique Alberto … 6 · R$30" (não duplicar).
  // - Ana Laura / Mikely: 1 un de hoje cada; quitação de ontem só no 19.
  // - Paulo André: só quitação no 19 (R$3,50), sem un de hoje.
  // - Lucas Moraes: 1 un com crédito do 19 (R$0 no caixa de hoje; crédito não tinha entrado no fat do 19).
  // - Seção "Fiados quitados de hoje" na nota é template antigo do 19 — IGNORAR (contradiz a lista).
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes:
        "Lote Henrique (trabalho) = 6 un · R$30. Mesma linha da lista Acal item 1 — não duplicar.",
    }),
    sale({ time: "09:05", clientName: "Cássio Adriel De Oliveira Silva", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:10", clientName: "Francisco Ricardo Feijao Pinho", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:15", clientName: "Arthur Xavier De Magalhaes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:20", clientName: "Vanderson Dias", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:25",
      clientName: "Raimunda Raimunda Sousa",
      productName: P.unknown,
      quantity: 1,
      notes: "Vendido a R$4 (salgado muito pequeno). Sistema grava R$5 no ticket — fat. diário ajustado.",
    }),
    sale({
      time: "09:30",
      clientName: "Ana Laura Ferreira Pinto",
      productName: P.unknown,
      quantity: 1,
      notes: "1 un de hoje (R$5). Quitação do 19 lançada no caixa do 19.",
    }),
    sale({ time: "09:35", clientName: "Danilo Duarte Nobre", productName: P.unknown, quantity: 1 }),
    sale({
      time: "09:40",
      clientName: "Francisco Anderson Das Chagas Xavier Rocha",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({ time: "09:45", clientName: "Anselmo Gabriel Freire Da Silva", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:50", clientName: "Cristiano Messias Lopes", productName: P.unknown, quantity: 1 }),
    sale({ time: "09:55", clientName: "Arthur Cavalcante Passos", productName: P.unknown, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Cristiano Messias Lopes",
      productName: P.unknown,
      quantity: 1,
      notes: "Segunda compra do dia.",
    }),
    sale({
      time: "10:05",
      clientName: "Maria Mikelly Monteiro Coutinho",
      productName: P.unknown,
      quantity: 1,
      notes: "1 un de hoje (R$5). Quitação do 19 (queijo) no caixa do 19.",
    }),
    sale({
      time: "10:10",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 3,
      notes: "Compra adicional Acal · 3 un · R$15 (além do lote Henrique 6).",
    }),
    sale({
      time: "10:30",
      clientName: "Bernardo",
      productName: P.unknown,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie.",
    }),
    sale({
      time: "10:35",
      clientName: "Lucas Moraes",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      notes:
        "Usou crédito de R$5 deixado em 19/08 — sem Pix/espécie hoje. Crédito não estava no fat do 19; entra no fat do 20 como R$5 (caixa já físico).",
    }),
  ];

  const soldUnits = salesList.reduce((n, s) => n + s.quantity, 0);
  // 6+1*12 +3 +1 +1 = 6+12+3+2 = 23? Count: Henrique6 + 12 singles (cassio..mikely except HA3) + HA3 + Bernardo + Lucas
  // singles: Cassio, Ricardo, ArthurX, Vanderson, Raimunda, Ana, Danilo, Anderson, Anselmo, Cristiano, ArthurC, Cristiano, Mikely = 13
  // 6+13+3+1+1 = 24
  const expectedSold = 24;
  if (soldUnits !== expectedSold) {
    throw new Error(`20/08 sold units ${soldUnits} ≠ ${expectedSold}`);
  }
  const lostUnits = 26 - soldUnits; // 2 — divergência lista × encomenda
  if (lostUnits !== 2) throw new Error(`lost ${lostUnits} ≠ 2`);

  // Fat do dia (sem quitações): tickets a R$5 = 24*5 = 120, − R$1 Raimunda = 119.
  // Lucas: crédito conta R$5 no fat (já tinha o dinheiro). Raimunda: diário −1.
  const revenue = 119; // 23*5 + 4 (Raimunda) = 115 + 4? Wait: 24 units, 23 at 5 and Raimunda at 4 = 23*5+4 = 119. Lucas is one of the 24 at economic R$5.
  // 22 at 5 + Raimunda 4 + Lucas 5 = 110+4+5 = 119. Yes (22 other full price besides Lucas).
  const ownCost = 40;
  const profit = revenue - ownCost; // 79
  const thirdParty = 51; // 91 - 40 (nota tipou "R91" nos dois campos)

  const warnings = [
    "Nota fat R$132,50 / lucro R$92,50 inclui quitações do 19 (R$13,50). No sistema: quits no 19; 20 = R$119 / lucro R$79.",
    "Seção 'Fiados quitados de hoje' na nota é template velho do 19 — ignorada (lista mostra quitações pagas).",
    "Henrique trabalho 6 = Henrique Alberto item 1 (não duplicado).",
    `Lista fecha ${soldUnits} un de hoje vs encomenda 26 → ${lostUnits} un sem destino (pendência).`,
    "Raimunda a R$4: ticket sistema R$5, fat diário com −R$1.",
    "Custo terceiros assumido R$51 (total 91 − próprio 40); nota repetiu R$91 nos dois campos.",
    "Produto novo: Carne de Hambúrguer (na compra; sabores de venda em maioria não identificados).",
  ];

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 26,
      investment: 91,
      ownInvestment: ownCost,
      thirdParty: { name: "Terceiros", amount: thirdParty },
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.carneForno, quantity: 5 },
        { name: P.croissant, quantity: 5 },
        { name: P.paoQueijo, quantity: 3 },
        { name: P.hamburguer, quantity: 1 },
      ],
      acalAllocation: [
        { name: P.mistaoFrito, quantity: 8 },
        { name: P.carneForno, quantity: 1 },
        { name: P.croissant, quantity: 1 },
        { name: P.paoQueijo, quantity: 3 },
        { name: P.hamburguer, quantity: 1 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 2 },
        { name: P.carneForno, quantity: 2 },
        { name: P.croissant, quantity: 2 },
      ],
    },
    summary: {
      revenue,
      profit,
      quantitySold: soldUnits,
      quantityLost: lostUnits,
      lossReason:
        "2 un da encomenda sem linha clara na lista (após unificar lote Henrique). Confirmar Unifor / destino.",
      forecastProfit: 100,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "FECHAMENTO 20/08 — nota finalizada.",
      "Encomenda 26 un = R$91 (próprio R$40 + terceiros R$51).",
      "Henrique 6 un · R$30 (Henrique Alberto / lote trabalho — 1 lançamento).",
      `Acal/espécie do dia: ${soldUnits - 6} un · fat dia R$${revenue} (sem quits do 19).`,
      `Quitações no 19: Ana Laura R$5 · Mikely R$5 · Paulo R$3,50 = R$${added.toFixed(2)}.`,
      "Lucas Moraes: 1 Mistão com crédito do 19 (R$5 no fat do 20).",
      "Raimunda: R$4 (salgado pequeno).",
      "Perdas na nota: nenhuma — sistema marca 2 un sem destino na lista.",
      "OBS nota: fazer novo cardápio e estratégias.",
      "Cofrinho prática na nota: R$1.561,20 (conferir extrato).",
      "Nota citava fat R$132,50 / lucro R$92,50 (com quits); sistema separou.",
    ].join("\n"),
    manualInsights: warnings.join(" "),
    lessonsLearned: "Novo cardápio / estratégias de venda. Evitar template de fiados do dia anterior na nota.",
  };

  for (const w of warnings) console.warn(`⚠ ${w}`);

  console.log(`\n======== SALGADOS ${DATE} ========`);
  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} ticket(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 20/08 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit,
    bonusIncome: undefined,
    quantitySold: soldUnits,
    quantityLost: lostUnits,
    lossReason: plan.summary.lossReason,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: revenue, pending: 0, total: revenue },
    sales: {
      paidCount: soldUnits,
      creditCount: 0,
      fatherSale: {
        units: 6,
        amount: 30,
        buyerName: "Henrique Alberto Matos Da Rocha",
      },
    },
  });

  await markNoteClosed();

  console.log("\n======== VERIFICAÇÃO ========");
  for (const d of [PREV, DATE] as const) {
    const e = await getDiaryEntry(BUSINESS, d);
    const n = await countSalesForDate(BUSINESS, d);
    console.log(
      `${d}: tickets=${n} fat=${e?.revenue?.received} pend=${e?.revenue?.pending} lucro=${e?.profit} sold=${e?.quantitySold} lost=${e?.quantityLost}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
