"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { DateContextSelector } from "@/components/dashboard/date-context-selector";
import { HeroMetric } from "@/components/executive/hero-metric";
import { SectionPanel } from "@/components/executive/section-panel";
import { ExecutiveSummary } from "@/components/executive/executive-summary";
import { DayTimeline } from "@/components/executive/day-timeline";
import { ActionableAlerts } from "@/components/executive/actionable-alerts";
import { PrioritiesPanel } from "@/components/executive/priorities-panel";
import { TopProductsCard, ChartCard } from "@/components/charts/chart-card";
import {
  DollarSign,
  TrendingUp,
  Target,
  Activity,
  ShoppingBag,
  Users,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  buildDashboardView,
  formatViewDateLabel,
  type DashboardSale,
  type DiaryDayContext,
} from "@/lib/dashboard-view";
import {
  isViewingToday,
  useTemporalViewContext,
} from "@/stores/temporal-context-store";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { isAllBusinesses } from "@/lib/business-units";
import type { OperationalDiaryEntry } from "@/lib/diary/types";

interface GoalRow {
  type: string;
  targetAmount: number;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const context = useTemporalViewContext();
  const { activeBusinessId, withQuery } = useBusinessScope();
  const viewingToday = isViewingToday(context);
  const dayLabel = formatViewDateLabel(context);
  const isDayView = context.mode === "day";
  const canLoadDiary = isDayView && !isAllBusinesses(activeBusinessId);

  const shouldPoll = context.mode === "general" || viewingToday;

  const { data: sales, isLoading: salesLoading, isFetching: salesFetching, isError, error } =
    useQuery<DashboardSale[]>({
      queryKey: ["sales", activeBusinessId],
      queryFn: async () => {
        const r = await fetch(withQuery("/api/sales"));
        const json = await r.json();
        if (!r.ok || json.error) {
          throw new Error(json.error || "Não foi possível carregar o painel.");
        }
        return json;
      },
      refetchInterval: shouldPoll ? 30_000 : false,
    });

  const { data: goals = [] } = useQuery<GoalRow[]>({
    queryKey: ["goals", activeBusinessId],
    queryFn: () => fetch(withQuery("/api/goals")).then((r) => r.json()),
  });

  const { data: diaryEntry } = useQuery<OperationalDiaryEntry | null>({
    queryKey: ["diary", activeBusinessId, context.viewDate],
    queryFn: async () => {
      const r = await fetch(withQuery(`/api/diary?date=${context.viewDate}`));
      if (!r.ok) return null;
      const json = await r.json();
      return json ?? null;
    },
    enabled: canLoadDiary,
  });

  const dailyGoal = goals.find((g) => g.type === "daily")?.targetAmount ?? 0;

  const diaryContext: DiaryDayContext | null = diaryEntry ?? null;

  const data = useMemo(() => {
    if (!sales) return null;
    return buildDashboardView(sales, context, 0, dailyGoal, 0, diaryContext, activeBusinessId);
  }, [sales, context, dailyGoal, diaryContext]);

  if (salesLoading) {
    return (
      <AppShell
        title="Dashboard"
        subtitle={
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="capitalize">{dayLabel}</span>
            <DateContextSelector />
          </div>
        }
      >
        <PageLoader />
      </AppShell>
    );
  }

