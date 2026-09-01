"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  contactType: string;
  notes: string | null;
  serviceUrl: string | null;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  contactType: "lead" as "lead" | "client",
  notes: "",
};

export function CrmContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/crm/contacts");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha ao carregar.");
    setContacts(data.contacts ?? []);
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

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      company: c.company ?? "",
      contactType: (c.contactType as "lead" | "client") || "lead",
      notes: c.notes ?? "",
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/contacts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[#A0A0A0]">Carregando contatos…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Contatos
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Leads e clientes</h1>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Novo contato
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
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-[#A0A0A0]">Nome</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Telefone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Empresa</span>
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#A0A0A0]">Tipo</span>
            <select
              value={form.contactType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactType: e.target.value as "lead" | "client",
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              <option value="lead">Lead</option>
              <option value="client">Cliente</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-[#A0A0A0]">Notas</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-[#0b0c14] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Salvando…" : editingId ? "Atualizar" : "Criar"}
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

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1c24] text-[11px] uppercase tracking-wide text-[#A0A0A0]">
            <tr>
              <th className="px-3 py-2 font-semibold">Nome</th>
              <th className="hidden px-3 py-2 font-semibold sm:table-cell">Contato</th>
              <th className="hidden px-3 py-2 font-semibold md:table-cell">Site</th>
              <th className="px-3 py-2 font-semibold">Tipo</th>
              <th className="px-3 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[#737373]">
                  Nenhum contato ainda. Crie o primeiro lead.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="border-t border-white/5 bg-[#12141c]">
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{c.name}</p>
                    {c.company ? (
                      <p className="text-xs text-[#A0A0A0]">{c.company}</p>
                    ) : null}
                  </td>
                  <td className="hidden px-3 py-3 text-[#A0A0A0] sm:table-cell">
                    <p>{c.email || "—"}</p>
                    <p className="text-xs">{c.phone || ""}</p>
                  </td>
                  <td className="hidden px-3 py-3 md:table-cell">
                    {c.serviceUrl ? (
                      <a
                        href={c.serviceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Abrir
                      </a>
                    ) : (
                      <span className="text-xs text-[#737373]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                      {c.contactType === "client" ? "Cliente" : "Lead"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs font-medium text-emerald-300 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
