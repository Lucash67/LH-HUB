"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PiggyBank } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";
import { PageLoader } from "@/components/ui/loading";
import { ChartCard } from "@/components/charts/chart-card";
import { EmptyModuleState } from "@/components/ui/empty-module-state";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { formatCurrency } from "@/lib/utils";
import type { ProfitBankView } from "@/lib/profit-bank-service";
import { filterUpToDate } from "@/lib/temporal-filter";
import { isViewingGeneral, useTemporalViewContext } from "@/stores/temporal-context-store";

export default function BancoLucroPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const context = useTemporalViewContext();
  const { data, isLoading, isError, error, refetch } = useQuery<ProfitBankView>({
    queryKey: ["profit-bank", activeBusinessId],
    queryFn: async () => {
      const r = await fetch(withQuery("/api/profit-bank"));
      const json = await r.json();
      if (!r.ok || json.error) throw new Error(json.error || "Não foi possível carregar o cofrinho.");
      return json;
    },
    staleTime: 120_000,
  });

  const scopedHistory = useMemo(() => {
    if (!data) return [];
    return isViewingGeneral(context) ? data.history : filterUpToDate(data.history, context);
  }, [data, context]);

  const scopedBalance = scopedHistory.length ? scopedHistory[scopedHistory.length - 1]!.balance : 0;
  const scopedProfit = scopedHistory.reduce((s, d) => s + d.profit, 0);
  const scopedDays = scopedHistory.length;

  if (isError) {
    return (
      <ModuleShell title="Cofrinho" subtitle="Lucro acumulado">
        <p className="mb-3 text-text-muted">
          {error instanceof Error ? error.message : "Não foi possível carregar o cofrinho."}
        </p>
        <button type="button" className="text-sm text-brand-orange underline" onClick={() => void refetch()}>
          Tentar novamente
        </button>
      </ModuleShell>
    );
  }

  if (isLoading || !data) {
    return (
      <ModuleShell title="Cofrinho" subtitle="Lucro acumulado">
        <PageLoader />
      </ModuleShell>
    );
  }

  const historyChart = scopedHistory.map((d) => ({
    label: d.label,
    value: d.balance,
    profit: d.profit,
    revenue: d.revenue,
  }));

  const balance = isViewingGeneral(context) ? data.currentBalance : scopedBalance;
  const profit = isViewingGeneral(context) ? data.totalProfit : scopedProfit;

  return (
    <ModuleShell title="Cofrinho" subtitle="Lucro acumulado da operação">
      <div className="space-y-6">
        {scopedDays === 0 ? (
          <EmptyModuleState
            icon={PiggyBank}
            title="Cofrinho zerado"
            description="O saldo aparece depois do primeiro dia com lucro registrado."
            actionHref="/registro-dia"
            actionLabel="Registrar dia"
            compact
          />
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-brand-green/25 bg-gradient-to-br from-brand-green/10 via-surface-card to-[#7C3CFF]/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Saldo acumulado</p>
            <p className="mt-1 text-3xl font-black text-brand-green">{formatCurrency(balance)}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#7C3CFF]/20 bg-gradient-to-br from-[#7C3CFF]/8 via-surface-card to-surface-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Lucro total</p>
            <p className="mt-1 text-3xl font-black text-brand-gradient">{formatCurrency(profit)}</p>
            <p className="mt-1 text-xs text-text-muted">
              {isViewingGeneral(context) ? data.operationalDays : scopedDays} dias operacionais
            </p>
          </div>
        </div>

        {scopedDays > 0 && (
          <ChartCard
            title="Evolução"
            subtitle="Saldo acumulado dia a dia"
            data={historyChart}
            type="area"
            height={260}
          />
        )}

        {data.bestDay && (
          <p className="text-sm text-text-secondary">
            Melhor dia: <strong>{data.bestDay.date}</strong> ·{" "}
            <strong>{formatCurrency(data.bestDay.profit)}</strong>
          </p>
        )}
      </div>
    </ModuleShell>
  );
}
