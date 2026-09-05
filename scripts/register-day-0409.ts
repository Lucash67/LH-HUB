/**
 * Registra 04/09/2026 — Salgados (só Henrique · sábado).
 * Uso: pnpm tsx scripts/register-day-0409.ts
 *
 * - Compra 7 un · R$24,50 (próprio R$0 + Terceiros R$24,50)
 * - Sem Acal/Unifor — Lucas não foi
 * - 1 ticket Henrique 7 un · fat R$35 · lucro R$35
 * - Fiados abertos: Anderson, Rodrigues, Ana Laura (não quitou)
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

const DATE = "2026-09-04";
const BUSINESS = "salgados";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  croissant: "Croissant",
  frangoCat: "Frango com Catupiry",
  carneForno: "Carne com Cheddar de Forno",
  unknown: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
} as const;

const OPEN_FIADOS =
  "Anderson das Chagas R$5 (24/08) · Jose Maclaurem Rodrigues R$5 (31/08) · Ana Laura R$5 (02/09 — não quitou em 04/09).";

async function refreshPendingNotes(): Promise<void> {
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);

  const updates: Array<{ saleDate: string; note: string }> = [
    {
      saleDate: "2026-08-24",
      note: "Fiado aberto R$5 — Anderson das Chagas (ex-Ismael). Pegou ~21/08; registro no 24/08. Ainda pendente em 04/09.",
    },
    {
      saleDate: "2026-08-31",
      note: "Fiado aberto R$5 — Jose Maclaurem Rodrigues. Ainda pendente em 04/09 (não quitou em 01/09).",
    },
    {
      saleDate: "2026-09-02",
      note: "Fiado aberto R$5 — Ana Laura. Prometeu 04/09 e não quitou; segue pendente.",
    },
  ];

  for (const u of updates) {
    const rows = await queryAll(
      db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.saleDate, u.saleDate),
            eq(sales.paymentStatus, "pending"),
          ),
        ),
    );
    for (const row of rows) {
      await queryRun(
        db
          .update(sales)
          .set({ notes: u.note, updatedAt: new Date() })
          .where(eq(sales.id, row.id)),
      );
      console.log(`✓ Fiado ${u.saleDate} notas atualizadas (ainda pendente)`);
    }
  }
}

async function main() {
  await refreshPendingNotes();

  const salesList: DraftSale[] = [
    {
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      productName: P.unknown,
      quantity: 7,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: DEPT_HENRIQUE,
      notes:
        "Só trabalho do Henrique (sem Acal/Unifor). 4 Mistão frito + 1 Croissant + 1 Frango c/ catupiry + 1 Carne forno — 100% vendidos (R$35). Clientes dele.",
    },
  ];

  const units = salesList.reduce((n, s) => n + s.quantity, 0);
  if (units !== 7) throw new Error(`Units ${units} ≠ 7`);

  const plan: DayRegistrationPlan = {
    businessId: BUSINESS,
    date: DATE,
    purchase: {
      totalUnits: 7,
      investment: 24.5,
      ownInvestment: 0,
      thirdParty: { name: "Terceiros", amount: 24.5 },
      products: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.croissant, quantity: 1 },
        { name: P.frangoCat, quantity: 1 },
        { name: P.carneForno, quantity: 1 },
      ],
      acalAllocation: [],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 4 },
        { name: P.croissant, quantity: 1 },
        { name: P.frangoCat, quantity: 1 },
        { name: P.carneForno, quantity: 1 },
      ],
    },
    summary: {
      revenue: 35,
      profit: 35,
      quantitySold: 7,
      quantityLost: 0,
      forecastProfit: 35,
    },
    sales: salesList,
    newClients: [
      {
        name: "Henrique Alberto Matos Da Rocha",
        sector: DEPT_HENRIQUE,
        notes: `Cliente — ${DEPT_HENRIQUE}`,
      },
    ],
    observations: [
      "04/09 (sábado) — só cota Henrique; Lucas não foi à Acal nem Unifor.",
      "Encomenda 7 un = R$24,50 (Mistão frito 4 · Croissant 1 · Frango c/ catupiry 1 · Carne forno 1).",
      "Custo próprio R$0 + Terceiros R$24,50 · bônus R$0.",
      "1 ticket Henrique 7 un · fat R$35 · lucro R$35 (= 35 − 0).",
      `Fiados abertos: ${OPEN_FIADOS}`,
      "Cofrinho prático (rascunho): R$2.293,23 (com rendimento).",
      "OBS: fidelidade / cardápio / anti-furto (Ideias).",
    ].join("\n"),
    manualInsights: "Dia curto só Henrique — lucro = faturamento (custo 100% terceiros).",
    lessonsLearned: "Nota tinha header 03/09 e “Total: 5”; canônico = 04/09 · 7 un · R$35.",
  };

  console.log(`\n======== SALGADOS ${DATE} ========`);
  console.log(`Preview: ${units} un · fat R$35 · lucro R$35 · compra 7/R$24,50 own 0 · só Henrique`);

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s) · diary ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 04/09 ausente");

  await upsertDiaryEntry({
    ...entry,
    profit: 35,
    bonusIncome: undefined,
    quantitySold: 7,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: 35, pending: 0, total: 35 },
    sales: {
      paidCount: 7,
      creditCount: 0,
      fatherSale: { units: 7, amount: 35, buyerName: "Colegas do Henrique" },
    },
  });

  // Corrige sticky note_date body se ainda disser 03/09 — opcional via SQL fora.

  const nSales = await countSalesForDate(BUSINESS, DATE);
  console.log(`✅ ${DATE} OK — ${nSales} tickets · lucro R$35 · fat R$35 · só Henrique`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
