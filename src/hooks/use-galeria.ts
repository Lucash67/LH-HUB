"use client";

import { useCallback, useEffect, useState } from "react";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { withBusinessQuery } from "@/lib/business-units";
import type { GalleryAsset, GalleryCategory } from "@/lib/galeria/types";

export function useGaleria() {
  const { activeBusinessId, canWrite, writeBlockedMessage } = useBusinessScope();
  const [items, setItems] = useState<GalleryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(withBusinessQuery("/api/galeria", activeBusinessId));
      if (!res.ok) throw new Error("Falha ao carregar a galeria");
      const data = (await res.json()) as { items: GalleryAsset[] };
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [activeBusinessId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createItem = useCallback(
    async (input: {
      title: string;
      category: GalleryCategory;
      notes?: string;
      files?: File[];
    }) => {
      const form = new FormData();
      form.set("businessId", activeBusinessId);
      form.set("title", input.title);
      form.set("category", input.category);
      form.set("notes", input.notes ?? "");
      for (const f of input.files ?? []) form.append("files", f);
      const res = await fetch("/api/galeria", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as
        | { item?: GalleryAsset; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível criar");
      await refresh();
      return data?.item;
    },
    [activeBusinessId, refresh],
  );

  const updateMeta = useCallback(
    async (input: {
      id: string;
      title: string;
      category: GalleryCategory;
      notes?: string;
    }) => {
      const res = await fetch("/api/galeria", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: activeBusinessId, ...input }),
      });
      const data = (await res.json().catch(() => null)) as
        | { item?: GalleryAsset; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível salvar");
      await refresh();
      return data?.item;
    },
    [activeBusinessId, refresh],
  );

  const addFiles = useCallback(
    async (id: string, files: File[], meta?: { title?: string; category?: GalleryCategory; notes?: string }) => {
      const form = new FormData();
      form.set("businessId", activeBusinessId);
      form.set("id", id);
      if (meta?.title) form.set("title", meta.title);
      if (meta?.category) form.set("category", meta.category);
      if (meta?.notes != null) form.set("notes", meta.notes);
      for (const f of files) form.append("files", f);
      const res = await fetch("/api/galeria", { method: "PUT", body: form });
      const data = (await res.json().catch(() => null)) as
        | { item?: GalleryAsset; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "Não foi possível anexar");
      await refresh();
      return data?.item;
    },
    [activeBusinessId, refresh],
  );

  const reorderItems = useCallback(
    async (orderedIds: string[]) => {
      setItems((prev) => {
        const byId = new Map(prev.map((i) => [i.id, i]));
        return orderedIds.map((id, idx) => {
          const item = byId.get(id)!;
          return { ...item, sortOrder: idx };
        }).filter(Boolean);
      });
      const res = await fetch("/api/galeria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: activeBusinessId, orderedIds }),
      });
      if (!res.ok) {
        await refresh();
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível reordenar");
      }
      const data = (await res.json()) as { items: GalleryAsset[] };
      setItems(data.items ?? []);
    },
    [activeBusinessId, refresh],
  );

  const deleteFile = useCallback(
    async (assetId: string, fileId: string) => {
      const res = await fetch("/api/galeria", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: activeBusinessId,
          action: "delete-file",
          id: assetId,
          fileId,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível remover o arquivo");
      }
      await refresh();
    },
    [activeBusinessId, refresh],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const res = await fetch(
        withBusinessQuery(`/api/galeria?id=${encodeURIComponent(id)}`, activeBusinessId),
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível excluir");
      }
      await refresh();
    },
    [activeBusinessId, refresh],
  );

  return {
    items,
    setItems,
    loading,
    error,
    canWrite,
    writeBlockedMessage,
    activeBusinessId,
    refresh,
    createItem,
    updateMeta,
    addFiles,
    reorderItems,
    deleteFile,
    removeItem,
    /** @deprecated */
    attachFile: async (id: string, file: File) => addFiles(id, [file]),
  };
}
