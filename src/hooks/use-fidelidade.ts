"use client";

import { useCallback, useEffect, useState } from "react";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { withBusinessQuery } from "@/lib/business-units";
import type { LoyaltyView } from "@/lib/loyalty/loyalty-view";

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Erro na fidelidade.");
  return json;
}

export function useFidelidade(weekStart?: string) {
  const { activeBusinessId, canWrite, writeBlockedMessage } = useBusinessScope();
  const [view, setView] = useState<LoyaltyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = withBusinessQuery("/api/fidelidade", activeBusinessId);
      const withWeek = weekStart
        ? `${url}${url.includes("?") ? "&" : "?"}weekStart=${encodeURIComponent(weekStart)}`
        : url;
      const res = await fetch(withWeek);
      const json = await parseJson(res);
      setView(json.view);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [activeBusinessId, weekStart]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch("/api/fidelidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, businessId: activeBusinessId }),
      });
      const json = await parseJson(res);
      await reload();
      return json;
    },
    [activeBusinessId, reload],
  );

  return {
    view,
    loading,
    error,
    reload,
    post,
    businessId: activeBusinessId,
    canWrite,
    writeBlockedMessage,
  };
}
