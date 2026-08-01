"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ModuleShell } from "@/components/layout/module-shell";
import { DashboardWelcomeBanner } from "@/components/dashboard/dashboard-welcome-banner";
import { DashboardDayView } from "@/components/dashboard/dashboard-day-view";
import { DashboardGeneralView } from "@/components/dashboard/dashboard-general-view";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { formatViewDateLabel, type DashboardViewData } from "@/lib/dashboard-view";
import type { DiaryAutoInsight } from "@/lib/diary-auto-insights";
import { isViewingToday, useTemporalViewContext } from "@/stores/temporal-context-store";
import { useBusinessScope } from "@/hooks/use-business-scope";
import type { OperationalDiaryEntry } from "@/lib/diary/types";

interface DashboardViewPayload {
  data: DashboardViewData;
  diaryEntry: OperationalDiaryEntry | null;
  autoInsights: DiaryAutoInsight[];
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const context = useTemporalViewContext();
  const { activeBusinessId, withQuery } = useBusinessScope();
  const viewingToday = isViewingToday(context);
  const dayLabel = formatViewDateLabel(context);
  const shouldPoll = context.mode === "general" || viewingToday;

  const dashboardParams =
    context.mode === "day"
      ? `viewMode=day&date=${context.viewDate}`
      : "viewMode=general";

  const {
    data: payload,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<DashboardViewPayload>({
    queryKey: ["dashboard-view", activeBusinessId, context.mode, context.viewDate],
    queryFn: async () => {
      const r = await fetch(withQuery(`/api/dashboard/view?${dashboardParams}`));
      const json = await r.json();
      if (!r.ok || json.error) {
        throw new Error(json.error || "Não foi possível carregar o painel.");
      }
      return json;
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    refetchInterval: shouldPoll ? 60_000 : false,
  });

  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-view"] })}
        disabled={isFetching}
      >
        <RefreshCw className={`h-4 w-4${isFetching ? " animate-spin" : ""}`} />
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

  if (isLoading && !payload) {
    return (
      <ModuleShell title="Dashboard" subtitle={<span className="capitalize">{dayLabel}</span>} temporalChip={false}>
        <PageLoader />
      </ModuleShell>
    );
  }

  if (isError || !payload?.data) {
    return (
      <ModuleShell title="Dashboard" subtitle={<span className="capitalize">{dayLabel}</span>} temporalChip={false}>
        <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-8 text-center">
          <p className="text-text-primary mb-4">
            {error instanceof Error ? error.message : "Não foi possível carregar o painel."}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-view"] })}>
            Tentar novamente
          </Button>
        </div>
      </ModuleShell>
    );
  }

  const { data, diaryEntry, autoInsights } = payload;
  const {
    metrics,
    charts,
    isGeneralView,
    profitGrowthVsYesterday,
    operationResult,
    daySummary,
    timeline,
    alerts,
    customerInsight,
    dayComparison,
  } = data;

  const showTrend = !isGeneralView && dayComparison.enabled;
  const profitMargin =
    metrics.revenueToday > 0 ? (metrics.profitToday / metrics.revenueToday) * 100 : 0;

  return (
    <ModuleShell
      title="Dashboard"
      subtitle={<span className="capitalize">{dayLabel}</span>}
      actions={headerActions}
    >
      <DashboardWelcomeBanner />

      {!isGeneralView && dayComparison.isNonOperationalDay && (
        <p className="text-sm text-text-muted mb-4">
          Sem operação aos sábados e domingos — Salgados.
        </p>
      )}

      {!isGeneralView && !metrics.hasOperations && !dayComparison.isNonOperationalDay && (
        <p className="text-sm text-text-muted mb-4">Nenhuma operação registrada nesta data.</p>
      )}

      {isGeneralView ? (
        <DashboardGeneralView
          revenue={metrics.revenueToday}
          profit={metrics.profitToday}
          goalProgress={metrics.goalProgress}
          itemsSold={metrics.itemsSoldToday}
          uniqueBuyers={metrics.customersToday}
          flavors={charts.flavors}
          payments={charts.payments}
        />
      ) : (
        daySummary && (
          <DashboardDayView
            viewDate={context.viewDate}
            viewingToday={viewingToday}
            revenue={metrics.revenueToday}
            profit={metrics.profitToday}
            profitTrend={showTrend ? profitGrowthVsYesterday : undefined}
            revenueTrend={showTrend ? metrics.growthVsYesterday : undefined}
            trendLabel={dayComparison.label}
            goalProgress={metrics.goalProgress}
            goalUnits={daySummary.goalUnits}
            soldUnits={daySummary.soldUnits}
            profitMargin={profitMargin}
            bonusIncome={diaryEntry?.bonusIncome}
            operationResult={operationResult}
            daySummary={daySummary}
            customerInsight={customerInsight}
            flavors={charts.flavors}
            timeline={timeline}
            alerts={alerts}
            insights={autoInsights}
            hasOperations={metrics.hasOperations}
          />
        )
      )}
    </ModuleShell>
  );
}
