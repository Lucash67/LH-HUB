"use client";

import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileImage,
  FileText,
  Images,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ModuleShell } from "@/components/layout/module-shell";
import { BusinessWriteNotice } from "@/components/business/business-write-notice";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useGaleria } from "@/hooks/use-galeria";
import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_LABELS,
  formatByteSize,
  type GalleryAsset,
  type GalleryCategory,
} from "@/lib/galeria/types";
import { cn } from "@/lib/utils";

export default function GaleriaPage() {
  const {
    items,
    loading,
    error,
    canWrite,
    writeBlockedMessage,
    createItem,
    attachFile,
    removeItem,
  } = useGaleria();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("arte");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const [attachTargetId, setAttachTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        (item.fileName ?? "").toLowerCase().includes(q) ||
        GALLERY_CATEGORY_LABELS[item.category].toLowerCase().includes(q)
      );
    });
  }, [items, query, categoryFilter]);

  const pendingFile = filtered.filter((i) => !i.hasFile);
  const withFile = filtered.filter((i) => i.hasFile);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setFormError(null);
    try {
      await createItem({ title, category, notes, file });
      setTitle("");
      setNotes("");
      setFile(null);
      setCategory("arte");
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function requestAttach(id: string) {
    setAttachTargetId(id);
    attachInputRef.current?.click();
  }

  async function onAttachChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    const id = attachTargetId;
    e.target.value = "";
    setAttachTargetId(null);
    if (!picked || !id || !canWrite) return;
    setSaving(true);
    try {
      await attachFile(id, picked);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao anexar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: GalleryAsset) {
    if (!canWrite) return;
    if (!confirm(`Excluir “${item.title}”?`)) return;
    try {
      await removeItem(item.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  if (loading) {
    return (
      <ModuleShell title="Galeria" subtitle="Design, arte e materiais da operação">
        <PageLoader />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Galeria"
      subtitle="Design, arte e materiais da operação"
      actions={
        canWrite ? (
          <Button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo item
          </Button>
        ) : undefined
      }
    >
      {!canWrite && <BusinessWriteNotice message={writeBlockedMessage} />}

      <input
        ref={attachInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
        onChange={onAttachChange}
      />

      <div className="mb-4 space-y-3">
        <p className="max-w-2xl text-sm text-text-secondary">
          Guarde cardápios, cartazes, anúncios e referências de arte. Os quatro materiais
          recentes já estão listados — anexe o arquivo final em cada um para baixar depois.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, nota ou arquivo…"
              className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-[#7C3CFF]/50"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as GalleryCategory | "all")}
            className="rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-sm text-text-primary"
          >
            <option value="all">Todas as categorias</option>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {GALLERY_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && canWrite && (
        <form
          onSubmit={handleCreate}
          className="mb-5 rounded-2xl border border-[#7C3CFF]/25 bg-surface-card p-4 sm:p-5"
        >
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Novo material</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs text-text-muted">Título</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-base px-3 py-2 text-sm"
                placeholder="Ex.: Cardápio setembro"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-text-muted">Categoria</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full rounded-xl border border-surface-border bg-surface-base px-3 py-2 text-sm"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {GALLERY_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-text-muted">Arquivo (opcional, até 4 MB)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-[#7C3CFF]/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#C4B5FD]"
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs text-text-muted">Notas</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-surface-border bg-surface-base px-3 py-2 text-sm"
                placeholder="Contexto, onde foi usado, versão…"
              />
            </label>
          </div>
          {formError && <p className="mt-2 text-sm text-brand-red">{formError}</p>}
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={saving} className="gap-2">
              <Upload className="h-4 w-4" />
              {saving ? "Salvando…" : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/50 px-4 py-12 text-center">
          <Images className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-secondary">Nenhum material neste filtro.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingFile.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-orange">
                Aguardando arquivo ({pendingFile.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pendingFile.map((item) => (
                  <AssetCard
                    key={item.id}
                    item={item}
                    canWrite={canWrite}
                    onAttach={() => requestAttach(item.id)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {withFile.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Com arquivo ({withFile.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {withFile.map((item) => (
                  <AssetCard
                    key={item.id}
                    item={item}
                    canWrite={canWrite}
                    onAttach={() => requestAttach(item.id)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </ModuleShell>
  );
}

function AssetCard({
  item,
  canWrite,
  onAttach,
  onDelete,
}: {
  item: GalleryAsset;
  canWrite: boolean;
  onAttach: () => void;
  onDelete: () => void;
}) {
  const isImage = (item.mimeType ?? "").startsWith("image/");
  const created = format(parseISO(item.createdAt), "dd MMM yyyy", { locale: ptBR });

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
      <div className="relative flex h-36 items-center justify-center bg-surface-elevated/60">
        {item.hasFile && isImage && item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : item.hasFile ? (
          <FileText className="h-10 w-10 text-[#7C3CFF]" />
        ) : (
          <FileImage className="h-10 w-10 text-text-muted" />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          {GALLERY_CATEGORY_LABELS[item.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
          <p className="mt-0.5 text-[11px] text-text-muted">{created}</p>
        </div>
        {item.notes ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">{item.notes}</p>
        ) : null}
        <p className="text-[11px] text-text-muted">
          {item.hasFile
            ? `${item.fileName ?? "arquivo"} · ${formatByteSize(item.byteSize)}`
            : "Sem arquivo anexado"}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {item.hasFile && item.downloadUrl ? (
            <a
              href={item.downloadUrl}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-medium text-text-primary",
                "hover:border-[#7C3CFF]/40 hover:bg-[#7C3CFF]/10",
              )}
            >
              <Download className="h-3.5 w-3.5" />
              Baixar
            </a>
          ) : null}
          {canWrite && (
            <button
              type="button"
              onClick={onAttach}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-medium text-text-primary hover:border-[#0CD4FF]/40 hover:bg-[#0CD4FF]/10"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {item.hasFile ? "Trocar arquivo" : "Anexar"}
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-brand-red/80 hover:bg-brand-red/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
