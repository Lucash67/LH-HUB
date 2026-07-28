"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessWriteNotice } from "@/components/business/business-write-notice";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import { SmartGoalsDashboard } from "@/components/goals/smart-goals-dashboard";
import { Target } from "lucide-react";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { isAllBusinesses } from "@/lib/business-units";
import type { SmartGoalsView } from "@/lib/smart-goals-view";

export default function MetasPage() {
  const { activeBusinessId, withQuery, goalsBlockedMessage } = useBusinessScope();
  const isAggregated = isAllBusinesses(activeBusinessId);

  const { data: view, isLoading, isError, error } = useQuery<SmartGoalsView>({
    queryKey: ["smart-goals", activeBusinessId],
    queryFn: async () => {
      const r = await fetch(withQuery("/api/smart-goals"));
      const json = await r.json();
      if (!r.ok || json.error) {
        throw new Error(json.error || "Não foi possível carregar metas inteligentes.");
      }
      return json;
    },
    enabled: !isAggregated,
    refetchInterval: 60_000,
  });

  if (isAggregated) {
    return (
      <AppShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <BusinessWriteNotice message={goalsBlockedMessage} />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <PageLoader />
      </AppShell>
    );
  }

  if (isError || !view) {
    return (
      <AppShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <Card className="p-8 text-center max-w-lg mx-auto">
          <Target className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary mb-2">Não foi possível calcular metas inteligentes.</p>
          <p className="text-sm text-text-muted">
            {error instanceof Error ? error.message : "Registre vendas para gerar sugestões automáticas."}
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Metas Inteligentes"
      subtitle="Centro de planejamento operacional baseado no seu histórico real"
    >
      <SmartGoalsDashboard view={view} />
    </AppShell>
  );
}
