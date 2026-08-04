/** Confere o resumo da semana da dashboard. Uso: pnpm tsx scripts/check-week-pulse.ts */
import "./load-env";
import {
  buildOperationalDayMetrics,
  sortOperationalDays,
} from "../src/lib/operational-day-metrics";
import { buildWeekPulse } from "../src/lib/week-pulse";
import { getSmartGoalsView } from "../src/lib/smart-goals-service";
import { fetchMetricGoals } from "../src/platform/db/data-access/metrics";
import { listSalesEnriched } from "../src/platform/db/repositories/sale-repository";

const BIZ = "salgados";
const fmt = (n: number) => `R$${n.toFixed(2)}`;

async function main(): Promise<void> {
  const metricsMap = await buildOperationalDayMetrics(BIZ);
  const dayMetrics = sortOperationalDays(metricsMap);

  const goals = await fetchMetricGoals(BIZ);
  let weeklyGoal = goals.find((g) => g.type === "weekly")?.targetAmount ?? 0;
  if (weeklyGoal <= 0) {
    const smart = await getSmartGoalsView(BIZ).catch(() => null);
    weeklyGoal = smart?.weekly.targetRevenue ?? 0;
  }
  console.log(`meta semanal usada: ${fmt(weeklyGoal)}\n`);

  const sales = await listSalesEnriched(BIZ);

  for (const focus of ["2026-08-01", "2026-07-31", "2026-07-24", "2026-08-04"]) {
    const pulse = buildWeekPulse(dayMetrics, focus, {
      goalRevenue: weeklyGoal,
      allowFallback: true,
      sales,
    });
    if (!pulse) {
      console.log(`foco ${focus}: sem dados na semana`);
      continue;
    }
    console.log(
      `foco ${focus} → semana ${pulse.rangeLabel} | fallback ${pulse.isFallback} | receita ${fmt(pulse.revenue)} | lucro ${fmt(pulse.profit)} | ${pulse.units} un | ${pulse.operationalDays} dias | margem ${pulse.margin.toFixed(1)}% | meta ${pulse.goalProgress.toFixed(0)}% | tendência ${pulse.profitTrend == null ? "—" : `${pulse.profitTrend.toFixed(0)}%`}`,
    );
    console.log(
      `   barras: ${pulse.days.map((d) => `${d.label}${d.isFocus ? "*" : ""} ${fmt(d.revenue)}/lucro ${fmt(d.profit)}`).join(" | ")}`,
    );
    console.log(
      `   receita vs anterior: ${pulse.revenueTrend == null ? "—" : `${pulse.revenueTrend.toFixed(0)}%`} | mix: ${pulse.products.map((p) => `${p.label} ${p.units}un`).join(", ") || "—"}`,
    );

    const manual = dayMetrics
      .filter((d) => d.date >= pulse.start && d.date <= pulse.end)
      .reduce((s, d) => s + d.revenue, 0);
    if (Math.abs(manual - pulse.revenue) > 0.01) {
      throw new Error(`divergência na semana de ${focus}: ${manual} vs ${pulse.revenue}`);
    }
  }

  const fallback = buildWeekPulse(dayMetrics, "2026-08-04", { allowFallback: true });
  console.log(
    `\nvisão geral (hoje 04/08, semana vazia) → ${fallback?.rangeLabel} | fallback ${fallback?.isFallback} | receita ${fmt(fallback?.revenue ?? 0)}`,
  );

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
