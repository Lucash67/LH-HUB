import { format, subDays } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** general = histórico completo · day = data específica */
export type TemporalViewMode = "general" | "day";

export interface TemporalContextState {
  viewMode: TemporalViewMode;
  /** Data de referência quando viewMode === 'day' (yyyy-MM-dd) */
  viewDate: string;
  setGeneral: () => void;
  setViewDate: (date: string) => void;
  setToday: () => void;
  setYesterday: () => void;
  setLastOperationalDay: (date: string) => void;
}

export const useTemporalContextStore = create<TemporalContextState>()(
  persist(
    (set) => ({
      viewMode: "general",
      viewDate: todayISO(),
      setGeneral: () => set({ viewMode: "general" }),
      setViewDate: (date) => set({ viewMode: "day", viewDate: date }),
      setToday: () => set({ viewMode: "day", viewDate: todayISO() }),
      setYesterday: () =>
        set({ viewMode: "day", viewDate: format(subDays(new Date(), 1), "yyyy-MM-dd") }),
      setLastOperationalDay: (date) => set({ viewMode: "day", viewDate: date }),
    }),
    {
      name: "lbo-temporal-context",
      version: 2,
      migrate: (persisted: unknown, version) => {
        const state = persisted as Partial<TemporalContextState>;
        if (version < 2) {
          return {
            viewMode: "general" as const,
            viewDate: state.viewDate ?? todayISO(),
          };
        }
        return state as TemporalContextState;
      },
    },
  ),
);

export interface TemporalViewContext {
  mode: TemporalViewMode;
  viewDate: string;
}

export function useTemporalViewContext(): TemporalViewContext {
  const viewMode = useTemporalContextStore((s) => s.viewMode);
  const viewDate = useTemporalContextStore((s) => s.viewDate);
  return { mode: viewMode, viewDate };
}

/** @deprecated Prefer useTemporalViewContext */
export function useViewDate(): string {
  return useTemporalContextStore((s) => s.viewDate);
}

export function isViewingToday(context: TemporalViewContext): boolean {
  return context.mode === "day" && context.viewDate === todayISO();
}

export function isViewingGeneral(context: TemporalViewContext): boolean {
  return context.mode === "general";
}
