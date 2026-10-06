/**
 * Registra 05/10/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-day-0510.ts
 *
 * Compra 40 un · R$124 (próprio R$90 + terceiros R$34). 38 vendidas + 2 perdas.
 * Recebido R$195 (inclui quitação Anônimo 02/10 R$5). Lucro R$105 (= 195 − 90).
 * Henrique 12 un · R$60 = conversão de espécie (5 un · R$25) + troca Alecsandra R$35 — não é venda.
 * Pix −R$30 ao Lucas Henrique e a compra dele de 6 un · R$30 se anulam no banco.
 * Cofrinho prático → R$3.880,66.
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
const DATE = "2026-10-05";
const PRACTICAL = 3880.66;

const PROFIT = 105;
const RECEIVED = 195;
const PENDING = 0;
const SOLD = 38;
const LOST = 2;

const SALE_LINE =
  /^(?:\d+\.\s*)?(\d{1,2}:\d{2})\s*[—-]\s*(.+?)\s*[—-]\s*(\d+)\s*salgados?\s*[—-]\s*R\$\s*([\d.,]+)(.*)$/i;

function parseSales(body: string): DraftSale[] {
  const out: DraftSale[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const match = SALE_LINE.exec(raw.trim());
    if (!match) continue;
    const [, time, clientName, qty, , rest] = match;
    out.push({
      time: time.padStart(5, "0"),
      clientName: clientName.trim(),
      quantity: Number(qty),
      productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: ACAL,
      notes: rest.trim() || undefined,
    });
  }
  return out;
}

async function main() {
  const notes = await listStickyNotes(OWNER_ID);
  const note = notes.find((n) => n.noteDate === DATE && n.body.trim());
  if (!note) throw new Error("Nota 05/10 não encontrada");

  const sales = parseSales(note.body)
    .filter((s) => !/^Henrique Alberto/i.test(s.clientName))
    .map((s) =>
      /^Lucas Henrique Campos/i.test(s.clientName)
        ? { ...s, notes: "Pix −R$30 às 12:41 foi troca; compra de 6 un paga por pix." }
        : s,
    );
  const listUnits = sales.reduce((n, s) => n + s.quantity, 0);
  if (listUnits !== 39) throw new Error(`05/10: lista sem Henrique com ${listUnits} un ≠ 39 (38 + 1 quitação)`);

  const seen = new Set<string>();
  const newClients: DayRegistrationPlan["newClients"] = sales.flatMap((s) => {
    const key = s.clientName.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ name: s.clientName, sector: s.department, notes: `Cliente — ${s.department}` }];
  });

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 40,
      investment: 124,
      ownInvestment: 90,
      thirdParty: { name: "Terceiros", amount: 34 },
      products: [
        { name: "Mistão Frito", quantity: 12 },
        { name: "Queijo Frito", quantity: 8 },
        { name: "Mistão de Forno", quantity: 6 },
        { name: "Frango com Catupiry", quantity: 6 },
        { name: "Croissant", quantity: 4 },
        { name: "Carne com Cheddar de Forno", quantity: 4 },
      ],
    },
    summary: { revenue: RECEIVED, profit: PROFIT, quantitySold: SOLD, quantityLost: LOST, forecastProfit: 77 },
    sales,
    newClients,
    observations: [
      "Compra 40 un · R$124 (próprio R$90 + terceiros R$34).",
      "Unifor 20 separados, 15 vendidos; Acal 20 separados + 3 da Unifor, 23 vendidos. 38 + 2 perdas = 40.",
      "Fechamento R$195 = lista R$255 − Pix enviados R$60. Inclui quitação Anônimo (02/10) R$5.",
      "Henrique 12 un · R$60 = espécie (Jamile 2, Valentina 1, menina 1, Léo porteiro 1 = R$25) + troca Alecsandra R$35 — não é venda.",
      "Lucas Henrique: Pix −R$30 (troca) e 6 un · R$30 por pix — se anulam no banco.",
      "2 desconhecidos tratados como perdas (nenhum fiado avisado).",
      "Fiados em aberto: Ana Laura R$75, Mikelly R$15 (02/10).",
      "Lucro R$105 (= 195 − 90). Cofrinho prático R$3.880,66 (inclui ~R$1,71 de rendimento).",
    ].join("\n"),
    manualInsights: "Lucro R$105, acima da meta de R$77.",
    lessonsLearned: "Planejar a venda de sanduíches naturais.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`${DATE}: ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  const patch = {
    profit: PROFIT,
    quantitySold: SOLD,
    quantityLost: LOST,
    revenue: { received: RECEIVED, pending: PENDING, total: RECEIVED + PENDING },
  };

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error(`${DATE}: diário ausente`);
  await upsertDiaryEntry({
    ...entry,
    ...patch,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    sales: { paidCount: sales.length, creditCount: 0 },
  });

  await fixDayPricing(BUSINESS, DATE);
  const after = await getDiaryEntry(BUSINESS, DATE);
  if (!after) throw new Error(`${DATE}: diário sumiu após preço`);
  if (after.profit !== PROFIT || after.revenue.received !== RECEIVED || after.revenue.pending !== PENDING) {
    await upsertDiaryEntry({ ...after, ...patch });
  }

  const saved = await getDiaryEntry(BUSINESS, DATE);
  const total = saved ? saved.profit + (saved.bonusIncome ?? 0) : NaN;
  if (!saved || total !== PROFIT || saved.revenue.received !== RECEIVED) throw new Error(`${DATE}: não fechou`);
  console.log(`✅ ${DATE} OK — lucro R$${total} · rec R$${RECEIVED} · vendidos ${saved.quantitySold} · perdas ${saved.quantityLost}`);

  await setPracticalProfitBankBalance(BUSINESS, PRACTICAL);
  console.log("✓ Cofrinho prático → R$3.880,66");
  console.log("ALL_DAYS_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
