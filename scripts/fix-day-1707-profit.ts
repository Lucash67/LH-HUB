/**
 * Ajuste pontual 17/07 — lucro R$ 60 (= faturamento, Henrique pagou 100%).
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { fixDayPricing } from "./fix-day-pricing";

async function main(): Promise<void> {
  const businessSlug = "salgados";
  const date = "2026-07-17";
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.error("Diário 17/07 não encontrado.");
    process.exit(1);
  }

  const revenue = 60;
  const profit = 60;
  const henriqueNote =
    "Henrique arcou com 100% do investimento (R$ 42,00) — não tirei um centavo do bolso. " +
    "Lucro operacional = faturamento (R$ 60,00).";

  await upsertDiaryEntry({
    ...entry,
    revenue: { received: revenue, pending: 0, total: revenue },
    profit,
    quantitySold: 12,
    observations:
      "ROO-0002. 12 un vendidas · R$ 60 · lucro R$ 60 (= faturamento). Investimento R$ 42,00 — Henrique 100%, sem custo próprio.",
    manualInsights: henriqueNote,
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Investimento integral do Henrique — R$ 42,00.",
        "Lucro operacional igual ao faturamento (custo zero para o operador).",
      ],
      conclusion: henriqueNote,
    },
  });

  await fixDayPricing(businessSlug, date);
  console.log(`17/07 atualizado: faturamento R$${revenue}, lucro R$${profit} (zero investimento próprio).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