  if (isError || !data) {
    return (
      <AppShell
        title="Dashboard"
        subtitle={
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="capitalize">{dayLabel}</span>
            <DateContextSelector />
          </div>
        }
      >
        <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-8 text-center">
          <p className="text-text-primary mb-4">
            {error instanceof Error ? error.message : "Não foi possível carregar o painel."}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["sales"] })}>
            Tentar novamente
          </Button>
        </div>
      </AppShell>
    );
  }

  const {
    metrics,
    charts,
    isGeneralView,
    profitGrowthVsYesterday,
    operationResult,
    daySummary,
    timeline,
    alerts,
    priorities,
    customerInsight,
    topProductsSubtitle,
    dayComparison,
  } = data;

  const showTrend = !isGeneralView && dayComparison.enabled;
  const weekendNote = dayComparison.isNonOperationalDay
    ? "Sem operação aos sábados e domingos"
    : null;

  const profitMargin =
    metrics.revenueToday > 0 ? (metrics.profitToday / metrics.revenueToday) * 100 : 0;

  const revenueSubtext = weekendNote
    ?? (showTrend
      ? metrics.growthVsYesterday >= 0
        ? `Receita acima ${dayComparison.label.replace("vs ", "de ")}`
        : `Receita abaixo ${dayComparison.label.replace("vs ", "de ")}`
      : `${metrics.itemsSoldToday} unidades vendidas`);

  const metaSubtext = isGeneralView
    ? "Visão acumulada"
    : daySummary?.goalUnits
      ? `${daySummary.soldUnits} de ${daySummary.goalUnits} unidades`
      : metrics.dailyGoal > 0
        ? `${formatCurrency(metrics.goalRevenue)} de ${formatCurrency(metrics.dailyGoal)}`
        : "Defina meta em Configurações";

  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: ["sales"] });
          queryClient.invalidateQueries({ queryKey: ["goals"] });
          queryClient.invalidateQueries({ queryKey: ["diary"] });
        }}
        disabled={salesFetching}
      >
        <RefreshCw className={`h-4 w-4${salesFetching ? " animate-spin" : ""}`} />
        Atualizar
      </Button>
      <Link href="/vendas">
        <Button size="sm">
          <ShoppingBag className="h-4 w-4" />
          Nova venda
        </Button>
      </Link>
    </>
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="capitalize">{dayLabel}</span>
          <DateContextSelector />
        </div>
      }
      actions={headerActions}
    >
      <div className="space-y-5">
        {!metrics.hasOperations && !isGeneralView && !dayComparison.isNonOperationalDay && (
          <p className="text-sm text-text-muted">Nenhuma operação registrada nesta data.</p>
        )}
        {dayComparison.isNonOperationalDay && (
          <p className="text-sm text-text-muted">Sem operação aos sábados e domingos — Salgados.</p>
        )}

        {/* Hero — 4 perguntas executivas */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label={isGeneralView ? "Receita total" : "Receita hoje"}
            value={metrics.revenueToday}
            icon={DollarSign}
            theme="dashboard"
            trend={showTrend ? metrics.growthVsYesterday : undefined}
            trendLabel={dayComparison.label}
            subtext={
              isGeneralView ? `${metrics.itemsSoldToday} unidades no histórico` : revenueSubtext
            }
            delay={0}
          />
          <HeroMetric
            label={isGeneralView ? "Meta" : "Meta hoje"}
            value={metrics.goalProgress}
            icon={Target}
            theme="goals"
            format="percent"
            subtext={metaSubtext}
            valueTone={
              metrics.goalProgress >= 100 ? "success" : metrics.goalProgress >= 70 ? "warning" : "neutral"
            }
            delay={1}
          />
          <HeroMetric
            label={isGeneralView ? "Lucro total" : "Lucro hoje"}
            value={metrics.profitToday}
            icon={TrendingUp}
            theme="dashboard"
            trend={showTrend ? profitGrowthVsYesterday : undefined}
            trendLabel={dayComparison.label}
            subtext={weekendNote ?? `${formatPercent(profitMargin)} de margem`}
            valueTone="success"
            delay={2}
          />
          <HeroMetric
            label="Resultado da operação"
            value={operationResult.headline}
            icon={Activity}
            theme="dashboard"
            format="raw"
            subtext={operationResult.summary}
            valueTone={
              operationResult.tone === "success"
                ? "success"
                : operationResult.tone === "warning"
                  ? "warning"
                  : "neutral"
            }
            delay={3}
          />
        </div>

        {/* Cliente do dia — substitui "clientes atendidos" */}
        {!isGeneralView && metrics.hasOperations && customerInsight.topBuyer && (
          <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Maior comprador do dia
                </p>
                <p className="text-sm font-semibold text-text-primary">{customerInsight.summary}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-brand-orange">
              {formatCurrency(customerInsight.topBuyer.total)}
            </p>
          </div>
        )}

        {/* Resumo executivo do dia */}
        {daySummary && (
          <ExecutiveSummary
            theme="dashboard"
            title="Resumo do dia"
            conclusion={
              operationResult.percent >= 100
                ? "Operação concluída dentro do esperado."
                : operationResult.percent >= 70
                  ? "Operação próxima da meta — ajuste o ritmo."
                  : undefined
            }
            items={[
              {
                label: "Meta",
                value: daySummary.goalUnits != null ? String(daySummary.goalUnits) : "—",
                highlight: true,
              },
              { label: "Vendidos", value: String(daySummary.soldUnits) },
              { label: "Receita", value: formatCurrency(daySummary.revenue) },
              { label: "Lucro", value: formatCurrency(daySummary.profit) },
              {
                label: "Pendências",
                value: String(daySummary.pendingCount),
                highlight: daySummary.pendingCount > 0,
              },
              {
                label: "Perdas",
                value: String(daySummary.losses),
                highlight: daySummary.losses > 0,
              },
            ]}
          />
        )}

        {/* Alertas + Prioridades */}
        {!isGeneralView && metrics.hasOperations && (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionPanel theme="dashboard" title="Alertas" subtitle="Situações que exigem atenção">
              <ActionableAlerts alerts={alerts} />
            </SectionPanel>
            <SectionPanel theme="dashboard" title="O que fazer agora" subtitle="Próximas ações">
              <PrioritiesPanel priorities={priorities} />
            </SectionPanel>
          </div>
        )}

        {/* Linha do dia */}
        {!isGeneralView && (
          <SectionPanel
            theme="dashboard"
            title="Linha do dia"
            subtitle={
              viewingToday
                ? "Vendas de hoje em ordem cronológica"
                : format(parseISO(context.viewDate), "dd 'de' MMMM", { locale: ptBR })
            }
          >
            <DayTimeline groups={timeline} />
          </SectionPanel>
        )}

        {/* Top produtos + pagamentos — sem gráficos redundantes de receita */}
        <div className="grid gap-3 lg:grid-cols-2">
          <TopProductsCard products={charts.flavors} subtitle={topProductsSubtitle} />
          {metrics.hasOperations && (
            <ChartCard
              data={charts.payments.filter((p) => p.value > 0)}
              title="Como pagaram"
              subtitle={topProductsSubtitle}
              type="pie"
              height={200}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
