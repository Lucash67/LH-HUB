"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ALL_BUSINESSES_ID } from "@/lib/business-units";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  useActiveBusinessId,
  useBusinessContextStore,
  type BusinessesApiResponse,
} from "@/stores/business-context-store";

export function useOwnedBusinesses() {
  const { data: user } = useSessionUser();
  const activeBusinessId = useActiveBusinessId();
  const setActiveBusiness = useBusinessContextStore((s) => s.setActiveBusiness);
  const setOwnerUserId = useBusinessContextStore((s) => s.setOwnerUserId);
  const ownerUserId = useBusinessContextStore((s) => s.ownerUserId);
  const resetBusinessContext = useBusinessContextStore((s) => s.resetBusinessContext);
  const realUserId = user?.id && user.id !== "local" ? user.id : null;

  const query = useQuery<BusinessesApiResponse>({
    queryKey: ["businesses", realUserId ?? "pending"],
    queryFn: async () => {
      const r = await fetch("/api/businesses", { credentials: "include" });
      const json = await r.json();
      if (!r.ok || json.error) {
        throw new Error(json.error || "Não foi possível carregar as operações.");
      }
      return json;
    },
    staleTime: 60_000,
    enabled: Boolean(realUserId),
  });

  const units = query.data?.units ?? [];

  useEffect(() => {
    if (!realUserId) return;
    if (ownerUserId && ownerUserId !== realUserId) {
      resetBusinessContext(realUserId);
      return;
    }
    if (ownerUserId !== realUserId) {
      setOwnerUserId(realUserId);
    }
  }, [realUserId, ownerUserId, resetBusinessContext, setOwnerUserId]);

  useEffect(() => {
    if (!query.data) return;

    if (units.length === 0) {
      if (activeBusinessId !== ALL_BUSINESSES_ID) {
        setActiveBusiness(ALL_BUSINESSES_ID);
      }
      return;
    }

    const known = new Set<string>([ALL_BUSINESSES_ID, ...units.map((u) => u.id)]);
    if (!known.has(activeBusinessId)) {
      setActiveBusiness(units[0]!.id);
    }
  }, [query.data, units, activeBusinessId, setActiveBusiness]);

  const isSynced = useMemo(() => {
    if (!query.data) return false;
    if (units.length === 0) return activeBusinessId === ALL_BUSINESSES_ID;
    return (
      activeBusinessId === ALL_BUSINESSES_ID || units.some((u) => u.id === activeBusinessId)
    );
  }, [query.data, units, activeBusinessId]);

  return {
    ...query,
    units,
    isEmpty: Boolean(query.data && units.length === 0),
    isSynced,
    isReady: Boolean(query.data && isSynced),
  };
}
