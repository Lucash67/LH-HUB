"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/chart-card";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionPanel } from "@/components/executive/section-panel";
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Target,
  Wallet,
  Package,
  CalendarDays,
  Zap,
} from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { fetchJson, fetchJsonArray } from "@/lib/api/safe-json";
import type { PeriodProjectionView } from "@/lib/period-projections-service";

interface SimulatorScenario {
  dailyUnits: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyUnits: number;
}

export default function ProjecoesPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [offset, setOffset] = useState(0);
  const [showSimulator, setShowSimulator] = useState(false);

  const { data, isLoading, isError, error } = useQuery<PeriodProjectionView>({
    queryKey: ["period-projections", activeBusinessId, period, offset],
    queryFn: async () =>
      (await fetchJson(
        withQuery(`/api/projections?period=${period}&offset=${offset}`),
      )) as PeriodProjectionView,
    staleTime: 120_000,
    placeholderData: (prev) => prev,
  });

  const { data: scenarios = [] } = useQuery<SimulatorScenario[]>({
    queryKey: ["projection-simulator", activeBusinessId],
    queryFn: () => fetchJsonArray<SimulatorScenario>(withQuery("/api/projections?mode=simulator")),
    enabled: showSimulator,
    staleTime: 300_000,
  });

  if (isLoading && !data) {
    return (
      <ModuleShell title="Projeções" subtitle="Semana e mês com base no ritmo atual">
        <PageLoader />
      </ModuleShell>
    );
  }

  if (isError || !data) {
    return (
      <ModuleShell title="Projeções" subtitle="Semana e mês com base no ritmo atual">
        <p className="text-text-muted">
          {error instanceof Error ? error.message : "Não foi possível carregar as projeções."}
        </p>
      </ModuleShell>
    );
  }

  const comparisonChart = data.comparison.map((row) => ({
    label: row.label,
    value: row.actual,
    revenue: row.projected,
    profit: row.goal,
  }));

  return (
    <ModuleShell title="Projeções" subtitle="Ritmo atual × meta × o que falta">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl border border-surface-border bg-surface-card p-1">
            {(["weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setOffset(0);
                }}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  period === p
                    ? "bg-brand-orange text-brand-on"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {p === "weekly" ? "Semanal" : "Mensal"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[180px] text-center text-sm font-medium capitalize text-text-primary">
              {data.periodLabel}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o + 1)}
              disabled={offset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-orange/25 bg-brand-orange/5 px-4 py-3 text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Leitura do período: </span>
          {data.insight}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Receita realizada"
            value={data.actual.revenue}
            icon={Wallet}
            subtitle={`Ritmo ${formatCurrency(data.pace.revenue)}/dia útil`}
            delay={0}
          />
          <KpiCard
            title="Receita projetada"
            value={data.projected.revenue}
            icon={TrendingUp}
            subtitle={`${data.operationalDays.elapsed}/${data.operationalDays.total} dias úteis`}
            delay={0.05}
          />
          <KpiCard
            title="Lucro projetado"
            value={data.projected.profit}
            icon={Zap}
            variant="profit"
            subtitle={`Realizado ${formatCurrency(data.actual.profit)}`}
            delay={0.1}
          />
          <KpiCard
            title="Unidades projetadas"
            value={data.projected.units}
            icon={Package}
            format="number"
            subtitle={`${formatNumber(data.actual.units)} já vendidas`}
            delay={0.15}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionPanel title="Comparativo" subtitle="Realizado × projetado × meta">
            <div className="space-y-3">
              {data.comparison.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-4 gap-2 rounded-xl border border-surface-border bg-surface-elevated/40 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-primary">{row.label}</span>
                  <span className="text-text-secondary">
                    {row.label === "Unidades"
                      ? formatNumber(row.actual)
                      : formatCurrency(row.actual)}
                  </span>
                  <span className="text-brand-orange">
                    {row.label === "Unidades"
                      ? formatNumber(row.projected)
                      : formatCurrency(row.projected)}
                  </span>
                  <span className="text-text-muted">
                    {row.goal > 0
                      ? row.label === "Unidades"
                        ? formatNumber(row.goal)
                        : formatCurrency(row.goal)
                      : "—"}
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-4 gap-2 px-3 text-[11px] uppercase tracking-wide text-text-muted">
                <span />
                <span>Realizado</span>
                <span>Projetado</span>
                <span>Meta</span>
              </div>
            </div>
          </SectionPanel>

          <SectionPanel
            title="O que falta"
            subtitle={
              data.isCurrentPeriod
                ? `${data.operationalDays.remaining} dia(s) útil(eis) restante(s)`
                : "Período encerrado"
            }
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-brand-orange" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Para bater a projeção</p>
                  <p className="text-sm text-text-secondary">
                    {data.gap.unitsToProjection > 0 || data.gap.revenueToProjection > 0
                      ? `${formatNumber(data.gap.unitsToProjection)} un. · ${formatCurrency(data.gap.revenueToProjection)} · ritmo sugerido ${Math.ceil(data.gap.requiredDailyUnitsToProjection)} un./dia`
                      : "Projeção já coberta pelo ritmo atual."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-brand-orange" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Para bater a meta</p>
                  <p className="text-sm text-text-secondary">
                    {data.goal.source === "none"
                      ? "Defina metas semanal/mensal em Metas ou Configurações."
                      : data.gap.revenueToGoal > 0 || data.gap.unitsToGoal > 0
                        ? `${formatCurrency(data.gap.revenueToGoal)} restantes · ${formatCurrency(data.gap.requiredDailyRevenueToGoal)}/dia útil`
                        : "Meta de receita já atingida neste período."}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-xs text-text-muted">
                Margem realizada: {data.actual.margin.toFixed(1)}% · Dias úteis:{" "}
                {data.operationalDays.elapsed}/{data.operationalDays.total}
              </div>
            </div>
          </SectionPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            data={data.dailyChart}
            title="Receita por dia útil"
            type="bar"
            height={300}
          />
          <ChartCard
            data={comparisonChart}
            title="Realizado vs projetado (barras) / meta (linha de referência no valor)"
            type="bar"
            height={300}
          />
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setShowSimulator((v) => !v)}>
            {showSimulator ? "Ocultar simulador estático" : "Abrir simulador por unidades/dia"}
          </Button>

          {showSimulator && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-text-muted">
                Simulação hipotética com preço/custo médio do catálogo (22 dias úteis fixos) — não
                substitui a projeção por ritmo acima.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {scenarios.map((p) => (
                  <Card key={p.dailyUnits} className="p-5 text-center">
                    <p className="mb-1 text-3xl font-bold text-brand-orange">{p.dailyUnits}</p>
                    <p className="mb-4 text-xs text-text-muted">unidades/dia</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-text-muted">Receita mensal</p>
                        <p className="font-bold">{formatCurrency(p.monthlyRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Lucro mensal</p>
                        <p className="font-bold text-brand-green">
                          {formatCurrency(p.monthlyProfit)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
