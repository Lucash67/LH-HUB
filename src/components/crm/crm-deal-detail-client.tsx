"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CRM_TEMPERATURES, CRM_TEMPERATURE_META, type CrmTemperature } from "@/constants/crm-brand";
import { cn } from "@/lib/utils";

type Stage = { id: string; label: string; slug: string };
type Contact = { id: string; name: string };

type Deal = {
  id: string;
  title: string;
  value: string;
  source: string | null;
  notes: string | null;
  expectedClose: string | null;
  stageId: string;
  contactId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  stageLabel: string;
  temperature: CrmTemperature;
  serviceUrl: string | null;
};

export function CrmDealDetailClient({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    value: "",
    source: "",
    notes: "",
    stageId: "",
    contactId: "",
    expectedClose: "",
    temperature: "neutral" as CrmTemperature,
    serviceUrl: "",
  });

  const load = useCallback(async () => {
    const [dealRes, pipeRes, contactsRes] = await Promise.all([
      fetch(`/api/crm/deals/${dealId}`),
      fetch("/api/crm/pipeline"),
      fetch("/api/crm/contacts"),
    ]);
    const dealData = await dealRes.json();
    const pipe = await pipeRes.json();
    const contactsData = await contactsRes.json();
    if (!dealRes.ok) throw new Error(dealData.error ?? "Negócio não encontrado.");
    setDeal(dealData.deal);
    setStages(pipe.stages ?? []);
    setContacts((contactsData.contacts ?? []).map((c: Contact) => ({ id: c.id, name: c.name })));
    const d = dealData.deal as Deal;
    setForm({
      title: d.title,
      value: String(Number(d.value || 0)),
      source: d.source ?? "",
      notes: d.notes ?? "",
      stageId: d.stageId,
      contactId: d.contactId ?? "",
      expectedClose: d.expectedClose ?? "",
      temperature: (CRM_TEMPERATURES.includes(d.temperature) ? d.temperature : "neutral") as CrmTemperature,
      serviceUrl: d.serviceUrl ?? "",
    });
  }, [dealId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          value: Number(form.value || 0),
          source: form.source || null,
          notes: form.notes || null,
          stageId: form.stageId,
          contactId: form.contactId || null,
          expectedClose: form.expectedClose || null,
          temperature: form.temperature,
          serviceUrl: form.serviceUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !deal) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/crm/pipeline" className="text-sm text-emerald-300 hover:underline">
          Voltar ao pipeline
        </Link>
      </div>
    );
  }

  if (!deal) {
    return <p className="text-sm text-[#A0A0A0]">Carregando negócio…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/crm/pipeline" className="text-xs text-emerald-400 hover:underline">
          ← Pipeline
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{deal.title}</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">
          {deal.stageLabel}
          {deal.contactName ? ` · ${deal.contactName}` : ""}
        </p>
        <p className="mt-2">
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              CRM_TEMPERATURE_META[form.temperature]?.badge ?? CRM_TEMPERATURE_META.neutral.badge,
            )}
          >
            {CRM_TEMPERATURE_META[form.temperature]?.label ?? "Neutro"}
          </span>
          <span className="ml-2 text-xs text-[#A0A0A0]">
            {CRM_TEMPERATURE_META[form.temperature]?.hint}
          </span>
        </p>
        {form.serviceUrl ? (
          <a
            href={form.serviceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir site / serviço
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid max-w-2xl gap-3 rounded-2xl border border-emerald-500/20 bg-[#1a1c24] p-4 sm:grid-cols-2"
      >
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-[#A0A0A0]">Título</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[#A0A0A0]">Valor (R$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[#A0A0A0]">Temperatura</span>
          <select
            value={form.temperature}
            onChange={(e) =>
              setForm((f) => ({ ...f, temperature: e.target.value as CrmTemperature }))
            }
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
          <span className="mb-1 block text-[#A0A0A0]">Estágio</span>
          <select
            value={form.stageId}
            onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[#A0A0A0]">Contato</span>
          <select
            value={form.contactId}
            onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value }))}
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
          <span className="mb-1 block text-[#A0A0A0]">Previsão de fechamento</span>
          <input
            type="date"
            value={form.expectedClose}
            onChange={(e) => setForm((f) => ({ ...f, expectedClose: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-[#A0A0A0]">Link do site / serviço</span>
          <input
            value={form.serviceUrl}
            onChange={(e) => setForm((f) => ({ ...f, serviceUrl: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            placeholder="https://cliente.vercel.app"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-[#A0A0A0]">Origem</span>
          <input
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-[#A0A0A0]">Notas</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
