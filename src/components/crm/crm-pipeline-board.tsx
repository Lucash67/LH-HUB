"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

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
};

type Column = { stage: Stage; deals: Deal[] };

type Contact = { id: string; name: string };

function formatBrl(value: string | number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
    setColumns(pipe.columns ?? []);
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

  async function moveDeal(dealId: string, direction: -1 | 1) {
    const flat = columns.flatMap((c) => c.deals.map((d) => ({ ...d, stageId: c.stage.id })));
    const deal = flat.find((d) => d.id === dealId);
    if (!deal) return;
    const idx = stages.findIndex((s) => s.id === deal.stageId);
    const next = stages[idx + direction];
    if (!next) return;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        deals:
          col.stage.id === deal.stageId
            ? col.deals.filter((d) => d.id !== dealId)
            : col.stage.id === next.id
              ? [...col.deals, { ...deal, stageId: next.id }]
              : col.deals,
      })),
    );

    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId: next.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível mover.");
      await load();
    }
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar.");
      setTitle("");
      setValue("");
      setContactId("");
      setSource("");
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
          <label className="block text-sm sm:col-span-2">
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

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col, colIdx) => (
          <div
            key={col.stage.id}
            className="flex w-64 shrink-0 flex-col rounded-2xl border border-white/10 bg-[#12141c]"
          >
            <div className="border-b border-white/5 px-3 py-2">
              <p className="text-sm font-semibold text-white">{col.stage.label}</p>
              <p className="text-[11px] text-[#A0A0A0]">
                {col.deals.length} ·{" "}
                {formatBrl(col.deals.reduce((a, d) => a + Number(d.value || 0), 0))}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {col.deals.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-[#737373]">Vazio</p>
              ) : (
                col.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-xl border border-emerald-500/15 bg-[#1a1c24] p-3"
                  >
                    <Link
                      href={`/crm/negocios/${deal.id}`}
                      className="block text-sm font-medium text-white hover:text-emerald-300"
                    >
                      {deal.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#A0A0A0]">
                      {deal.contactName ?? "Sem contato"} · {formatBrl(deal.value)}
                    </p>
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        disabled={colIdx === 0}
                        onClick={() => moveDeal(deal.id, -1)}
                        className="rounded-md border border-white/10 p-1 text-[#A0A0A0] hover:bg-white/5 disabled:opacity-30"
                        aria-label="Mover para trás"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={colIdx === columns.length - 1}
                        onClick={() => moveDeal(deal.id, 1)}
                        className="rounded-md border border-white/10 p-1 text-[#A0A0A0] hover:bg-white/5 disabled:opacity-30"
                        aria-label="Mover para frente"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
