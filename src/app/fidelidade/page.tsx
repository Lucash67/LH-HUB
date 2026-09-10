"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { Gift, Star, UserPlus, X } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";
import { BusinessWriteNotice } from "@/components/business/business-write-notice";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useFidelidade } from "@/hooks/use-fidelidade";
import { getLoyaltyWeekBounds, LOYALTY_STATUS_LABELS } from "@/lib/loyalty/evaluate";
import { withBusinessQuery } from "@/lib/business-units";
import { cn } from "@/lib/utils";

export default function FidelidadePage() {
  const [weekAnchor, setWeekAnchor] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const weekStart = useMemo(() => getLoyaltyWeekBounds(weekAnchor).weekStart, [weekAnchor]);
  const {
    view,
    loading,
    error,
    post,
    reload,
    businessId,
    canWrite,
    writeBlockedMessage,
  } = useFidelidade(weekStart);

  const [detailClientId, setDetailClientId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadDetail>> | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string; enrolled: boolean }>>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // forms
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustDate, setAdjustDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [adjustReason, setAdjustReason] = useState("");
  const [scheduleProductId, setScheduleProductId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleObs, setScheduleObs] = useState("");
  const [scheduleRewardId, setScheduleRewardId] = useState<string | null>(null);

  async function loadDetail(clientId: string) {
    const res = await fetch(
      withBusinessQuery(`/api/fidelidade?clientId=${encodeURIComponent(clientId)}`, businessId),
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Falha ao carregar detalhe");
    return json.detail as {
      client: { id: string; name: string };
      participant: { active: boolean; joinedAt: string; notes: string | null } | null;
      current: {
        weekLabel: string;
        progress: {
          byDay: { mon: number; tue: number; wed: number; thu: number; fri: number };
          unitsTowardGoal: number;
          unitsRequired: number;
          remaining: number;
          status: string;
          historicalUnits: number;
        };
        statusLabel: string;
        rewards: Array<{
          id: string;
          status: string;
          productId: string | null;
          scheduledFor: string | null;
        }>;
      };
      history: Array<{
        weekLabel: string;
        statusLabel: string;
        progress: { unitsTowardGoal: number; unitsRequired: number; historicalUnits: number };
      }>;
      events: Array<{ id: string; description: string; createdAt: string; quantity: number | null }>;
    };
  }

  useEffect(() => {
    if (!detailClientId) {
      setDetail(null);
      return;
    }
    void loadDetail(detailClientId)
      .then(setDetail)
      .catch((e) => setToast(e instanceof Error ? e.message : "Erro"));
  }, [detailClientId, businessId]);

  async function openEnroll() {
    const res = await fetch(withBusinessQuery("/api/fidelidade?listClients=1", businessId));
    const json = await res.json();
    if (!res.ok) {
      setToast(json.error || "Falha ao listar clientes");
      return;
    }
    setClients(json.clients ?? []);
    setEnrollOpen(true);
  }

  async function enroll(clientId: string) {
    setBusy(true);
    try {
      await post({ action: "enroll", clientId });
      setToast("Cliente inscrito no programa.");
      setEnrollOpen(false);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function runAdjust() {
    if (!detailClientId) return;
    setBusy(true);
    try {
      const json = await post({
        action: "adjust",
        clientId: detailClientId,
        dateIso: adjustDate,
        quantity: adjustQty,
        reason: adjustReason,
      });
      setToast(json.result?.message ?? "Ajuste aplicado.");
      setAdjustReason("");
      setDetail(await loadDetail(detailClientId));
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function runSchedule() {
    if (!scheduleRewardId || !scheduleProductId || !scheduleDate) return;
    setBusy(true);
    try {
      await post({
        action: "schedule_reward",
        rewardId: scheduleRewardId,
        productId: scheduleProductId,
        scheduledFor: scheduleDate,
        observation: scheduleObs || undefined,
      });
      setToast("Recompensa agendada.");
      setScheduleRewardId(null);
      if (detailClientId) setDetail(await loadDetail(detailClientId));
      await reload();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function runDeliver(rewardId: string, productId?: string) {
    setBusy(true);
    try {
      await post({
        action: "deliver_reward",
        rewardId,
        productId,
      });
      setToast("Recompensa entregue (R$0 — sem receita / sem progresso).");
      if (detailClientId) setDetail(await loadDetail(detailClientId));
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !view) {
    return (
      <ModuleShell title="Fidelidade" subtitle="Programa semanal" temporalFilter={false}>
        <PageLoader />
      </ModuleShell>
    );
  }

  const m = view?.metrics;

  return (
    <ModuleShell
      title="Fidelidade"
      subtitle={view ? `Semana ${view.weekLabel} · ${view.program.name}` : "Programa semanal"}
      temporalFilter={false}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekAnchor(format(addDays(parseISO(weekStart), -7), "yyyy-MM-dd"))
            }
          >
            Semana ant.
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWeekAnchor(format(new Date(), "yyyy-MM-dd"))}
          >
            Atual
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekAnchor(format(addDays(parseISO(weekStart), 7), "yyyy-MM-dd"))
            }
          >
            Próx.
          </Button>
          {canWrite && (
            <Button type="button" size="sm" onClick={() => void openEnroll()}>
              <UserPlus className="mr-1 h-4 w-4" />
              Inscrever
            </Button>
          )}
        </div>
      }
    >
      {!canWrite && writeBlockedMessage && (
        <BusinessWriteNotice message={writeBlockedMessage} className="mb-4" />
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-brand-red/30 bg-brand-red/5 px-3 py-2 text-sm text-brand-red">
          {error}
        </p>
      )}

      {toast && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-green/30 bg-brand-green/5 px-3 py-2 text-sm">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {m && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <Metric label="Participantes" value={m.participants} />
          <Metric label="Em progresso" value={m.activeProgress} />
          <Metric label="Completaram" value={m.completedThisWeek} />
          <Metric label="Disp. recompensa" value={m.rewardsAvailable} />
          <Metric label="Agendadas" value={m.rewardsScheduled} />
          <Metric label="Entregues" value={m.rewardsDelivered} />
          <Metric label="Incomp. sem. ant." value={m.previousWeekIncomplete} />
        </div>
      )}

      {m && (m.completionRate != null || m.avgUnitsPerParticipant != null) && (
        <p className="mb-4 text-sm text-text-secondary">
          {m.completionRate != null && <>Taxa de conclusão: <strong>{m.completionRate}%</strong>. </>}
          {m.avgUnitsPerParticipant != null && (
            <>Média de unidades (com movimento): <strong>{m.avgUnitsPerParticipant}</strong>.</>
          )}
        </p>
      )}

      {view && view.almostThere.length > 0 && (
        <section className="mb-6 rounded-xl border border-border/60 bg-surface/40 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Star className="h-4 w-4 text-brand-green" />
            Quase lá
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {view.almostThere.map((c) => (
              <button
                key={c.clientId}
                type="button"
                onClick={() => setDetailClientId(c.clientId)}
                className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-left text-sm hover:border-brand-green/40"
              >
                <div className="font-medium">{c.clientName}</div>
                <div className="text-text-secondary">
                  {c.unitsTowardGoal}/{c.unitsRequired} · Falta
                  {c.remaining === 1 ? "" : "m"} {c.remaining} salgado
                  {c.remaining === 1 ? "" : "s"}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-x-auto rounded-xl border border-border/60">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Semana</th>
              <th className="px-2 py-2 text-center">Seg</th>
              <th className="px-2 py-2 text-center">Ter</th>
              <th className="px-2 py-2 text-center">Qua</th>
              <th className="px-2 py-2 text-center">Qui</th>
              <th className="px-2 py-2 text-center">Sex</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Progresso</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Recompensa</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!view || view.rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-10 text-center text-text-secondary">
                  Nenhum participante nesta semana.
                  <br />
                  Os clientes aparecerão aqui quando entrarem no programa.
                </td>
              </tr>
            ) : (
              view.rows.map((row) => (
                <tr key={row.clientId} className="border-t border-border/40">
                  <td className="px-3 py-2 font-medium">{row.clientName}</td>
                  <td className="px-3 py-2 text-text-secondary">{row.weekLabel}</td>
                  <td className="px-2 py-2 text-center">{row.byDay.mon || "—"}</td>
                  <td className="px-2 py-2 text-center">{row.byDay.tue || "—"}</td>
                  <td className="px-2 py-2 text-center">{row.byDay.wed || "—"}</td>
                  <td className="px-2 py-2 text-center">{row.byDay.thu || "—"}</td>
                  <td className="px-2 py-2 text-center">{row.byDay.fri || "—"}</td>
                  <td className="px-3 py-2">
                    {row.unitsTowardGoal}/{row.unitsRequired}
                    {row.totalUnits > row.unitsRequired && (
                      <span className="ml-1 text-xs text-text-muted">({row.totalUnits} hist.)</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/50">
                        <div
                          className="h-full rounded-full bg-brand-green"
                          style={{ width: `${row.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">{row.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={row.status} label={row.statusLabel} />
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {row.rewardStatus === "available"
                      ? "Disponível"
                      : row.rewardStatus === "scheduled"
                        ? "Agendada"
                        : row.rewardStatus === "delivered"
                          ? "Entregue"
                          : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setDetailClientId(row.clientId)}>
                      Ver
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {view && view.metrics.rewardsAvailable === 0 && view.rows.every((r) => !r.rewardStatus) && (
        <p className="mt-3 text-sm text-text-muted">Nenhuma recompensa disponível.</p>
      )}

      {/* Drawer detalhe */}
      {detailClientId && detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDetailClientId(null)}>
          <aside
            className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{detail.client.name}</h2>
                <p className="text-sm text-text-secondary">
                  {detail.participant?.active ? "Participante ativo" : "Não inscrito"}
                  {detail.participant?.joinedAt
                    ? ` · desde ${format(parseISO(detail.participant.joinedAt.slice(0, 10)), "dd/MM/yyyy")}`
                    : ""}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setDetailClientId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <section className="mb-5 rounded-xl border border-border/60 p-3">
              <h3 className="mb-2 text-sm font-semibold">Semana atual · {detail.current.weekLabel}</h3>
              <div className="mb-2 grid grid-cols-5 gap-1 text-center text-xs">
                {(
                  [
                    ["Seg", detail.current.progress.byDay.mon],
                    ["Ter", detail.current.progress.byDay.tue],
                    ["Qua", detail.current.progress.byDay.wed],
                    ["Qui", detail.current.progress.byDay.thu],
                    ["Sex", detail.current.progress.byDay.fri],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="rounded-md bg-surface/50 py-2">
                    <div className="text-text-muted">{label}</div>
                    <div className="text-base font-semibold">{n}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm">
                Total: <strong>{detail.current.progress.unitsTowardGoal}/{detail.current.progress.unitsRequired}</strong>
                {detail.current.progress.historicalUnits > detail.current.progress.unitsTowardGoal && (
                  <> · histórico {detail.current.progress.historicalUnits}</>
                )}
              </p>
              <p className="text-sm text-text-secondary">
                {detail.current.progress.remaining > 0
                  ? `Faltam ${detail.current.progress.remaining} salgado${detail.current.progress.remaining === 1 ? "" : "s"}`
                  : "Meta concluída"}
                {" · "}
                {detail.current.statusLabel}
              </p>

              {detail.current.rewards.length > 0 && (
                <div className="mt-3 space-y-2">
                  {detail.current.rewards.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border/50 p-2 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <Gift className="h-4 w-4" />
                        Recompensa · {r.status}
                      </div>
                      {canWrite && (r.status === "available" || r.status === "scheduled") && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setScheduleRewardId(r.id);
                              setScheduleProductId(r.productId ?? view?.products[0]?.id ?? "");
                              setScheduleDate(r.scheduledFor ?? format(new Date(), "yyyy-MM-dd"));
                            }}
                          >
                            Agendar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            onClick={() => void runDeliver(r.id, r.productId ?? (scheduleProductId || undefined))}
                          >
                            Confirmar entrega
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {scheduleRewardId && canWrite && (
              <section className="mb-5 rounded-xl border border-brand-green/30 bg-brand-green/5 p-3">
                <h3 className="mb-2 text-sm font-semibold">Agendar recompensa</h3>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    value={scheduleProductId}
                    onChange={(e) => setScheduleProductId(e.target.value)}
                  >
                    <option value="">Sabor…</option>
                    {view?.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <input
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    placeholder="Observação (opcional)"
                    value={scheduleObs}
                    onChange={(e) => setScheduleObs(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" disabled={busy} onClick={() => void runSchedule()}>
                      Salvar agenda
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setScheduleRewardId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {canWrite && (
              <section className="mb-5 rounded-xl border border-border/60 p-3">
                <h3 className="mb-2 text-sm font-semibold">Ajustar progresso</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                  />
                  <input
                    type="date"
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    value={adjustDate}
                    onChange={(e) => setAdjustDate(e.target.value)}
                  />
                </div>
                <input
                  className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  placeholder="Motivo (obrigatório)"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  disabled={busy || !adjustReason.trim()}
                  onClick={() => void runAdjust()}
                >
                  Aplicar ajuste
                </Button>
              </section>
            )}

            <section className="mb-5">
              <h3 className="mb-2 text-sm font-semibold">Histórico de semanas</h3>
              {detail.history.length === 0 ? (
                <p className="text-sm text-text-muted">Sem histórico ainda.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {detail.history.map((h) => (
                    <li key={h.weekLabel} className="rounded-lg border border-border/40 px-3 py-2">
                      <div className="font-medium">{h.weekLabel}</div>
                      <div className="text-text-secondary">
                        {h.progress.unitsTowardGoal}/{h.progress.unitsRequired}
                        {h.progress.historicalUnits > h.progress.unitsTowardGoal
                          ? ` (${h.progress.historicalUnits} hist.)`
                          : ""}{" "}
                        · {h.statusLabel}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Movimentações</h3>
              {detail.events.length === 0 ? (
                <p className="text-sm text-text-muted">Sem eventos.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {detail.events.map((e) => (
                    <li key={e.id} className="border-b border-border/30 py-1.5 last:border-0">
                      <div>{e.description}</div>
                      <div className="text-xs text-text-muted">
                        {format(parseISO(e.createdAt), "dd/MM/yyyy HH:mm")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {canWrite && detail.participant?.active && (
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await post({ action: "leave", clientId: detail.client.id });
                    setToast("Cliente desativado do programa.");
                    setDetailClientId(null);
                  } catch (e) {
                    setToast(e instanceof Error ? e.message : "Erro");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Remover do programa
              </Button>
            )}
          </aside>
        </div>
      )}

      {/* Modal inscrição */}
      {enrollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEnrollOpen(false)}>
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold">Inscrever cliente</h3>
            <ul className="space-y-1">
              {clients.filter((c) => !c.enrolled).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={busy}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface/60"
                    onClick={() => void enroll(c.id)}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              {clients.filter((c) => !c.enrolled).length === 0 && (
                <p className="text-sm text-text-muted">Todos os clientes já estão no programa (ou não há clientes).</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </ModuleShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface/30 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-text-muted">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        status === "reward_available" || status === "completed"
          ? "bg-brand-green/15 text-brand-green"
          : status === "almost_there"
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            : status === "week_closed_incomplete"
              ? "bg-brand-red/10 text-brand-red"
              : "bg-surface text-text-secondary",
      )}
      title={LOYALTY_STATUS_LABELS[status as keyof typeof LOYALTY_STATUS_LABELS] ?? label}
    >
      {label}
    </span>
  );
}
