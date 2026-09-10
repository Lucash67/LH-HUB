"use client";

import { useCallback, useEffect, useState } from "react";
import { useBusinessScope } from "@/hooks/use-business-scope";
import type { GalleryAsset, GalleryCategory } from "@/lib/galeria/types";

export function useGaleria() {
  const { activeBusinessId, canWrite, withQuery, writeBlockedMessage } = useBusinessScope();
  const [items, setItems] = useState<GalleryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(withQuery("/api/galeria"));
      if (!res.ok) throw new Error("Falha ao carregar a galeria");
      const data = (await res.json()) as { items: GalleryAsset[] };
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [withQuery]);

  useEffect(() => {
    void refresh();
  }, [refresh, activeBusinessId]);

  const createItem = useCallback(
    async (input: {
      title: string;
      category: GalleryCategory;
      notes?: string;
      file?: File | null;
    }) => {
      const form = new FormData();
      form.set("businessId", activeBusinessId);
      form.set("title", input.title);
      form.set("category", input.category);
      form.set("notes", input.notes ?? "");
      if (input.file) form.set("file", input.file);
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

  const attachFile = useCallback(
    async (id: string, file: File, meta?: { title?: string; category?: GalleryCategory; notes?: string }) => {
      const form = new FormData();
      form.set("businessId", activeBusinessId);
      form.set("id", id);
      if (meta?.title) form.set("title", meta.title);
      if (meta?.category) form.set("category", meta.category);
      if (meta?.notes != null) form.set("notes", meta.notes);
      form.set("file", file);
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

  const removeItem = useCallback(
    async (id: string) => {
      const res = await fetch(
        withQuery(`/api/galeria?id=${encodeURIComponent(id)}`),
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível excluir");
      }
      await refresh();
    },
    [refresh, withQuery],
  );

  return {
    items,
    loading,
    error,
    canWrite,
    writeBlockedMessage,
    activeBusinessId,
    withQuery,
    refresh,
    createItem,
    attachFile,
    removeItem,
  };
}
