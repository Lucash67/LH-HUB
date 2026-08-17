"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ModuleShell } from "@/components/layout/module-shell";
import { DashboardWelcomeBanner } from "@/components/dashboard/dashboard-welcome-banner";
import { DashboardDayView } from "@/components/dashboard/dashboard-day-view";
import { DashboardGeneralView } from "@/components/dashboard/dashboard-general-view";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, RefreshCw } from "lucide-react";
import { formatViewDateLabel, type DashboardViewData } from "@/lib/dashboard-view";
import type { DiaryAutoInsight } from "@/lib/diary-auto-insights";
import { isViewingToday, useTemporalViewContext } from "@/stores/temporal-context-store";
import { useBusinessScope } from "@/hooks/use-business-scope";
import type { OperationalDiaryEntry } from "@/lib/diary/types";
import type { WeekPulse } from "@/lib/week-pulse";

interface DashboardViewPayload {
  data: DashboardViewData;
  diaryEntry: OperationalDiaryEntry | null;
  autoInsights: DiaryAutoInsight[];
  weekPulse?: WeekPulse | null;
  context?: { mode: "day" | "general"; viewDate: string };
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
    staleTime: 30_000,
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
      <Link href="/registro-dia">
        <Button size="sm">
          <ClipboardPaste className="h-4 w-4" />
          Registrar
        </Button>
      </Link>
    </>
  );

  const contextMatches =
    !!payload?.context &&
    payload.context.mode === context.mode &&
    (context.mode === "general" || payload.context.viewDate === context.viewDate);

  if (isError) {
    return (
      <ModuleShell title="Dashboard" subtitle={<span className="capitalize">{dayLabel}</span>} temporalChip={false}>
        <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-5 text-center sm:p-8">
          <p className="mb-4 text-text-primary">
            {error instanceof Error ? error.message : "Não foi possível carregar o painel."}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-view"] })}>
            Tentar novamente
          </Button>
        </div>
      </ModuleShell>
    );
  }

  if (isLoading || !payload || (payload.context && !contextMatches)) {
    return (
      <ModuleShell title="Dashboard" subtitle={<span className="capitalize">{dayLabel}</span>} temporalChip={false}>
        <PageLoader />
      </ModuleShell>
    );
  }

  if (!payload.data) {
    return (
      <ModuleShell title="Dashboard" subtitle={<span className="capitalize">{dayLabel}</span>} temporalChip={false}>
        <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-5 text-center sm:p-8">
          <p className="mb-4 text-text-primary">Não foi possível carregar o painel.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-view"] })}>
            Tentar novamente
          </Button>
        </div>
      </ModuleShell>
    );
  }

  const { data, diaryEntry } = payload;
  const {
    metrics,
    charts,
    isGeneralView,
    profitGrowthVsYesterday,
    operationResult,
    daySummary,
    dayComparison,
  } = data;

  const showTrend = !isGeneralView && dayComparison.enabled;

  return (
    <ModuleShell
      title="Dashboard"
      subtitle={<span className="capitalize">{dayLabel}</span>}
      actions={headerActions}
    >
      <DashboardWelcomeBanner viewDate={context.mode === "day" ? context.viewDate : null} />

      <div className="dashboard-mesh -mx-1 rounded-3xl px-1 py-1 sm:mx-0 sm:px-0">
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
            trendLabel={dayComparison.label}
            goalProgress={metrics.goalProgress}
            goalUnits={daySummary.goalUnits}
            soldUnits={daySummary.soldUnits}
            bonusIncome={diaryEntry?.bonusIncome}
            operationResult={operationResult}
            daySummary={{
              ...daySummary,
              losses: Math.max(daySummary.losses, Number(diaryEntry?.quantityLost) || 0),
            }}
            hasOperations={metrics.hasOperations}
            nonOperational={dayComparison.isNonOperationalDay}
          />
        )
      )}
      </div>
    </ModuleShell>
  );
}
