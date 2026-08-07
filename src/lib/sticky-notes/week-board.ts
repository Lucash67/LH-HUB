import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { StickyNote } from "./types";

export const UNDATED_COLUMN_ID = "undated";

export interface WeekColumn {
  id: string;
  /** Início da semana (yyyy-MM-dd) ou null para "Sem data". */
  weekStart: string | null;
  weekEnd: string | null;
  label: string;
  notes: StickyNote[];
}

export function weekKeyFromDate(date: string): string {
  const start = startOfWeek(parseISO(date), { weekStartsOn: 1 });
  return format(start, "yyyy-MM-dd");
}

export function weekLabel(weekStart: string, weekEnd: string): string {
  return `Semana ${format(parseISO(weekStart), "dd/MM/yyyy")} – ${format(parseISO(weekEnd), "dd/MM/yyyy")}`;
}

export function formatNoteDateLabel(date: string | null | undefined): string {
  if (!date) return "Sem data";
  return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
}

/** Monta colunas Trello: Sem data + semanas presentes (mais recente → mais antiga). */
export function buildWeekColumns(notes: StickyNote[]): WeekColumn[] {
  const byWeek = new Map<string, StickyNote[]>();
  const undated: StickyNote[] = [];

  for (const note of notes) {
    if (!note.noteDate) {
      undated.push(note);
      continue;
    }
    const key = weekKeyFromDate(note.noteDate);
    const list = byWeek.get(key) ?? [];
    list.push(note);
    byWeek.set(key, list);
  }

  const sortNotes = (list: StickyNote[]) =>
    [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return b.clientUpdatedAt.localeCompare(a.clientUpdatedAt);
    });

  const weekStarts = Array.from(byWeek.keys()).sort((a, b) => b.localeCompare(a));
  const columns: WeekColumn[] = weekStarts.map((start) => {
    const end = format(endOfWeek(parseISO(start), { weekStartsOn: 1 }), "yyyy-MM-dd");
    return {
      id: start,
      weekStart: start,
      weekEnd: end,
      label: weekLabel(start, end),
      notes: sortNotes(byWeek.get(start) ?? []),
    };
  });

  columns.unshift({
    id: UNDATED_COLUMN_ID,
    weekStart: null,
    weekEnd: null,
    label: "Sem data",
    notes: sortNotes(undated),
  });

  return columns;
}

/** Garante que a semana atual exista no board mesmo sem notas. */
export function ensureCurrentWeekColumn(columns: WeekColumn[]): WeekColumn[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const currentStart = weekKeyFromDate(today);
  if (columns.some((c) => c.id === currentStart)) return columns;
  const end = format(endOfWeek(parseISO(currentStart), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const current: WeekColumn = {
    id: currentStart,
    weekStart: currentStart,
    weekEnd: end,
    label: weekLabel(currentStart, end),
    notes: [],
  };
  // Depois de "Sem data"
  return [columns[0]!, current, ...columns.slice(1)];
}

export function neighboringWeekStarts(anchor: string, direction: -1 | 1): string {
  const base = parseISO(anchor);
  const next = direction === 1 ? addWeeks(base, 1) : subWeeks(base, 1);
  return format(startOfWeek(next, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

/** Data sugerida ao soltar numa coluna de semana. */
export function dateForWeekDrop(
  weekStart: string | null,
  previousDate: string | null | undefined,
): string | null {
  if (!weekStart) return null;
  if (previousDate && weekKeyFromDate(previousDate) === weekStart) {
    return previousDate;
  }
  return weekStart;
}
