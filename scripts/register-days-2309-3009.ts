/**
 * Registra 23–25/09 e 28–30/09/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-days-2309-3009.ts
 *
 * Prioridade: lucro final e cofrinho prático escritos na nota. A lista de vendas
 * é lida da própria nota; fiados ficam só como pendente no diário, fora do lucro.
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
import { listStickyNotes } from "@/platform/db/repositories/sticky-note-repository";

const BUSINESS = "salgados";
const OWNER_ID = "55c8453d-509f-4ed2-a7f4-180faa4673e4";
const ACAL = "Acal";
const HENRIQUE = "Colegas do Henrique";

interface DayConfig {
  date: string;
  units: number;
  investment: number;
  own: number;
  profit: number;
  received: number;
  pending: number;
  creditCount: number;
  lost: number;
  practical: number;
  henriqueWorkTime?: string;
  extra: string;
}

const DAYS: DayConfig[] = [
  {
    date: "2026-09-23", units: 32, investment: 98.5, own: 50, profit: 70, received: 120,
    pending: 30, creditCount: 6, lost: 2, practical: 3168.38,
    extra: "Fiados: Mikelly 2, João Pedro 2, Gerb 1, Laura 1. Perdas 2 não identificadas.",
  },
  {
    date: "2026-09-24", units: 32, investment: 98.5, own: 65, profit: 75, received: 140,
    pending: 25, creditCount: 5, lost: 1, practical: 3244.8,
    extra: "Fiados: Mikelly 2, Porteiro 1, Laura 2. Perda 1 desconhecida.",
  },
  {
    date: "2026-09-25", units: 30, investment: 98.5, own: 80, profit: 80, received: 160,
    pending: 10, creditCount: 2, lost: 7, practical: 3326.25, henriqueWorkTime: "17:42",
    extra: "Fechamento R$160 com 7 un de quitação (Mikelly 4, Vanderson 1, João Pedro 2). Henrique 10 · R$50. Fiado Mikelly 2. Perdas 7.",
  },
  {
    date: "2026-09-28", units: 30, investment: 92, own: 50, profit: 60, received: 110,
    pending: 30, creditCount: 6, lost: 4, practical: 3387.66,
    extra: "Fiados: JV 1, Claudinha 2, Porteiro 1, Mikelly 1, Laura 1. Perdas 4.",
  },
  {
    date: "2026-09-29", units: 30, investment: 92, own: 70, profit: 70, received: 140,
    pending: 15, creditCount: 3, lost: 4, practical: 3460.71,
    extra: "Quitação Claudinha 2 dentro do fechamento. Fiados: Mikelly 2, Laura 1. Laura acumulado 13 · R$65; Mikelly 6 · R$30.",
  },
  {
    date: "2026-09-30", units: 48, investment: 108, own: 100, profit: 100, received: 200,
    pending: 35, creditCount: 7, lost: 4, practical: 3560.71,
    extra: "Fechamento da lista R$190; real do dia R$200. Fiados: Gerb 2, Carlos 1, Mikelly 1, Laura 3. Laura acumulado 15 · R$75; Mikelly 7 · R$35.",
  },
];

const SALE_LINE =
  /^(?:\d+\.\s*)?(\d{1,2}:\d{2})\s*[—-]\s*(.+?)\s*[—-]\s*(\d+)\s*salgados?\s*[—-]\s*R\$\s*([\d.,]+)(.*)$/i;
const UNKNOWN_LINE = /^(?:\d+\.\s*)?N[aã]o identificado\s*[—-]\s*(.+?)\s*[—-]\s*(\d+)\s*salgados?/i;

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseSales(body: string, day: DayConfig): DraftSale[] {
  const out: DraftSale[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const match = SALE_LINE.exec(line);
    if (match) {
      const [, time, clientName, qty, , rest] = match;
      const hhmm = time.padStart(5, "0");
      out.push({
        time: hhmm,
        clientName: clientName.trim(),
        quantity: Number(qty),
        productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
        paymentMethod: "pix",
        paymentStatus: "paid",
        department: hhmm === day.henriqueWorkTime ? HENRIQUE : ACAL,
        notes: rest.trim() || undefined,
      });
      continue;
    }
    const unknown = UNKNOWN_LINE.exec(line);
    if (unknown) {
      out.push({
        time: "18:00",
        clientName: unknown[1].trim(),
        quantity: Number(unknown[2]),
        productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
        paymentMethod: "pix",
        paymentStatus: "paid",
        department: ACAL,
        notes: "Sem horário na nota.",
      });
    }
  }
  return out;
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

async function registerDay(day: DayConfig, body: string) {
  const salesList = parseSales(body, day);
  if (salesList.length === 0) throw new Error(`${day.date}: nenhuma venda lida da nota`);
  const soldUnits = salesList.reduce((n, s) => n + s.quantity, 0);
  const henrique = salesList.find((s) => s.department === HENRIQUE);
  const third = Math.round((day.investment - day.own) * 100) / 100;

  const observations = [
    `Compra ${day.units} un · ${brl(day.investment)} (próprio ${brl(day.own)} + terceiros ${brl(third)}).`,
    `Lista da nota: ${soldUnits} un. Recebido ${brl(day.received)}. Lucro final ${brl(day.profit)} (= recebido − próprio).`,
    day.extra,
    `Fiados ${brl(day.pending)} pendentes, fora do lucro. Cofrinho prático ${brl(day.practical)}.`,
  ].join("\n");

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: day.date,
    purchase: {
      totalUnits: day.units,
      investment: day.investment,
      ownInvestment: day.own,
      thirdParty: { name: "Terceiros", amount: third },
      products: [{ name: UNIDENTIFIED_FLAVOR_PRODUCT_NAME, quantity: day.units }],
    },
    summary: {
      revenue: day.received,
      profit: day.profit,
      quantitySold: soldUnits,
      quantityLost: day.lost,
      forecastProfit: 70,
    },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations,
    manualInsights: `Lucro final ${brl(day.profit)} conforme a nota. Fechamento rápido do mês: foco em lucro e cofrinho.`,
    lessonsLearned: "Lucro e cofrinho da nota mandam; detalhes de fiado ficam no pendente.",
  };

  console.log(`\n======== SALGADOS ${day.date} ========`);
  await cleanupOperationDay(BUSINESS, day.date);
  const existing = await countSalesForDate(BUSINESS, day.date);
  if (existing > 0) throw new Error(`${day.date}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s), ${soldUnits} un`);

  const diaryPatch = {
    profit: day.profit,
    bonusIncome: undefined,
    quantitySold: soldUnits,
    quantityLost: day.lost,
    revenue: { received: day.received, pending: day.pending, total: day.received + day.pending },
  };

  const entry = await getDiaryEntry(BUSINESS, day.date);
  if (!entry) throw new Error(`${day.date}: diário ausente`);
  await upsertDiaryEntry({
    ...entry,
    ...diaryPatch,
    observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    sales: {
      paidCount: soldUnits,
      creditCount: day.creditCount,
      ...(henrique
        ? { fatherSale: { units: henrique.quantity, amount: henrique.quantity * 5, buyerName: HENRIQUE } }
        : {}),
    },
  });

  await fixDayPricing(BUSINESS, day.date);
  const after = await getDiaryEntry(BUSINESS, day.date);
  if (!after) throw new Error(`${day.date}: diário sumiu após preço`);
  if (after.profit !== day.profit || after.revenue.received !== day.received || after.revenue.pending !== day.pending) {
    await upsertDiaryEntry({ ...after, ...diaryPatch });
  }

  const saved = await getDiaryEntry(BUSINESS, day.date);
  if (!saved || saved.profit !== day.profit || saved.revenue.received !== day.received) {
    throw new Error(`${day.date}: não fechou em lucro ${day.profit} / rec ${day.received}`);
  }
  console.log(`✅ ${day.date} OK — lucro ${brl(day.profit)} · rec ${brl(day.received)} · pend ${brl(day.pending)}`);
}

async function main() {
  const notes = await listStickyNotes(OWNER_ID);
  for (const day of DAYS) {
    const note = notes.find((n) => n.noteDate === day.date && n.body.trim().length > 0);
    if (!note) throw new Error(`${day.date}: nota não encontrada`);
    await registerDay(day, note.body);
  }
  const last = DAYS[DAYS.length - 1];
  await setPracticalProfitBankBalance(BUSINESS, last.practical);
  console.log(`✓ Cofrinho prático → ${brl(last.practical)}`);
  console.log("ALL_DAYS_OK");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
