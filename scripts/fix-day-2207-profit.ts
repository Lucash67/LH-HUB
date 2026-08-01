/**
 * Ajuste pontual 22/07 — lucro R$ 52,50 (75 − 22,50 investimento próprio).
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { fixDayPricing } from "./fix-day-pricing";

async function main(): Promise<void> {
  const businessSlug = "salgados";
  const date = "2026-07-22";
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.error("Diário 22/07 não encontrado.");
    process.exit(1);
  }

  const revenue = 75;
  const profit = 52.5;
  const henriqueNote =
    "Henrique pagou R$ 30,00 do investimento; minha parte foi R$ 22,50. " +
    "15 salgados a R$ 5 → lucro operacional R$ 52,50 (= faturamento − meu investimento).";

  await upsertDiaryEntry({
    ...entry,
    revenue: { received: revenue, pending: 0, total: revenue },
    profit,
    quantitySold: 15,
    purchase: entry.purchase
      ? { ...entry.purchase, totalUnits: 15, investment: 52.5 }
      : undefined,
    observations:
      "15 un vendidas · R$ 75 · lucro R$ 52,50. Investimento: R$ 22,50 próprio + R$ 30,00 Henrique.",
    manualInsights: henriqueNote,
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Henrique dividiu R$ 30,00 do investimento (total R$ 52,50).",
        "Capital próprio: R$ 22,50 — lucro operacional R$ 52,50.",
      ],
      conclusion: henriqueNote,
    },
  });

  await fixDayPricing(businessSlug, date);
  console.log(`22/07 atualizado: faturamento R$${revenue}, lucro R$${profit}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
