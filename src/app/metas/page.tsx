"use client";

import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
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
    staleTime: 120_000,
    refetchInterval: 120_000,
  });

  if (isAggregated) {
    return (
      <ModuleShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <BusinessWriteNotice message={goalsBlockedMessage} />
      </ModuleShell>
    );
  }

  if (isLoading || !view) {
    return (
      <ModuleShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <PageLoader />
      </ModuleShell>
    );
  }

  if (isError || !view) {
    return (
      <ModuleShell
        title="Metas Inteligentes"
        subtitle="Centro de planejamento operacional baseado no seu histórico real"
      >
        <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
          <Target className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-text-secondary mb-2">Não foi possível calcular metas inteligentes.</p>
          <p className="text-sm text-text-muted">
            {error instanceof Error ? error.message : "Registre vendas para gerar sugestões automáticas."}
          </p>
        </Card>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Metas Inteligentes"
      subtitle="Centro de planejamento operacional baseado no seu histórico real"
    >
      <SmartGoalsDashboard view={view} />
    </ModuleShell>
  );
}
