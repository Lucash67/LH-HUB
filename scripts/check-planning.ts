/** Uso: pnpm tsx scripts/check-planning.ts — imprime o planejamento de setembro e outubro. */
import "./load-env";
import { getPlanningView } from "../src/lib/planning/planning-service";

async function main() {
  for (const month of ["2026-09", "2026-10"]) {
    const v = await getPlanningView("salgados", month);
    console.log(`\n=== ${v.label} ===`);
    console.log({
      goal: v.goal,
      dailyTarget: v.dailyTarget,
      sellingDays: v.sellingDays,
      registeredDays: v.registeredDays,
      remainingDays: v.remainingDays,
      profitDone: v.profitDone,
      bank: v.bank,
      bankSource: v.bankSource,
      practical: v.practicalBalance,
      recentAverage: v.recentAverage,
      projection: v.projection,
    });
    console.log(v.weeks);
    console.log(v.scenarios);
    console.log(v.summary);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
