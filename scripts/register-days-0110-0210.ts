/**
 * Registra 01/10 e 02/10/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-days-0110-0210.ts
 *
 * 01/10: lucro R$130 (= 240 − 110). Recebido R$240 com quitações de setembro
 *   (Mikelly 7 un + Carlos 1 un). Mikelly também pegou e pagou 2 un no próprio dia.
 *   Lista 48 un · R$240 (8 un de quitação). JV 1 fiado, quitado em 02/10.
 * 02/10: lucro R$80 = R$40 operacional + R$40 bônus. Lista R$140 inclui quitações
 *   de Gerb (30/09) e JV (01/10). Mikelly 3 fiado R$15. Perdas 4.
 * Cofrinho prático → R$3.773,95.
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { setPracticalProfitBankBalance } from "../src/lib/profit-bank-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { listStickyNotes } from "@/platform/db/repositories/sticky-note-repository";

const BUSINESS = "salgados";
const OWNER_ID = "55c8453d-509f-4ed2-a7f4-180faa4673e4";
const ACAL = "Acal";
const MIKELLY = "Maria Mikelly Monteiro Coutinho";
const JV = "João Victor dos Santos Carvalho";
const PRACTICAL = 3773.95;

const SALE_LINE =
  /^(?:\d+\.\s*)?(\d{1,2}:\d{2})\s*[—-]\s*(.+?)\s*[—-]\s*(\d+)\s*salgados?\s*[—-]\s*R\$\s*([\d.,]+)(.*)$/i;

function sale(partial: Partial<DraftSale> & Pick<DraftSale, "time" | "clientName" | "quantity">): DraftSale {
  return {
    productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
    paymentMethod: "pix",
    paymentStatus: "paid",
    department: ACAL,
    ...partial,
  };
}

function parseSales(body: string): DraftSale[] {
  const out: DraftSale[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const match = SALE_LINE.exec(raw.trim());
    if (!match) continue;
    const [, time, clientName, qty, , rest] = match;
    out.push(sale({ time: time.padStart(5, "0"), clientName: clientName.trim(), quantity: Number(qty), notes: rest.trim() || undefined }));
  }
  return out;
}

function clientsFromSales(list: DraftSale[]): DayRegistrationPlan["newClients"] {
  const seen = new Set<string>();
  return list.flatMap((s) => {
    const key = s.clientName.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ name: s.clientName, sector: s.department, notes: `Cliente — ${s.department}` }];
  });
}

interface DayInput {
  date: string;
  plan: DayRegistrationPlan;
  profit: number;
  bonus?: number;
  bonusDescription?: string;
  received: number;
  pending: number;
  sold: number;
  lost: number;
  paidCount: number;
  creditCount: number;
}

async function registerDay(day: DayInput) {
  console.log(`\n======== SALGADOS ${day.date} ========`);
  await cleanupOperationDay(BUSINESS, day.date);
  const existing = await countSalesForDate(BUSINESS, day.date);
  if (existing > 0) throw new Error(`${day.date}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(day.plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  const patch = {
    profit: day.profit,
    bonusIncome: day.bonus,
    bonusIncomeDescription: day.bonusDescription,
    quantitySold: day.sold,
    quantityLost: day.lost,
    revenue: { received: day.received, pending: day.pending, total: day.received + day.pending },
  };

  const entry = await getDiaryEntry(BUSINESS, day.date);
  if (!entry) throw new Error(`${day.date}: diário ausente`);
  await upsertDiaryEntry({
    ...entry,
    ...patch,
    observations: day.plan.observations,
    manualInsights: day.plan.manualInsights,
    lessonsLearned: day.plan.lessonsLearned,
    sales: { paidCount: day.paidCount, creditCount: day.creditCount },
  });

  await fixDayPricing(BUSINESS, day.date);
  const after = await getDiaryEntry(BUSINESS, day.date);
  if (!after) throw new Error(`${day.date}: diário sumiu após preço`);
  if (
    after.profit !== day.profit ||
    (after.bonusIncome ?? 0) !== (day.bonus ?? 0) ||
    after.revenue.received !== day.received ||
    after.revenue.pending !== day.pending
  ) {
    await upsertDiaryEntry({ ...after, ...patch });
  }

  const saved = await getDiaryEntry(BUSINESS, day.date);
  const total = saved ? saved.profit + (saved.bonusIncome ?? 0) : NaN;
  if (!saved || total !== day.profit + (day.bonus ?? 0) || saved.revenue.received !== day.received) {
    throw new Error(`${day.date}: não fechou`);
  }
  console.log(`✅ ${day.date} OK — lucro final R$${total} · rec R$${day.received} · pend R$${day.pending}`);
}

/** JV pegou 1 fiado em 01/10 e quitou em 02/10 — faturamento fica no 01. */
async function settleJv0110() {
  const db = await getPostgresDb();
  const rows = await queryAll(
    db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.businessId, toDbBusinessId(BUSINESS)),
          eq(sales.saleDate, "2026-10-01"),
          eq(sales.paymentStatus, "pending"),
        ),
      ),
  );
  if (rows.length !== 1) throw new Error(`01/10: esperava 1 fiado (JV), achei ${rows.length}`);
  await queryRun(
    db
      .update(sales)
      .set({
        paymentStatus: "paid",
        amountReceived: "5.00",
        settlementDate: "2026-10-02",
        notes: "Fiado 01/10 quitado em 02/10 por JV — faturamento permanece no 01/10.",
        updatedAt: new Date(),
      })
      .where(eq(sales.id, rows[0]!.id)),
  );
  console.log("✓ JV 01/10 quitado em 02/10");
}

