"use client";

import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { fetchJsonArray } from "@/lib/api/safe-json";
import { SectionPanel } from "@/components/executive/section-panel";
import { isViewingGeneral, useTemporalViewContext } from "@/stores/temporal-context-store";

interface Insight {
  id: string;
  type: "positive" | "warning" | "info" | "opportunity";
  title: string;
  description: string;
  metric?: string;
}

const typeConfig = {
  positive: { icon: TrendingUp, badge: "success" as const, accent: "border-brand-green/25 bg-brand-green/5", iconColor: "text-brand-green" },
  warning: { icon: AlertTriangle, badge: "warning" as const, accent: "border-brand-orange/25 bg-brand-orange/5", iconColor: "text-brand-orange" },
  info: { icon: Info, badge: "info" as const, accent: "border-blue-500/25 bg-blue-500/5", iconColor: "text-blue-400" },
  opportunity: { icon: Lightbulb, badge: "info" as const, accent: "border-purple-500/25 bg-purple-500/5", iconColor: "text-purple-400" },
};

export default function InsightsPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const context = useTemporalViewContext();

  const insightsUrl = isViewingGeneral(context)
    ? withQuery("/api/insights")
    : withQuery(`/api/insights?date=${context.viewDate}&viewMode=day`);

  const { data: insights = [], isLoading } = useQuery<Insight[]>({
    queryKey: ["insights", activeBusinessId, context.mode, context.viewDate],
    queryFn: () => fetchJsonArray<Insight>(insightsUrl),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (isLoading) {
    return (
      <ModuleShell title="Insights">
        <PageLoader />
      </ModuleShell>
    );
  }

  const diaryFirst = insights.filter((i) => i.id.startsWith("diary-"));
  const executive = insights.filter((i) => !i.id.startsWith("diary-")).slice(0, 5);
  const operational = insights.filter((i) => !i.id.startsWith("diary-")).slice(5);

  return (
    <ModuleShell title="Insights" subtitle="Recomendações executivas + insights automáticos do diário">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
            <Sparkles className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Análise consultiva automática</p>
            <p className="text-sm text-text-secondary">
              {insights.length} recomendações · diário + analytics engine
            </p>
          </div>
        </div>

        {diaryFirst.length > 0 && (
          <SectionPanel
            theme="dashboard"
            title="Insights do diário (automáticos)"
            subtitle="Mix, ritmo, clientes e comparativos — complemente só o contexto humano"
          >
            <div className="space-y-3">
              {diaryFirst.map((insight, i) => {
                const config = typeConfig[insight.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-2xl border p-4 ${config.accent}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 mt-1 ${config.iconColor}`} />
                      <div>
                        <h3 className="font-semibold text-text-primary">{insight.title}</h3>
                        <p className="mt-1 text-sm text-text-secondary">{insight.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </SectionPanel>
        )}

        <SectionPanel theme="alerts" title="Prioridades executivas" subtitle="Ações com maior impacto no negócio">
          <div className="space-y-3">
            {executive.map((insight, i) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-2xl border p-4 transition-shadow hover:shadow-card ${config.accent}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-card">
                      <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-text-primary">{insight.title}</h3>
                        {insight.metric && <Badge variant={config.badge}>{insight.metric}</Badge>}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionPanel>

        {operational.length > 0 && (
          <SectionPanel theme="dashboard" title="Detalhes operacionais" subtitle="Contexto complementar">
            <div className="space-y-2">
              {operational.map((insight, i) => {
                const config = typeConfig[insight.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.03 }}
                    className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-card p-3"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">{insight.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{insight.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </SectionPanel>
        )}
      </div>
    </ModuleShell>
  );
}
