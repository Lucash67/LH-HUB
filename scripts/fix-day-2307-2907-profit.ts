/**
 * Ajuste 23/07 (lucro R$35) e 29/07 (lucro total R$64,50 com bonificação).
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { fixDayPricing } from "./fix-day-pricing";

async function fix2307(businessSlug: string): Promise<void> {
  const date = "2026-07-23";
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.error("Diário 23/07 não encontrado.");
    process.exit(1);
  }

  const revenue = 75;
  const profit = 35;
  const note =
    "Lucro operacional R$ 35,00 (= faturamento R$ 75 − investimento próprio R$ 40). " +
    "Henrique pagou R$ 12,50 do investimento (total R$ 52,50). 15 salgados vendidos no dia.";

  await upsertDiaryEntry({
    ...entry,
    revenue: { received: revenue, pending: 0, total: revenue },
    profit,
    quantitySold: 15,
    observations:
      "15 un vendidas · R$ 75 · lucro R$ 35. Investimento: R$ 40 próprio + R$ 12,50 Henrique.",
    manualInsights: note,
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Henrique dividiu R$ 12,50 do investimento.",
        "Capital próprio R$ 40 — lucro operacional R$ 35.",
      ],
      conclusion: note,
    },
  });

  await fixDayPricing(businessSlug, date);
  console.log(`23/07 atualizado: faturamento R$${revenue}, lucro R$${profit}.`);
}

async function fix2907(businessSlug: string): Promise<void> {
  const date = "2026-07-29";
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.error("Diário 29/07 não encontrado.");
    process.exit(1);
  }

  const profit = 49.5;
  const bonusIncome = 15;
  const bonusIncomeDescription =
    "Bonificação do Henrique: R$1,00 por salgado vendido (15 salgados = R$15,00).";
  const total = deriveDiaryTotalProfit({ profit, bonusIncome });

  await upsertDiaryEntry({
    ...entry,
    profit,
    bonusIncome,
    bonusIncomeDescription,
    revenue: { received: 75, pending: 0, total: 75 },
    quantitySold: 15,
    manualInsights: [
      entry.manualInsights,
      bonusIncomeDescription,
      `Lucro total do dia: R$${total.toFixed(2)} (salgados + bonificação).`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Lucro operacional dos salgados: R$49,50 (faturamento R$75 − investimento próprio R$25,50).",
        bonusIncomeDescription,
      ],
      conclusion: `Lucro total do dia R$${total.toFixed(2)} = R$49,50 salgados + R$15 bonificação do pai.`,
    },
  });

  await fixDayPricing(businessSlug, date);
  console.log(`29/07 atualizado: lucro total R$${total.toFixed(2)} (salgados R$${profit} + bonificação R$${bonusIncome}).`);
}

async function main(): Promise<void> {
  const businessSlug = "salgados";
  await fix2307(businessSlug);
  await fix2907(businessSlug);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