async function main() {
  const notes = await listStickyNotes(OWNER_ID);
  const note01 = notes.find((n) => n.noteDate === "2026-10-01" && n.body.trim());
  const note02 = notes.find((n) => n.noteDate === "2026-10-02" && n.body.trim());
  if (!note01 || !note02) throw new Error("Nota 01/10 ou 02/10 não encontrada");

  const sales01 = parseSales(note01.body).map((s) => {
    if (s.time === "06:24") return { ...s, notes: "Quitação de setembro (Carlos)." };
    if (s.time === "10:18") return { ...s, notes: "Quitação de setembro (Mikelly 7 un)." };
    if (s.time === "10:24") return { ...s, notes: "Pegou e pagou no próprio dia." };
    if (s.time === "12:07") return { ...s, notes: "Rhenan 2 un em espécie, convertido em pix via Henrique." };
    return s;
  });
  const list01 = sales01.reduce((n, s) => n + s.quantity, 0);
  if (list01 !== 48) throw new Error(`01/10: lista com ${list01} un ≠ 48`);
  sales01.push(
    sale({ time: "18:00", clientName: JV, quantity: 1, paymentStatus: "pending", notes: "Fiado 01/10 (esquecido na nota)." }),
  );
  const day01: DayInput = {
    date: "2026-10-01",
    profit: 130,
    received: 240,
    pending: 0,
    sold: 38,
    lost: 2,
    paidCount: 37,
    creditCount: 1,
    plan: {
      businessId: BUSINESS,
      date: "2026-10-01",
      purchase: {
        totalUnits: 40,
        investment: 125,
        ownInvestment: 110,
        thirdParty: { name: "Terceiros", amount: 15 },
        products: [
          { name: "Mistão Frito", quantity: 14 },
          { name: "Queijo Frito", quantity: 8 },
          { name: "Mistão de Forno", quantity: 6 },
          { name: "Frango com Catupiry", quantity: 6 },
          { name: "Croissant", quantity: 4 },
          { name: "Carne com Cheddar de Forno", quantity: 2 },
        ],
      },
      summary: { revenue: 240, profit: 130, quantitySold: 38, quantityLost: 2, forecastProfit: 77 },
      sales: sales01,
      newClients: clientsFromSales(sales01),
      observations: [
        "Compra 40 un · R$125 (próprio R$110 + terceiros R$15).",
        "Lista 48 un · R$240 = quitações de setembro 8 un (Carlos 1 + Mikelly 7, R$40) + 40 un do dia (R$200).",
        "Mikelly 2 un pegas e pagas no próprio dia (total R$45 com a quitação).",
        "JV pegou 1 fiado (esquecido na nota), quitado em 02/10. Com 40 pagas da compra de 40, alguma contagem da nota sobra 1 un — mantido assim, sem efeito no lucro.",
        "Gerb R$10 (30/09) segue aberto.",
        "Rhenan 2 un em espécie, convertido em pix via Henrique.",
        "Lucro R$130 (= 240 − 110). Fiados de setembro não entraram no lucro de setembro — sem soma dupla.",
        "Cofrinho prático R$3.693,95.",
      ].join("\n"),
      manualInsights: "Dia forte: R$130 com quitações de setembro caindo no banco.",
      lessonsLearned: "Quitação de mês anterior entra no dia em que cai no banco.",
    },
  };

  const sales02 = parseSales(note02.body).map((s) => {
    if (s.time === "10:02") return { ...s, notes: "Quitação de 30/09 (Gerb)." };
    if (s.time === "12:57") return { ...s, notes: "Quitação do fiado de 01/10 (JV)." };
    return s;
  });
  const listUnits = sales02.reduce((n, s) => n + s.quantity, 0);
  if (listUnits !== 28) throw new Error(`02/10: lista com ${listUnits} un ≠ 28`);
  sales02.push(
    sale({ time: "18:00", clientName: MIKELLY, quantity: 3, paymentStatus: "pending", notes: "Fiado 02/10 — R$15." }),
  );
  const day02: DayInput = {
    date: "2026-10-02",
    profit: 40,
    bonus: 40,
    bonusDescription: "Bonificação R$40 (já dentro do lucro final de R$80).",
    received: 140,
    pending: 15,
    sold: 29,
    lost: 4,
    paidCount: 26,
    creditCount: 3,
    plan: {
      businessId: BUSINESS,
      date: "2026-10-02",
      purchase: {
        totalUnits: 33,
        investment: 110,
        ownInvestment: 100,
        thirdParty: { name: "Terceiros", amount: 10 },
        products: [
          { name: "Mistão Frito", quantity: 14 },
          { name: "Queijo Frito", quantity: 6 },
          { name: "Mistão de Forno", quantity: 4 },
          { name: "Frango com Catupiry", quantity: 4 },
          { name: "Croissant", quantity: 3 },
          { name: "Carne com Cheddar de Forno", quantity: 2 },
        ],
      },
      summary: { revenue: 140, profit: 40, quantitySold: 29, quantityLost: 4, forecastProfit: 77 },
      sales: sales02,
      newClients: clientsFromSales(sales02),
      observations: [
        "Compra 33 un · R$110 (próprio R$100 + terceiros R$10).",
        "Lista 28 un · R$140, inclui quitações Gerb (30/09) e JV (01/10). Só do dia: 26 un · R$130.",
        "Mikelly 3 fiado · R$15. Perdas 4. 26 + 3 + 4 = 33.",
        "Jamile 4 un em espécie, convertido em pix via Henrique.",
        "Lucro final R$80 = R$40 operacional + R$40 bônus (140 + 40 − 100).",
        "Ana Laura 15 un · R$75 segue em aberto. Cofrinho prático R$3.773,95.",
      ].join("\n"),
      manualInsights: "Lucro R$80 com bônus de R$40 dentro.",
      lessonsLearned: "Bônus fica separado no diário para não somar duas vezes.",
    },
  };

  await registerDay(day01);
  await settleJv0110();
  await registerDay(day02);
  await setPracticalProfitBankBalance(BUSINESS, PRACTICAL);
  console.log("✓ Cofrinho prático → R$3.773,95");
  console.log("ALL_DAYS_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
