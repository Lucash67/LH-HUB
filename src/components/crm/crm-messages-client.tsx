"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, MessageCircle, Plus, Trash2 } from "lucide-react";
import {
  CRM_MESSAGE_KINDS,
  type CrmMessageKind,
  type CrmMessageStatus,
} from "@/constants/crm-brand";
import {
  dateToFortalezaLocalInput,
  firstNameOf,
  formatFortalezaWhen,
  nextMonday0800Local,
  suggestPitch,
} from "@/lib/crm/message-drafts";
import { waMeLink } from "@/lib/crm/norte-playbook";
import { cn } from "@/lib/utils";

type Contact = { id: string; name: string; phone: string | null; company: string | null };
type Deal = { id: string; title: string; contactId: string | null };

type Message = {
  id: string;
  kind: CrmMessageKind;
  title: string;
  body: string;
  scheduledFor: string | null;
  status: CrmMessageStatus;
  sentAt: string | null;
  contactId: string | null;
  dealId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactCompany: string | null;
  dealTitle: string | null;
};

const KIND_LABEL = Object.fromEntries(CRM_MESSAGE_KINDS.map((k) => [k.slug, k.label])) as Record<
  CrmMessageKind,
  string
>;

function kindOf(value: string): CrmMessageKind {
  return CRM_MESSAGE_KINDS.some((k) => k.slug === value) ? (value as CrmMessageKind) : "outro";
}

function emptyForm() {
  return {
    contactId: "",
    dealId: "",
    kind: "pitch_inicial" as CrmMessageKind,
    title: "",
    body: "",
    scheduledFor: nextMonday0800Local(),
  };
}

