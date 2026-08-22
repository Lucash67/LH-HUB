"use client";

import { useCallback, useEffect, useState } from "react";
import type { IdeaItem, IdeaKind, IdeaStatus, IdeaUpsertInput } from "@/lib/ideias/types";

export function useIdeias() {
  const [items, setItems] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const refresh = useCallback(async (archived = showArchived) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideias${archived ? "?archived=1" : ""}`);
      if (!res.ok) throw new Error("Falha ao carregar");
      const data = (await res.json()) as { items: IdeaItem[] };
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar ideias");
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createItem = useCallback(
    async (input: { title: string; body?: string; kind?: IdeaKind }) => {
      const res = await fetch("/api/ideias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Não foi possível criar");
      }
      const data = (await res.json()) as { item: IdeaItem };
      setItems((prev) => [data.item, ...prev]);
      return data.item;
    },
    [],
  );

  const updateItem = useCallback(async (input: IdeaUpsertInput & { id: string }) => {
    const res = await fetch("/api/ideias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Não foi possível salvar");
    }
    const data = (await res.json()) as { item: IdeaItem };
    setItems((prev) => {
      const next = prev.map((i) => (i.id === data.item.id ? data.item : i));
      if (!showArchived && data.item.status === "archived") {
        return next.filter((i) => i.id !== data.item.id);
      }
      return next;
    });
    return data.item;
  }, [showArchived]);

  const setStatus = useCallback(
    async (id: string, status: IdeaStatus) => updateItem({ id, status }),
    [updateItem],
  );

  const togglePinned = useCallback(
    async (item: IdeaItem) => updateItem({ id: item.id, pinned: !item.pinned }),
    [updateItem],
  );

  const removeItem = useCallback(async (id: string) => {
    const res = await fetch(`/api/ideias?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Não foi possível excluir");
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleShowArchived = useCallback(() => {
    setShowArchived((v) => {
      const next = !v;
      void refresh(next);
      return next;
    });
  }, [refresh]);

  return {
    items,
    loading,
    error,
    showArchived,
    refresh,
    createItem,
    updateItem,
    setStatus,
    togglePinned,
    removeItem,
    toggleShowArchived,
  };
}
