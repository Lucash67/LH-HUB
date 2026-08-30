"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import {
  CRM_STAGE_COLUMN_UI,
  CRM_STAGE_HEADER_UI,
  CRM_STAGE_HINTS,
  CRM_TEMPERATURES,
  CRM_TEMPERATURE_META,
  type CrmTemperature,
} from "@/constants/crm-brand";
import { cn } from "@/lib/utils";

type Stage = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isWon: boolean;
  isLost: boolean;
};

type Deal = {
  id: string;
  title: string;
  value: string;
  stageId: string;
  contactId: string | null;
  contactName: string | null;
  source: string | null;
  temperature: CrmTemperature;
};

type Column = { stage: Stage; deals: Deal[] };

type Contact = { id: string; name: string };

function formatBrl(value: string | number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function asTemperature(value: string | null | undefined): CrmTemperature {
  if (value && CRM_TEMPERATURES.includes(value as CrmTemperature)) {
    return value as CrmTemperature;
  }
  return "neutral";
}

function StageColumn({
  stage,
  children,
}: {
  stage: Stage;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage:${stage.id}`,
    data: { stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl border transition",
        CRM_STAGE_COLUMN_UI[stage.slug] ?? "border-white/10 bg-[#12141c]",
        isOver && "ring-2 ring-white/25",
      )}
    >
      {children}
    </div>
  );
}

function DealCard({
  deal,
  stages,
  onMoveToStage,
  onSetTemperature,
}: {
  deal: Deal;
  stages: Stage[];
  onMoveToStage: (dealId: string, stageId: string) => void;
  onSetTemperature: (dealId: string, temperature: CrmTemperature) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });
  const temp = asTemperature(deal.temperature);
  const meta = CRM_TEMPERATURE_META[temp];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
      }}
      className={cn("overflow-hidden rounded-xl border p-3", meta.card)}
    >
      <div className="flex items-start gap-1.5">
        <span className={cn("mt-0.5 h-10 w-1 shrink-0 rounded-full", meta.bar)} />
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-[#737373] hover:bg-white/5 hover:text-white active:cursor-grabbing"
          aria-label="Arrastar negócio"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              meta.badge,
            )}
          >
            {meta.label}
          </span>
          <Link
            href={`/crm/negocios/${deal.id}`}
            className="mt-1.5 block text-sm font-medium text-white hover:text-emerald-300"
          >
            {deal.title}
          </Link>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            {deal.contactName ?? "Sem contato"} · {formatBrl(deal.value)}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#C8C8C8]">{meta.hint}</p>
          <label className="mt-2 block">
            <span className="sr-only">Temperatura</span>
            <select
              value={temp}
              onChange={(e) => onSetTemperature(deal.id, e.target.value as CrmTemperature)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14]/80 px-2 py-1.5 text-[11px] text-[#F5F6FA] outline-none focus:border-emerald-500/50"
            >
              {CRM_TEMPERATURES.map((t) => (
                <option key={t} value={t}>
                  {CRM_TEMPERATURE_META[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-1.5 block">
            <span className="sr-only">Mover para estágio</span>
            <select
              value={deal.stageId}
              onChange={(e) => {
                const next = e.target.value;
                if (next && next !== deal.stageId) onMoveToStage(deal.id, next);
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14]/80 px-2 py-1.5 text-[11px] text-[#F5F6FA] outline-none focus:border-emerald-500/50"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  Mover → {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export function CrmPipelineBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [contactId, setContactId] = useState("");
  const [source, setSource] = useState("");
  const [temperature, setTemperature] = useState<CrmTemperature>("cold");
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const load = useCallback(async () => {
    setError(null);
    const [pipeRes, contactsRes] = await Promise.all([
      fetch("/api/crm/pipeline"),
      fetch("/api/crm/contacts"),
    ]);
    const pipe = await pipeRes.json();
    const contactsData = await contactsRes.json();
    if (!pipeRes.ok) throw new Error(pipe.error ?? "Falha no pipeline.");
    if (!contactsRes.ok) throw new Error(contactsData.error ?? "Falha nos contatos.");
    const mapped: Column[] = (pipe.columns ?? []).map((col: Column) => ({
      ...col,
      deals: (col.deals ?? []).map((d: Deal) => ({
        ...d,
        temperature: asTemperature(d.temperature),
      })),
    }));
    setColumns(mapped);
    setStages(pipe.stages ?? []);
    setContacts((contactsData.contacts ?? []).map((c: Contact) => ({ id: c.id, name: c.name })));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function patchDealLocal(dealId: string, patch: Partial<Deal>) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        deals: col.deals.map((d) => (d.id === dealId ? { ...d, ...patch } : d)),
      })),
    );
  }

  async function moveDealToStage(dealId: string, stageId: string) {
    const flat = columns.flatMap((c) => c.deals.map((d) => ({ ...d, stageId: c.stage.id })));
    const deal = flat.find((d) => d.id === dealId);
    if (!deal || deal.stageId === stageId) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        deals:
          col.stage.id === deal.stageId
            ? col.deals.filter((d) => d.id !== dealId)
            : col.stage.id === stageId
              ? [...col.deals, { ...deal, stageId }]
              : col.deals,
      })),
    );

    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível mover.");
      await load();
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.deal?.temperature) {
      patchDealLocal(dealId, { temperature: asTemperature(data.deal.temperature), stageId });
    }
  }

  async function onSetTemperature(dealId: string, next: CrmTemperature) {
    patchDealLocal(dealId, { temperature: next });
    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temperature: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível atualizar a temperatura.");
      await load();
    }
  }

  function onDragStart(event: DragStartEvent) {
    const deal = event.active.data.current?.deal as Deal | undefined;
    setActiveDeal(deal ?? null);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    let targetStageId: string | null = null;
    const overId = String(over.id);
    if (overId.startsWith("stage:")) {
      targetStageId = overId.slice("stage:".length);
    } else {
      const hit = columns.flatMap((c) => c.deals).find((d) => d.id === overId);
      if (hit) targetStageId = hit.stageId;
      else {
        const col = columns.find((c) => c.deals.some((d) => d.id === overId));
        targetStageId = col?.stage.id ?? null;
      }
    }

    if (!targetStageId) return;
    await moveDealToStage(dealId, targetStageId);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          value: value ? Number(value) : 0,
          contactId: contactId || null,
          source: source || undefined,
          temperature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar.");
      setTitle("");
      setValue("");
      setContactId("");
      setSource("");
      setTemperature("cold");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#A0A0A0]">Carregando pipeline…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Pipeline
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Kanban de negócios</h1>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            Cor = temperatura. Arraste pelo ⋮⋮ ou use “Mover →”.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Novo negócio
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CRM_TEMPERATURES.map((t) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1 text-[11px]",
              CRM_TEMPERATURE_META[t].card,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", CRM_TEMPERATURE_META[t].bar)} />
            {CRM_TEMPERATURE_META[t].label}
          </span>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-2xl border border-emerald-500/20 bg-[#1a1c24] p-4 sm:grid-cols-2"
        >
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-[#A0A0A0]">Título</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              placeholder="Site institucional — Cliente X"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Valor (R$)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Contato</span>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              <option value="">Sem contato</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Temperatura</span>
            <select
              value={temperature}
              onChange={(e) => setTemperature(e.target.value as CrmTemperature)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              {CRM_TEMPERATURES.map((t) => (
                <option key={t} value={t}>
                  {CRM_TEMPERATURE_META[t].label} — {CRM_TEMPERATURE_META[t].hint}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Origem</span>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              placeholder="Indicação, Instagram…"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Criar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#A0A0A0]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveDeal(null)}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((col) => (
            <StageColumn key={col.stage.id} stage={col.stage}>
              <div className="border-b border-white/10 px-3 py-2">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    CRM_STAGE_HEADER_UI[col.stage.slug] ?? "text-white",
                  )}
                >
                  {col.stage.label}
                </p>
                <p className="text-[11px] text-[#A0A0A0]">
                  {col.deals.length} ·{" "}
                  {formatBrl(col.deals.reduce((a, d) => a + Number(d.value || 0), 0))}
                </p>
                {CRM_STAGE_HINTS[col.stage.slug as keyof typeof CRM_STAGE_HINTS] ? (
                  <p className="mt-1 text-[11px] leading-snug text-[#9a9a9a]">
                    {CRM_STAGE_HINTS[col.stage.slug as keyof typeof CRM_STAGE_HINTS]}
                  </p>
                ) : null}
              </div>
              <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
                {col.deals.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-[#737373]">
                    Solte aqui
                  </p>
                ) : (
                  col.deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      stages={stages}
                      onMoveToStage={moveDealToStage}
                      onSetTemperature={onSetTemperature}
                    />
                  ))
                )}
              </div>
            </StageColumn>
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div
              className={cn(
                "w-64 rounded-xl border p-3 shadow-xl",
                CRM_TEMPERATURE_META[asTemperature(activeDeal.temperature)].card,
              )}
            >
              <p className="text-sm font-medium text-white">{activeDeal.title}</p>
              <p className="mt-1 text-xs text-[#A0A0A0]">
                {activeDeal.contactName ?? "Sem contato"} · {formatBrl(activeDeal.value)}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