function MessageCard({
  message,
  onEdit,
  onSent,
  onDelete,
  busy,
}: {
  message: Message;
  onEdit: (m: Message) => void;
  onSent: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const wa = waMeLink(message.contactPhone, message.body);
  const due =
    message.status !== "sent" &&
    message.scheduledFor &&
    new Date(message.scheduledFor).getTime() <= Date.now();

  async function copyBody() {
    await navigator.clipboard.writeText(message.body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        message.status === "sent"
          ? "border-white/10 bg-[#12141c] opacity-80"
          : due
            ? "border-amber-400/60 bg-amber-500/10"
            : "border-emerald-500/20 bg-[#1a1c24]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            {KIND_LABEL[kindOf(message.kind)]}
            {due ? " · agora" : ""}
            {message.status === "sent" ? " · enviada" : ""}
          </p>
          <h3 className="mt-1 text-base font-bold text-white">
            {message.contactName ?? "Sem contato"}
            {message.contactCompany ? (
              <span className="ml-2 text-sm font-medium text-[#A0A0A0]">
                {message.contactCompany}
              </span>
            ) : null}
          </h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            {formatFortalezaWhen(message.scheduledFor)}
            {message.dealTitle ? ` · ${message.dealTitle}` : ""}
          </p>
        </div>
      </div>
      <blockquote className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0b0c14]/70 px-3 py-2.5 text-sm leading-relaxed text-[#F5F6FA]">
        {message.body}
      </blockquote>
      <div className="mt-3 flex flex-wrap gap-2">
        {wa && message.status !== "sent" ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Abrir WhatsApp
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => void copyBody()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#F5F6FA] hover:bg-white/10"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
        {message.status !== "sent" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSent(message.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Enviei
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(message)}
          className="rounded-lg px-3 py-2 text-xs text-[#A0A0A0] hover:text-white"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(message.id)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Apagar
        </button>
      </div>
    </article>
  );
}

export function CrmMessagesClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const [msgRes, contactsRes, dealsRes] = await Promise.all([
      fetch("/api/crm/messages"),
      fetch("/api/crm/contacts"),
      fetch("/api/crm/deals"),
    ]);
    const msgData = await msgRes.json();
    const contactsData = await contactsRes.json();
    const dealsData = await dealsRes.json();
    if (!msgRes.ok) throw new Error(msgData.error ?? "Falha nas mensagens.");
    if (!contactsRes.ok) throw new Error(contactsData.error ?? "Falha nos contatos.");
    if (!dealsRes.ok) throw new Error(dealsData.error ?? "Falha nos negócios.");
    setMessages(msgData.messages ?? []);
    setContacts(contactsData.contacts ?? []);
    setDeals(
      (dealsData.deals ?? []).map((d: Deal) => ({
        id: d.id,
        title: d.title,
        contactId: d.contactId,
      })),
    );
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

  const filteredDeals = useMemo(
    () =>
      form.contactId ? deals.filter((d) => d.contactId === form.contactId) : deals,
    [deals, form.contactId],
  );

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(m: Message) {
    setEditingId(m.id);
    setForm({
      contactId: m.contactId ?? "",
      dealId: m.dealId ?? "",
      kind: kindOf(m.kind),
      title: m.title,
      body: m.body,
      scheduledFor: dateToFortalezaLocalInput(m.scheduledFor),
    });
    setShowForm(true);
  }

  function applyTemplate() {
    const contact = contacts.find((c) => c.id === form.contactId);
    const nick = firstNameOf(contact?.name);
    setForm((f) => ({ ...f, body: suggestPitch(f.kind, nick) }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const contact = contacts.find((c) => c.id === form.contactId);
      const payload = {
        contactId: form.contactId,
        dealId: form.dealId || null,
        kind: form.kind,
        title: form.title.trim() || contact?.name || "Pitch",
        body: form.body,
        scheduledFor: form.scheduledFor || null,
        status: form.scheduledFor ? "scheduled" : "draft",
      };
      const res = await fetch("/api/crm/messages", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  async function onSent(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "sent" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao marcar.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Apagar este rascunho?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/messages?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao apagar.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  const now = Date.now();
  const due = messages.filter(
    (m) => m.status !== "sent" && m.scheduledFor && new Date(m.scheduledFor).getTime() <= now,
  );
  const upcoming = messages.filter(
    (m) => m.status !== "sent" && m.scheduledFor && new Date(m.scheduledFor).getTime() > now,
  );
  const drafts = messages.filter((m) => m.status !== "sent" && !m.scheduledFor);
  const sent = messages.filter((m) => m.status === "sent");

  if (loading) return <p className="text-sm text-[#A0A0A0]">Carregando mensagens…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Mensagens
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Pitchs e abordagens</h1>
          <p className="mt-1 max-w-xl text-sm text-[#A0A0A0]">
            Guarda o texto agora. Manda no dia e na hora que você escolheu — o app
            não dispara sozinho.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Novo rascunho
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-emerald-500/20 bg-[#1a1c24] p-4 sm:grid-cols-2"
        >
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Contato</span>
            <select
              required
              value={form.contactId}
              onChange={(e) => setForm((f) => ({ ...f, contactId: e.target.value, dealId: "" }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              <option value="">Escolha…</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Negócio (opcional)</span>
            <select
              value={form.dealId}
              onChange={(e) => setForm((f) => ({ ...f, dealId: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              <option value="">Sem negócio</option>
              {filteredDeals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Tipo</span>
            <select
              value={form.kind}
              onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as CrmMessageKind }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              {CRM_MESSAGE_KINDS.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Dia e hora (Fortaleza)</span>
            <input
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-[#A0A0A0]">Título (opcional)</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              placeholder="Pitch inicial — Arthur"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 flex items-center justify-between text-[#A0A0A0]">
              Mensagem
              <button
                type="button"
                onClick={applyTemplate}
                className="text-xs text-emerald-300 hover:underline"
              >
                Sugerir texto
              </button>
            </span>
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              placeholder="O texto que você vai colar no WhatsApp…"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Salvando…" : editingId ? "Salvar" : "Agendar rascunho"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#A0A0A0]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {!messages.length && !showForm ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-[#A0A0A0]">
          Nenhum rascunho ainda. Cria o pitch de segunda 08h — o campo de horário já
          nasce nesse horário.
        </p>
      ) : null}

      {due.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">
            Hora de mandar
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {due.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                onEdit={startEdit}
                onSent={onSent}
                onDelete={onDelete}
                busy={saving}
              />
            ))}
          </div>
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Agenda
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {upcoming.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                onEdit={startEdit}
                onSent={onSent}
                onDelete={onDelete}
                busy={saving}
              />
            ))}
          </div>
        </section>
      ) : null}

      {drafts.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Sem horário
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {drafts.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                onEdit={startEdit}
                onSent={onSent}
                onDelete={onDelete}
                busy={saving}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sent.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#737373]">
            Já enviadas
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {sent.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                onEdit={startEdit}
                onSent={onSent}
                onDelete={onDelete}
                busy={saving}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
