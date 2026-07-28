import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ALL_BUSINESSES_ID,
  getBusinessUnitName,
  type BusinessUnit,
} from "@/lib/business-units";

export interface BusinessContextState {
  activeBusinessId: string;
  setActiveBusiness: (businessId: string) => void;
}

export const useBusinessContextStore = create<BusinessContextState>()(
  persist(
    (set) => ({
      activeBusinessId: ALL_BUSINESSES_ID,
      setActiveBusiness: (businessId) => set({ activeBusinessId: businessId }),
    }),
    {
      name: "lbo-business-context",
      version: 1,
    },
  ),
);

export function useActiveBusinessId(): string {
  return useBusinessContextStore((s) => s.activeBusinessId);
}

export function formatBusinessSelectorLabel(businessId: string): string {
  return getBusinessUnitName(businessId);
}

export interface BusinessesApiResponse {
  all: { id: string; name: string };
  units: BusinessUnit[];
}
