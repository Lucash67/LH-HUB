/**
 * Registra dias 23, 24, 27, 28 (re) e 29/07/2026 — operação Salgados.
 * Uso: pnpm tsx scripts/register-days-2307-2907.ts
 */
import "./load-env";
import { parseDayDraft } from "../src/lib/day-registration/draft-parser";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import {
  DRAFT_2026_07_23,
  DRAFT_2026_07_24,
  DRAFT_2026_07_27,
  DRAFT_2026_07_28,
  DRAFT_2026_07_29,
} from "./drafts/2307-2907";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { cleanupOperationDay } from "./cleanup-operation-day";

const BUSINESS = "salgados";

interface DaySpec {
  date: string;
  draft: string;
  overrides?: Partial<DayRegistrationPlan["summary"]> & {
    manualInsights?: string;
    quantityLost?: number;
    lossReason?: string;
  };
  cleanup?: boolean;
}

const DAYS: DaySpec[] = [
  {
    date: "2026-07-23",
    draft: DRAFT_2026_07_23,
    overrides: { revenue: 75, profit: 35, quantitySold: 15, quantityLost: 1, lossReason: "1 salgado sumiu (sem pagamento registrado)" },
    cleanup: true,
  },
  {
    date: "2026-07-24",
    draft: DRAFT_2026_07_24,
    overrides: { revenue: 110, profit: 95, quantitySold: 22 },
    cleanup: true,
  },
  {
    date: "2026-07-27",
    draft: DRAFT_2026_07_27,
    overrides: { revenue: 150, profit: 108, quantitySold: 30 },
    cleanup: true,
  },
  {
    date: "2026-07-28",
    draft: DRAFT_2026_07_28,
    overrides: { revenue: 55, profit: 34, quantitySold: 12, quantityLost: 1, lossReason: "1 salgado pegou sem pagar" },
    cleanup: true,
  },
  {
    date: "2026-07-29",
    draft: DRAFT_2026_07_29,
    overrides: { revenue: 75, profit: 49.5, quantitySold: 15 },
    cleanup: true,
  },
];

function cleanupDay(date: string): Promise<void> {
  return cleanupOperationDay(BUSINESS, date);
}

async function registerDay(spec: DaySpec): Promise<void> {
  const { plan, errors, warnings } = parseDayDraft(spec.draft);
  if (!plan || errors.length > 0) {
    console.error(`\n❌ ${spec.date} — erros de parse:`, errors);
    throw new Error(`Parse falhou em ${spec.date}`);
  }

  if (spec.overrides) {
    plan.summary = { ...plan.summary, ...spec.overrides };
    if (spec.overrides.manualInsights) {
      plan.manualInsights = spec.overrides.manualInsights;
    }
    if (spec.overrides.lossReason) {
      plan.summary.lossReason = spec.overrides.lossReason;
    }
  }

  console.log(`\n--- ${spec.date} ---`);
  console.log(`Vendas: ${plan.sales.length} · Unidades: ${plan.sales.reduce((s, x) => s + x.quantity, 0)}`);
  console.log(`Faturamento: R$${plan.summary.revenue} · Lucro: R$${plan.summary.profit}`);
  if (warnings.length) console.log("Avisos:", warnings.slice(0, 4).join(" | "));

  if (spec.cleanup) {
    await cleanupDay(spec.date);
  }

  const existing = await countSalesForDate(BUSINESS, spec.date);
  if (existing > 0) {
    throw new Error(`Dia ${spec.date} ainda tem ${existing} venda(s) após limpeza.`);
  }

  console.log(`Commit ${spec.date}...`);

  const sanitized = sanitizeRegistrationPlan(plan);
  const result = await commitDayRegistration(sanitized);
  console.log(`✅ Registrado: ${result.saleIds.length} vendas, diário ${result.diaryId}`);
}

async function apply2907Bonus(): Promise<void> {
  const date = "2026-07-29";
  const entry = await getDiaryEntry(BUSINESS, date);
  if (!entry) return;

  const bonusIncome = 15;
  const bonusIncomeDescription =
    "Bonificação do Henrique: R$1,00 por salgado vendido (15 salgados = R$15,00).";

  await upsertDiaryEntry({
    ...entry,
    profit: 49.5,
    bonusIncome,
    bonusIncomeDescription,
    manualInsights: [
      entry.manualInsights,
      bonusIncomeDescription,
      `Lucro total do dia: R$${deriveDiaryTotalProfit({ profit: 49.5, bonusIncome }).toFixed(2)} (salgados + bonificação).`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Lucro operacional dos salgados: R$49,50 (faturamento R$75 − investimento próprio R$25,50).",
        bonusIncomeDescription,
      ],
      conclusion: `Lucro total do dia R$64,50 = R$49,50 salgados + R$15 bonificação do pai.`,
    },
  });
  console.log(`\n29/07 bonificação aplicada — lucro total R$64,50`);
}

async function main(): Promise<void> {
  for (const spec of DAYS) {
    await registerDay(spec);
  }
  await apply2907Bonus();

  const { execSync } = await import("child_process");
  execSync(`pnpm tsx scripts/sync-all-operational-profits.ts ${BUSINESS}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
