import { format, subDays } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function sanitizeViewDate(date: string | undefined): string {
  const fallback = todayISO();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fallback;
  const year = Number(date.slice(0, 4));
  if (year < 2020 || year > 2035) return fallback;
  return date;
}

function normalizeRange(
  from: string,
  to: string,
): { dateFrom: string; dateTo: string } {
  const a = sanitizeViewDate(from);
  const b = sanitizeViewDate(to);
  return a <= b ? { dateFrom: a, dateTo: b } : { dateFrom: b, dateTo: a };
}

/** general = histórico completo · day = data específica · range = período inclusivo */
export type TemporalViewMode = "general" | "day" | "range";

export interface TemporalContextState {
  viewMode: TemporalViewMode;
  /** Data de referência quando viewMode === 'day' (yyyy-MM-dd) */
  viewDate: string;
  /** Início inclusivo quando viewMode === 'range' */
  dateFrom: string;
  /** Fim inclusivo quando viewMode === 'range' */
  dateTo: string;
  setGeneral: () => void;
  setViewDate: (date: string) => void;
  setDateRange: (from: string, to: string) => void;
  setToday: () => void;
  setYesterday: () => void;
  setLastOperationalDay: (date: string) => void;
}

export const useTemporalContextStore = create<TemporalContextState>()(
  persist(
    (set) => ({
      viewMode: "general",
      viewDate: todayISO(),
      dateFrom: todayISO(),
      dateTo: todayISO(),
      setGeneral: () => set({ viewMode: "general" }),
      setViewDate: (date) =>
        set({
          viewMode: "day",
          viewDate: sanitizeViewDate(date),
        }),
      setDateRange: (from, to) => {
        const { dateFrom, dateTo } = normalizeRange(from, to);
        set({
          viewMode: "range",
          dateFrom,
          dateTo,
          viewDate: dateTo,
        });
      },
      setToday: () => set({ viewMode: "day", viewDate: todayISO() }),
      setYesterday: () =>
        set({
          viewMode: "day",
          viewDate: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        }),
      setLastOperationalDay: (date) => set({ viewMode: "day", viewDate: date }),
    }),
    {
      name: "lbo-temporal-context",
      version: 4,
      migrate: (persisted: unknown, version) => {
        const state = persisted as Partial<TemporalContextState>;
        const viewDate = sanitizeViewDate(state.viewDate);
        const today = todayISO();
        if (version < 2) {
          return {
            viewMode: "general" as const,
            viewDate,
            dateFrom: today,
            dateTo: today,
          };
        }
        if (version < 4) {
          return {
            viewMode: state.viewMode === "day" ? ("day" as const) : ("general" as const),
            viewDate,
            dateFrom: sanitizeViewDate(state.dateFrom) || today,
            dateTo: sanitizeViewDate(state.dateTo) || today,
          };
        }
        return {
          ...state,
          viewDate,
          dateFrom: sanitizeViewDate(state.dateFrom) || today,
          dateTo: sanitizeViewDate(state.dateTo) || today,
        } as TemporalContextState;
      },
    },
  ),
);

export interface TemporalViewContext {
  mode: TemporalViewMode;
  viewDate: string;
  dateFrom: string;
  dateTo: string;
}

export function useTemporalViewContext(): TemporalViewContext {
  const viewMode = useTemporalContextStore((s) => s.viewMode);
  const viewDate = useTemporalContextStore((s) => s.viewDate);
  const dateFrom = useTemporalContextStore((s) => s.dateFrom);
  const dateTo = useTemporalContextStore((s) => s.dateTo);
  return { mode: viewMode, viewDate, dateFrom, dateTo };
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

export function isViewingRange(context: TemporalViewContext): boolean {
  return context.mode === "range";
}
