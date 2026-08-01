/**
 * Corrige lucro dos dias em que Henrique pagou 100% — lucro = faturamento.
 * Uso: pnpm tsx scripts/fix-zero-cost-days.ts salgados 2026-07-16 2026-07-17
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { fixDayPricing } from "./fix-day-pricing";

async function fixZeroCostDay(businessSlug: string, date: string): Promise<void> {
  const entry = await getDiaryEntry(businessSlug, date);
  if (!entry) {
    console.log(`Sem diário em ${date}.`);
    return;
  }

  const revenue = entry.revenue.received;
  if (Math.abs(entry.profit - revenue) < 0.01) {
    console.log(`${date}: lucro já igual ao faturamento (R$${revenue.toFixed(2)}).`);
    await fixDayPricing(businessSlug, date);
    return;
  }

  const henriqueNote =
    `Henrique arcou com 100% do investimento (R$${(entry.purchase?.investment ?? 0).toFixed(2)}) — ` +
    `lucro operacional = faturamento (sem custo próprio nos salgados).`;

  await upsertDiaryEntry({
    ...entry,
    profit: revenue,
    manualInsights: [henriqueNote, entry.manualInsights].filter(Boolean).join("\n\n"),
    commercialIntelligence: {
      whatWeLearnedToday: [
        `Investimento integral do Henrique — R$${(entry.purchase?.investment ?? 0).toFixed(2)}.`,
        "Lucro operacional igual ao faturamento (custo zero para o operador).",
      ],
      conclusion: henriqueNote,
    },
  });

  await fixDayPricing(businessSlug, date);
  console.log(`${date}: lucro atualizado para R$${revenue.toFixed(2)} (= faturamento).`);
}

async function main(): Promise<void> {
  const [, , businessSlug = "salgados", ...dates] = process.argv;
  const targets = dates.length > 0 ? dates : ["2026-07-16", "2026-07-17"];

  for (const date of targets) {
    await fixZeroCostDay(businessSlug, date);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
