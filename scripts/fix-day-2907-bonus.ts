/**
 * Ajuste 29/07 — bonificação Henrique R$15 soma ao lucro do dia (total R$64,50).
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";

async function main(): Promise<void> {
  const businessSlug = "salgados";
  const date = "2026-07-29";
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.error("Diário 29/07 não encontrado.");
    process.exit(1);
  }

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

  console.log(
    `29/07 atualizado: lucro salgados R$49,50 + bonificação R$${bonusIncome} = R$${deriveDiaryTotalProfit({ profit: 49.5, bonusIncome }).toFixed(2)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
