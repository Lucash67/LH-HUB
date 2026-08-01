/**
 * Registra 31/07/2026 — Salgados (15 un, sabor novo Pastel de Carne + bonificação).
 * Uso: pnpm tsx scripts/register-day-3107.ts
 */
import "./load-env";
import { parseDayDraft } from "../src/lib/day-registration/draft-parser";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { DRAFT_2026_07_31 } from "./drafts/3107";

const BUSINESS = "salgados";
const DATE = "2026-07-31";

async function applyBonusAndNarrative(plan: DayRegistrationPlan): Promise<void> {
  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 31/07 não encontrado após commit.");

  const profitSalgados = 47.5;
  const bonusIncome = 15;
  const bonusIncomeDescription =
    "Bonificação do Henrique: R$15,00 (R$1,00 por salgado vendido por mim × 15).";
  const totalProfit = deriveDiaryTotalProfit({ profit: profitSalgados, bonusIncome });

  await upsertDiaryEntry({
    ...entry,
    profit: profitSalgados,
    bonusIncome,
    bonusIncomeDescription,
    quantitySold: 15,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: [
      plan.manualInsights,
      bonusIncomeDescription,
      `Faturamento do dia: R$90 (75 dos 15 salgados + 15 da bonificação do meu pai).`,
      `Lucro operacional salgados: R$${profitSalgados.toFixed(2)} (faturamento R$75 − investimento próprio R$27,50).`,
      `Lucro total do dia: R$${totalProfit.toFixed(2)} (salgados + bonificação).`,
      "Pastel de carne frito esgotou rápido — manter no cardápio.",
      "Pastéis (frango/presunto) venderam rápido; Dayanna pegou mistão por falta de pastel.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Pastel de carne frito (sabor novo) vendeu as 3 unidades rápido — vale continuar.",
        "Pastéis clássicos esgotaram cedo; demanda reprimida no mistão por falta de pastel.",
        bonusIncomeDescription,
      ],
      conclusion: `Lucro total R$${totalProfit.toFixed(2)} = R$${profitSalgados.toFixed(2)} salgados + R$${bonusIncome} bonificação.`,
    },
    lessonsLearned:
      "Pastel de carne frito tem boa saída; pastéis clássicos precisam de volume maior nos dias quentes de venda.",
  });

  console.log(
    `Bonificação aplicada: lucro salgados R$${profitSalgados} + bônus R$${bonusIncome} = R$${totalProfit.toFixed(2)}`,
  );
}

async function main(): Promise<void> {
  const { plan, errors, warnings } = parseDayDraft(DRAFT_2026_07_31);
  if (!plan || errors.length > 0) {
    console.error("Erros de parse:", errors);
    throw new Error("Parse falhou em 31/07");
  }

  plan.summary = {
    ...plan.summary,
    revenue: 75,
    profit: 47.5,
    quantitySold: 15,
    quantityLost: 0,
  };

  const paidUnits = plan.sales
    .filter((s) => s.paymentStatus === "paid")
    .reduce((sum, s) => sum + s.quantity, 0);
  const carne = plan.sales
    .filter((s) => s.productName === "Pastel de Carne")
    .reduce((sum, s) => sum + s.quantity, 0);
  const pastelPadrao = plan.sales
    .filter((s) => s.productName === "Pastel de Frango com Presunto")
    .reduce((sum, s) => sum + s.quantity, 0);

  console.log("--- 2026-07-31 preview ---");
  console.log(`Linhas: ${plan.sales.length} · Pagas: ${paidUnits} un`);
  console.log(`Pastel de Carne: ${carne} · Pastel padrão: ${pastelPadrao}`);
  console.log(`Faturamento: R$${plan.summary.revenue} · Lucro salgados: R$${plan.summary.profit}`);
  console.log(
    `Compra: ${plan.purchase?.totalUnits} un · próprio R$${plan.purchase?.ownInvestment} · pai R$${plan.purchase?.thirdParty?.amount}`,
  );
  if (warnings.length) console.log("Avisos:", warnings.slice(0, 4).join(" | "));

  if (paidUnits !== 15) throw new Error(`Esperava 15 un pagas, veio ${paidUnits}`);
  if (carne !== 3) throw new Error(`Esperava 3 Pastel de Carne, veio ${carne}`);
  if (pastelPadrao !== 4) throw new Error(`Esperava 4 Pastel padrão, veio ${pastelPadrao}`);
  if (plan.purchase?.totalUnits !== 15) {
    throw new Error(`Esperava compra 15 un, veio ${plan.purchase?.totalUnits}`);
  }

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) throw new Error(`Dia ainda tem ${existing} venda(s) após limpeza.`);

  const sanitized = sanitizeRegistrationPlan(plan);
  const result = await commitDayRegistration(sanitized);
  console.log(`✅ Commit: ${result.saleIds.length} vendas, diário ${result.diaryId}`);

  await fixDayPricing(BUSINESS, DATE);
  await applyBonusAndNarrative(plan);

  const finalEntry = await getDiaryEntry(BUSINESS, DATE);
  console.log("\n=== 31/07 conferência ===");
  console.log({
    revenue: finalEntry?.revenue,
    profit: finalEntry?.profit,
    bonusIncome: finalEntry?.bonusIncome,
    totalProfit: deriveDiaryTotalProfit({
      profit: finalEntry?.profit ?? 0,
      bonusIncome: finalEntry?.bonusIncome,
    }),
    quantitySold: finalEntry?.quantitySold,
  });
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
