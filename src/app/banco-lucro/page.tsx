"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoader } from "@/components/ui/loading";
import { ChartCard } from "@/components/charts/chart-card";
import { ExecutiveSummary } from "@/components/executive/executive-summary";
import { SectionPanel } from "@/components/executive/section-panel";
import { Input } from "@/components/ui/input";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { formatCurrency } from "@/lib/utils";
import type { ProfitBankView } from "@/lib/profit-bank-service";
import { simulateProfitBank, simulationSummary } from "@/lib/profit-bank-view";
import { PiggyBank, Calculator } from "lucide-react";

export default function BancoLucroPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const { data, isLoading } = useQuery<ProfitBankView>({
    queryKey: ["profit-bank", activeBusinessId],
    queryFn: () => fetch(withQuery("/api/profit-bank")).then((r) => r.json()),
  });

  const [saveRate, setSaveRate] = useState(100);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(0);
  const [horizonDays, setHorizonDays] = useState(90);

  const simulation = useMemo(() => {
    if (!data) return { points: [], summary: { finalBalance: 0, totalSaved: 0, totalWithdrawn: 0 } };
    const points = simulateProfitBank({
      startingBalance: data.currentBalance,
      avgDailyProfit: data.avgDailyProfit,
      saveRatePercent: saveRate,
      monthlyWithdrawal,
      horizonDays,
    });
    return { points, summary: simulationSummary(points) };
  }, [data, saveRate, monthlyWithdrawal, horizonDays]);

  if (isLoading || !data) {
    return (
      <AppShell title="Banco de Lucro" subtitle="Acumulação e simulação de reserva">
        <PageLoader />
      </AppShell>
    );
  }

  const historyChart = data.history.map((d) => ({
    label: d.label,
    value: d.balance,
    profit: d.profit,
    revenue: d.revenue,
  }));

  const simulationChart = simulation.points
    .filter((_, i) => i % Math.max(1, Math.floor(horizonDays / 30)) === 0 || i === simulation.points.length - 1)
    .map((p) => ({ label: p.label, value: p.balance }));

  return (
    <AppShell title="Banco de Lucro" subtitle="Quanto você teria guardando o lucro operacional">
      <div className="space-y-6">
        <ExecutiveSummary
          theme="finance"
          title="Acumulado real (100% do lucro guardado)"
          conclusion={`Se você guardasse todo o lucro operacional desde o início, hoje teria ${formatCurrency(data.currentBalance)} reservados em ${data.operationalDays} dias de operação.`}
          items={[
            { label: "Saldo acumulado", value: formatCurrency(data.currentBalance), highlight: true },
            { label: "Lucro total", value: formatCurrency(data.totalProfit), highlight: true },
            { label: "Receita total", value: formatCurrency(data.totalRevenue) },
            { label: "Lucro médio/dia", value: formatCurrency(data.avgDailyProfit) },
          ]}
        />

        <ChartCard
          title="Evolução do banco"
          subtitle="Saldo acumulado dia a dia (lucro guardado)"
          data={historyChart}
          type="area"
          height={300}
        />

        <SectionPanel theme="goals" title="Simulador" subtitle="Projeção futura — não altera dados reais">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-purple-500/20 bg-surface-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-text-primary">Parâmetros</span>
              </div>

              <label className="block text-sm">
                <span className="text-text-muted">% do lucro diário guardado</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={saveRate}
                  onChange={(e) => setSaveRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="mt-1"
                />
              </label>

              <label className="block text-sm">
                <span className="text-text-muted">Retirada mensal (R$)</span>
                <Input
                  type="number"
                  min={0}
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1"
                />
              </label>

              <label className="block text-sm">
                <span className="text-text-muted">Horizonte (dias)</span>
                <Input
                  type="number"
                  min={7}
                  max={365}
                  value={horizonDays}
                  onChange={(e) => setHorizonDays(Math.min(365, Math.max(7, Number(e.target.value) || 90)))}
                  className="mt-1"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div>
                  <p className="text-text-muted text-xs">Saldo projetado</p>
                  <p className="font-bold text-brand-green">{formatCurrency(simulation.summary.finalBalance)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Total guardado</p>
                  <p className="font-bold">{formatCurrency(simulation.summary.totalSaved)}</p>
                </div>
              </div>
            </div>

            <ChartCard
              title="Projeção de saldo"
              subtitle={`Próximos ${horizonDays} dias · ${saveRate}% do lucro médio`}
              data={simulationChart}
              type="area"
              height={280}
            />
          </div>
        </SectionPanel>

        {data.bestDay && (
          <div className="flex items-center gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
            <PiggyBank className="h-5 w-5 text-brand-green" />
            <p className="text-sm text-text-secondary">
              Melhor dia: <strong>{data.bestDay.date}</strong> com lucro de{" "}
              <strong>{formatCurrency(data.bestDay.profit)}</strong>
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
