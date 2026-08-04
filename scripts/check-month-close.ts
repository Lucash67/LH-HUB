/** Confere o Fechamento & Tendência contra a base diária. Uso: pnpm tsx scripts/check-month-close.ts */
import "./load-env";
import { getMonthCloseView } from "../src/lib/month-close-service";

const money = (n: number) => `R$${n.toFixed(2)}`;

async function main(): Promise<void> {
  const view = await getMonthCloseView("salgados");
  if (!view) {
    console.log("Sem view (nenhum mês com dados).");
    process.exit(0);
  }

  const r = view.reference;
  console.log(`\n===== FECHAMENTO: ${r.label} =====`);
  console.log(
    `receita ${money(r.revenue)} | lucro ${money(r.profit)} | custo ${money(r.costs)} | ${r.units} un | margem ${r.margin}%`,
  );
  console.log(
    `dias operados ${r.daysOperated} | úteis no mês ${r.daysAvailable} | úteis desde ${r.firstOperationalDate} ${r.daysAvailableSinceStart} | presença ${(r.attendanceRate * 100).toFixed(0)}%`,
  );
  console.log(
    `média/dia: receita ${money(r.avgDailyRevenue)} lucro ${money(r.avgDailyProfit)} un ${r.avgDailyUnits}`,
  );
  console.log(
    `mediana lucro ${money(r.medianDailyProfit)} | p25 lucro ${money(r.lowDailyProfit)} | últimos 5 dias ${money(r.recentAvgDailyProfit)}`,
  );
  console.log(
    `bônus ${money(r.bonusIncome)} (${money(r.bonusPerUnit)}/un) | preço médio ${money(r.avgUnitPrice)} | custo/receita ${(r.costRatio * 100).toFixed(1)}%`,
  );
  console.log(
    `tendência interna ${r.trendPercent}% (${r.trendLabel}) | consistência ${r.consistencyPercent}%`,
  );
  console.log(`melhor dia ${r.bestDay?.label} ${money(r.bestDay?.profit ?? 0)} | pior ${r.worstDay?.label} ${money(r.worstDay?.profit ?? 0)}`);

  console.log(`\n===== PRÓXIMO MÊS: ${view.nextMonth.label} =====`);
  console.log(
    `dias úteis disponíveis ${view.nextMonth.daysAvailable} | esperados ${view.nextMonth.expectedDaysOperated} | +${view.nextMonth.daysGrowthPercent}% vs dias operados em ${r.shortLabel}`,
  );

  console.log("\n----- CENÁRIOS -----");
  for (const s of view.scenarios) {
    console.log(
      `${s.label.padEnd(12)} | ${s.daysOperated} dias | receita ${money(s.revenue)} (${s.changeVsReference.revenue > 0 ? "+" : ""}${s.changeVsReference.revenue}%) | lucro ${money(s.profit)} (${s.changeVsReference.profit > 0 ? "+" : ""}${s.changeVsReference.profit}%) | ${s.units} un | margem ${s.margin}% | bônus ${money(s.bonusIncome)}`,
    );
    console.log(`             ↳ ${s.premise}`);
    // Conferência: o cenário deve ser exatamente diária × dias.
    const expected = Math.round(s.dailyProfit * s.daysOperated * 100) / 100;
    if (Math.abs(expected - s.profit) > 0.1) {
      console.log(`             ⚠ inconsistência: ${expected} != ${s.profit}`);
    }
  }

  console.log("\n----- METAS DERIVADAS (realista) -----");
  for (const g of view.derivedGoals) {
    console.log(
      `${g.type.padEnd(8)} | ${g.label} | receita ${money(g.targetRevenue)} | lucro ${money(g.targetProfit)} | ${g.targetUnits} un`,
    );
    console.log(`         ↳ ${g.basis}`);
  }

  console.log("\n----- PLANO SEMANAL -----");
  let planRevenue = 0;
  let planUnits = 0;
  for (const w of view.weeklyPlan) {
    console.log(
      `${w.label} ${w.rangeLabel} | ${w.operationalDays} dias | peso ${w.weightPercent}% | receita ${money(w.targetRevenue)} | lucro ${money(w.targetProfit)} | ${w.targetUnits} un (${w.dailyUnits}/dia)`,
    );
    planRevenue += w.targetRevenue;
    planUnits += w.targetUnits;
  }
  const realista = view.scenarios.find((s) => s.key === "realista")!;
  console.log(
    `SOMA DO PLANO: receita ${money(planRevenue)} (cenário ${money(realista.revenue)}) | ${planUnits} un (cenário ${realista.units})`,
  );
  const totalPlanDays = view.weeklyPlan.reduce((s, w) => s + w.operationalDays, 0);
  console.log(`dias no plano: ${totalPlanDays} (úteis do mês: ${view.nextMonth.daysAvailable})`);

  console.log("\n----- PERFIL POR DIA DA SEMANA -----");
  for (const p of view.weekdayProfile) {
    console.log(
      `${p.label} | ${p.sampleDays} dias | receita ${money(p.avgRevenue)} | lucro ${money(p.avgProfit)} | ${p.avgUnits} un | índice ${p.indexVsAverage}`,
    );
  }

  console.log("\n----- CAPITAL -----");
  console.log(view.capitalPlan ? JSON.stringify(view.capitalPlan, null, 2) : "sem dados de investimento");

  console.log("\n----- MARCOS -----");
  for (const m of view.milestones) {
    console.log(`${m.label} → ${m.dateLabel} (${m.operationalDaysAway}º dia útil)`);
  }

  console.log("\n----- CONFIANÇA -----");
  console.log(`${view.confidence.level} · ${view.confidence.reason}`);

  console.log("\n----- ANO -----");
  console.log(JSON.stringify(view.yearOutlook));

  console.log("\n----- HISTÓRICO -----");
  for (const h of view.history) {
    console.log(`${h.label} | receita ${money(h.revenue)} | lucro ${money(h.profit)} | ${h.units} un | ${h.daysOperated} dias`);
  }

  console.log("\n----- ACOMPANHAMENTO -----");
  console.log(view.tracking ? JSON.stringify(view.tracking, null, 2) : "mês seguinte ainda sem dias operados");

  console.log("\n----- NARRATIVA -----");
  console.log(view.narrative);

  console.log("\n----- INSIGHTS -----");
  view.insights.forEach((i, idx) => console.log(`${idx + 1}. ${i}`));

  console.log(`\nmeses disponíveis: ${view.availableMonths.map((m) => m.monthKey).join(", ")}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
