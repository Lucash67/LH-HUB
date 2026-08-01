/**
 * Sincroniza vendas de todos os dias com diário homologado (preço R$ 5/un + lucro real).
 * Uso: pnpm tsx scripts/sync-all-operational-profits.ts salgados
 */
import "./load-env";
import { listDiaryEntries } from "../src/lib/diary-service";
import { sumOperationalProfit } from "../src/lib/operational-day-metrics";
import { fixDayPricing } from "./fix-day-pricing";

async function main(): Promise<void> {
  const businessSlug = process.argv[2] ?? "salgados";
  const entries = await listDiaryEntries(businessSlug);
  const dates = entries.map((e) => e.date).sort();

  if (dates.length === 0) {
    console.log("Nenhum diário encontrado.");
    return;
  }

  console.log(`Sincronizando ${dates.length} dia(s)...`);

  for (const date of dates) {
    await fixDayPricing(businessSlug, date);
  }

  const totalProfit = await sumOperationalProfit(businessSlug);
  console.log(`\nLucro operacional total (diários): R$${totalProfit.toFixed(2)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
