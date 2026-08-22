"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  Lightbulb,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";
import { PageLoader } from "@/components/ui/loading";
import { useIdeias } from "@/hooks/use-ideias";
import {
  IDEA_KIND_LABELS,
  IDEA_KINDS,
  IDEA_STATUS_LABELS,
  type IdeaItem,
  type IdeaKind,
} from "@/lib/ideias/types";
import { cn } from "@/lib/utils";

export default function IdeiasPage() {
  const {
    items,
    loading,
    error,
    showArchived,
    createItem,
    updateItem,
    setStatus,
    togglePinned,
    removeItem,
    toggleShowArchived,
  } = useIdeias();

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<IdeaKind | "all">("all");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftKind, setDraftKind] = useState<IdeaKind>("ideia");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (!showArchived && item.status === "archived") return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)
      );
    });
  }, [items, query, kindFilter, showArchived]);

  const openItems = filtered.filter((i) => i.status === "open");
  const doneItems = filtered.filter((i) => i.status === "done");
  const archivedItems = filtered.filter((i) => i.status === "archived");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draftTitle.trim() && !draftBody.trim()) return;
    setSaving(true);
    try {
      await createItem({
        title: draftTitle.trim() || draftBody.trim().slice(0, 80),
        body: draftBody.trim(),
        kind: draftKind,
      });
      setDraftTitle("");
      setDraftBody("");
      setDraftKind("ideia");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleShell
      title="Ideias"
      subtitle="Backlog de idéias, demandas e observações para o futuro"
      temporalFilter={false}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-24">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-white/10 bg-[#12141F]/80 p-4 shadow-[0_0_0_1px_rgba(124,60,255,0.12)]"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {IDEA_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraftKind(k)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  draftKind === k
                    ? "bg-[#7C3CFF]/25 text-[#0CD4FF] ring-1 ring-[#7C3CFF]/50"
                    : "bg-white/5 text-white/60 hover:bg-white/10",
                )}
              >
                {IDEA_KIND_LABELS[k]}
              </button>
            ))}
          </div>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Título (ex.: Novo cardápio)"
            className="mb-2 w-full rounded-xl border border-white/10 bg-[#0B0D17] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#7C3CFF]/50"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Detalhes, contexto, por que importa…"
            rows={3}
            className="mb-3 w-full resize-y rounded-xl border border-white/10 bg-[#0B0D17] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#7C3CFF]/50"
          />
          <button
            type="submit"
            disabled={saving || (!draftTitle.trim() && !draftBody.trim())}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3CFF] to-[#3882F6] px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="h-10 w-full rounded-xl border border-white/10 bg-[#0B0D17] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#7C3CFF]/50"
            />
          </div>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as IdeaKind | "all")}
            className="h-10 rounded-xl border border-white/10 bg-[#0B0D17] px-3 text-sm text-white outline-none"
          >
            <option value="all">Todos os tipos</option>
            {IDEA_KINDS.map((k) => (
              <option key={k} value={k}>
                {IDEA_KIND_LABELS[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleShowArchived}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
              showArchived
                ? "border-[#7C3CFF]/45 bg-[#7C3CFF]/15 text-white"
                : "border-white/10 text-white/60 hover:text-white",
            )}
          >
            <Archive className="h-3.5 w-3.5" />
            Arquivadas
          </button>
        </div>

        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {openItems.length > 0 && (
              <Section title="Abertas" count={openItems.length}>
                {openItems.map((item) => (
                  <IdeaRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                    onSave={async (patch) => {
                      await updateItem({ id: item.id, ...patch });
                    }}
                    onDone={() => setStatus(item.id, "done")}
                    onArchive={() => setStatus(item.id, "archived")}
                    onPin={() => togglePinned(item)}
                    onDelete={() => removeItem(item.id)}
                  />
                ))}
              </Section>
            )}
            {doneItems.length > 0 && (
              <Section title="Feitas" count={doneItems.length}>
                {doneItems.map((item) => (
                  <IdeaRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                    onSave={async (patch) => {
                      await updateItem({ id: item.id, ...patch });
                    }}
                    onReopen={() => setStatus(item.id, "open")}
                    onArchive={() => setStatus(item.id, "archived")}
                    onPin={() => togglePinned(item)}
                    onDelete={() => removeItem(item.id)}
                  />
                ))}
              </Section>
            )}
            {showArchived && archivedItems.length > 0 && (
              <Section title="Arquivadas" count={archivedItems.length}>
                {archivedItems.map((item) => (
                  <IdeaRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                    onSave={async (patch) => {
                      await updateItem({ id: item.id, ...patch });
                    }}
                    onReopen={() => setStatus(item.id, "open")}
                    onPin={() => togglePinned(item)}
                    onDelete={() => removeItem(item.id)}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/45">
        {title} · {count}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <Lightbulb className="h-8 w-8 text-[#7C3CFF]" />
      <p className="text-sm font-medium text-white">Nada por aqui ainda</p>
      <p className="max-w-sm text-xs leading-relaxed text-white/50">
        Anote cardápio novo, estratégias de venda, melhorias e qualquer demanda futura para não
        esquecer.
      </p>
    </div>
  );
}

function IdeaRow({
  item,
  expanded,
  onToggle,
  onSave,
  onDone,
  onReopen,
  onArchive,
  onPin,
  onDelete,
}: {
  item: IdeaItem;
  expanded: boolean;
  onToggle: () => void;
  onSave: (patch: { title?: string; body?: string; kind?: IdeaKind }) => Promise<void>;
  onDone?: () => void;
  onReopen?: () => void;
  onArchive?: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [kind, setKind] = useState(item.kind);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => void | Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={cn(
        "rounded-2xl border border-white/10 bg-[#12141F]/70 transition",
        item.pinned && "border-[#7C3CFF]/35",
        item.status === "done" && "opacity-80",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span
          className={cn(
            "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            item.kind === "ideia" && "bg-[#7C3CFF]/20 text-[#A78BFA]",
            item.kind === "demanda" && "bg-[#3882F6]/20 text-[#93C5FD]",
            item.kind === "observacao" && "bg-[#0CD4FF]/15 text-[#67E8F9]",
          )}
        >
          {IDEA_KIND_LABELS[item.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{item.title || "(sem título)"}</p>
          {!expanded && item.body && (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/50">{item.body}</p>
          )}
          <p className="mt-1 text-[10px] text-white/35">{IDEA_STATUS_LABELS[item.status]}</p>
        </div>
        {item.pinned && <Pin className="mt-1 h-3.5 w-3.5 shrink-0 text-[#0CD4FF]" />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/5 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {IDEA_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px]",
                  kind === k
                    ? "bg-[#7C3CFF]/25 text-[#0CD4FF]"
                    : "bg-white/5 text-white/50",
                )}
              >
                {IDEA_KIND_LABELS[k]}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0B0D17] px-3 py-2 text-sm text-white outline-none focus:border-[#7C3CFF]/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-white/10 bg-[#0B0D17] px-3 py-2 text-sm text-white outline-none focus:border-[#7C3CFF]/50"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onSave({ title, body, kind }))}
              className="rounded-xl bg-[#7C3CFF]/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7C3CFF]/35"
            >
              Salvar
            </button>
            {onDone && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onDone)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-[#22C55E]"
              >
                <Check className="h-3.5 w-3.5" /> Feita
              </button>
            )}
            {onReopen && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onReopen)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-[#0CD4FF]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reabrir
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => run(onPin)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70"
            >
              {item.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              {item.pinned ? "Desafixar" : "Fixar"}
            </button>
            {onArchive && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onArchive)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60"
              >
                <Archive className="h-3.5 w-3.5" /> Arquivar
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm("Excluir esta ideia?")) void run(onDelete);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
