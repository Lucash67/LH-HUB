"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { PageLoader } from "@/components/ui/loading";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { cn, formatCurrency } from "@/lib/utils";
import type { PlanningDay, PlanningView } from "@/lib/planning/planning-service";

function signed(n: number): string {
  if (n === 0) return "—";
  return `${n > 0 ? "+" : "−"}${formatCurrency(Math.abs(n))}`;
}

function roi(day: PlanningDay): string {
  if (day.profit == null || !day.own) return "—";
  return `${Math.round((day.profit / day.own) * 100)}%`;
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-black text-text-primary",
          tone === "good" && "text-brand-green",
          tone === "warn" && "text-brand-orange",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function PlanejamentoPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const [month, setMonth] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<PlanningView>({
    queryKey: ["planning", activeBusinessId, month],
    queryFn: async () => {
      const base = withQuery("/api/planning");
      const url = month ? `${base}${base.includes("?") ? "&" : "?"}month=${month}` : base;
      const r = await fetch(url);
      const json = await r.json();
      if (!r.ok || json.error) throw new Error(json.error || "Não foi possível carregar o planejamento.");
      return json;
    },
    staleTime: 60_000,
  });

  const title = "Planejamento";
  const subtitle = "Resumos, relatórios, metas e projeções do mês";

  if (isError) {
    return (
      <ModuleShell title={title} subtitle={subtitle}>
        <p className="mb-3 text-text-muted">{error instanceof Error ? error.message : "Erro ao carregar."}</p>
        <button type="button" className="text-sm text-brand-orange underline" onClick={() => void refetch()}>
          Tentar novamente
        </button>
      </ModuleShell>
    );
  }

  if (isLoading || !data) {
    return (
      <ModuleShell title={title} subtitle={subtitle}>
        <PageLoader />
      </ModuleShell>
    );
  }

  const achieved = data.bank ?? data.profitDone;
  const progress = Math.min(100, Math.round((achieved / data.goal) * 100));
  const gap = data.goal - achieved;
  const closed = data.remainingDays === 0 && data.registeredDays > 0;
  const maxBar = Math.max(data.dailyTarget, ...data.days.map((d) => d.profit ?? 0), 1);

  const monthPicker = (
    <div className="flex gap-1 rounded-xl border border-surface-border bg-surface-card p-1">
      {data.availableMonths.map((m) => (
        <button
          key={m.month}
          type="button"
          onClick={() => setMonth(m.month)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            m.month === data.month ? "bg-surface-elevated text-text-primary" : "text-text-muted hover:text-text-primary",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  return (
    <ModuleShell title={title} subtitle={subtitle} actions={monthPicker}>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-text-primary">
            {data.label}: meta de {formatCurrency(data.goal)}
          </h1>
          <p className="text-sm text-text-muted">
            Alvo de {formatCurrency(data.dailyTarget)} por dia de venda · {data.sellingDays} dias de venda (seg–sex sem feriados).
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label={data.bankSource ? "No banco no mês" : "Lucro no mês"}
            value={formatCurrency(achieved)}
            tone={gap <= 0 ? "good" : undefined}
          />
          <Kpi
            label={gap <= 0 ? "Acima da meta" : "Falta para a meta"}
            value={formatCurrency(Math.abs(gap))}
            tone={gap <= 0 ? "good" : "warn"}
          />
          <Kpi
            label={closed ? "Lucro no diário" : "Precisa por dia restante"}
            value={
              closed
                ? formatCurrency(data.profitDone)
                : data.neededPerRemainingDay != null
                  ? formatCurrency(data.neededPerRemainingDay)
                  : "Meta batida"
            }
          />
          <Kpi
            label={closed ? "Cofrinho prático" : "Projeção no ritmo recente"}
            value={formatCurrency(closed ? data.practicalBalance : data.projection)}
            tone={!closed && data.projection >= data.goal ? "good" : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-text-muted">
            <span>{progress}% da meta</span>
            <span>
              {formatCurrency(achieved)} de {formatCurrency(data.goal)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-elevated">
            <div className="h-full rounded-full bg-brand-green" style={{ width: `${progress}%` }} />
          </div>
          {data.bankNote && <p className="text-xs text-text-muted">{data.bankNote}</p>}
        </div>

        <Section title="Resumo" subtitle="O que ler primeiro">
          <div className="space-y-2 rounded-2xl border border-surface-border bg-surface-card p-4">
            {data.summary.map((line) => (
              <p key={line} className="text-sm text-text-primary">
                {line}
              </p>
            ))}
          </div>
        </Section>

        <Section
          title="Planejado × realizado por dia"
          subtitle={`Barra verde = lucro final do diário · traço = alvo de ${formatCurrency(data.dailyTarget)}`}
        >
          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-2">Dia</th>
                  <th className="px-4 py-2">Lucro</th>
                  <th className="w-1/3 px-4 py-2" />
                  <th className="px-4 py-2 text-right">Diferença</th>
                  <th className="px-4 py-2 text-right">Recebido</th>
                  <th className="px-4 py-2 text-right">Próprio</th>
                  <th className="px-4 py-2 text-right">ROI</th>
                  <th className="px-4 py-2 text-right">Un.</th>
                </tr>
              </thead>
              <tbody>
                {data.days.map((d) => {
                  const diff = d.profit == null ? null : d.profit - d.planned;
                  return (
                    <tr key={d.date} className="border-t border-surface-border">
                      <td className="whitespace-nowrap px-4 py-2 text-text-secondary">
                        {d.weekday} {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-text-primary">
                        {d.profit == null ? <span className="text-text-muted">—</span> : formatCurrency(d.profit)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="relative h-2.5 rounded-full bg-surface-elevated">
                          {d.profit != null && (
                            <div
                              className={cn(
                                "h-full rounded-full",
                                d.profit >= d.planned ? "bg-brand-green" : "bg-brand-orange",
                              )}
                              style={{ width: `${Math.min(100, (d.profit / maxBar) * 100)}%` }}
                            />
                          )}
                          <div
                            className="absolute top-[-3px] h-4 w-0.5 bg-text-muted"
                            style={{ left: `${(d.planned / maxBar) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2 text-right",
                          diff != null && diff > 0 && "text-brand-green",
                          diff != null && diff < 0 && "text-brand-orange",
                        )}
                      >
                        {diff == null ? "—" : signed(diff)}
                      </td>
                      <td className="px-4 py-2 text-right text-text-secondary">
                        {d.received ? formatCurrency(d.received) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-text-secondary">
                        {d.own != null ? formatCurrency(d.own) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-text-secondary">{roi(d)}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">{d.sold ?? "—"}</td>
                    </tr>
                  );
                })}
                {data.extraDays.map((d) => (
                  <tr key={d.date} className="border-t border-surface-border text-text-muted">
                    <td className="px-4 py-2">
                      {d.weekday} {d.date.slice(8, 10)}/{d.date.slice(5, 7)} · extra
                    </td>
                    <td className="px-4 py-2">{d.profit != null ? formatCurrency(d.profit) : "—"}</td>
                    <td className="px-4 py-2 text-xs" colSpan={6}>
                      Fora do plano (fim de semana ou feriado)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Semanas" subtitle="Soma dos dias de venda de cada semana">
            <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-2">Semana</th>
                    <th className="px-4 py-2 text-right">Dias</th>
                    <th className="px-4 py-2 text-right">Plano</th>
                    <th className="px-4 py-2 text-right">Real</th>
                  </tr>
                </thead>
                <tbody>
                  {data.weeks.map((w) => (
                    <tr key={w.label} className="border-t border-surface-border">
                      <td className="px-4 py-2 text-text-secondary">{w.label}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">
                        {w.registered}/{w.days}
                      </td>
                      <td className="px-4 py-2 text-right text-text-secondary">{formatCurrency(w.planned)}</td>
                      <td
                        className={cn(
                          "px-4 py-2 text-right font-semibold",
                          w.registered === 0 && "text-text-muted",
                          w.registered > 0 && w.actual >= w.registered * data.dailyTarget && "text-brand-green",
                        )}
                      >
                        {w.registered === 0 ? "—" : formatCurrency(w.actual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="Projeções"
            subtitle={
              data.registeredDays > 0
                ? `Já feito + cenário × ${data.remainingDays} dias que faltam`
                : `Cenário × ${data.sellingDays} dias de venda`
            }
          >
            <div className="grid gap-3">
              {data.scenarios.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-card p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{s.label}</p>
                    <p className="text-xs text-text-muted">{formatCurrency(s.perDay)} por dia</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-text-primary">{formatCurrency(s.monthTotal)}</p>
                    <p className={cn("text-xs", s.vsGoal >= 0 ? "text-brand-green" : "text-brand-orange")}>
                      {s.vsGoal >= 0 ? `passa ${formatCurrency(s.vsGoal)}` : `falta ${formatCurrency(-s.vsGoal)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Ritmo recente = média dos últimos 10 dias de venda registrados ({formatCurrency(data.recentAverage)}).
            </p>
          </Section>
        </div>

        <Section title="Indicadores do mês" subtitle="O que acompanhar todo dia para bater a meta">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.indicators.map((i) => (
              <div key={i.label} className="rounded-2xl border border-surface-border bg-surface-card p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{i.label}</p>
                <p className="mt-1 text-lg font-bold text-text-primary">{i.target}</p>
                <p className="mt-1 text-xs text-text-muted">{i.why}</p>
              </div>
            ))}
          </div>
        </Section>

        {data.notes.length > 0 && (
          <div className="space-y-1 text-xs text-text-muted">
            {data.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
