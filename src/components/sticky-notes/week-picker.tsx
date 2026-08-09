"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  currentWeekStart,
  neighboringWeekStarts,
  weekLabel,
  weekRangeFromStart,
} from "@/lib/sticky-notes/week-board";

interface WeekPickerProps {
  weekStart: string;
  onChange: (weekStart: string) => void;
  className?: string;
}

export function WeekPicker({ weekStart, onChange, className }: WeekPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const range = useMemo(() => weekRangeFromStart(weekStart), [weekStart]);
  const label = weekLabel(range.start, range.end);
  const isCurrent = weekStart === currentWeekStart();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="inline-flex h-11 items-center rounded-lg border border-[#5f6368]/40 bg-[#202124]">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={() => onChange(neighboringWeekStarts(weekStart, -1))}
          className="flex h-full items-center px-2.5 text-[#e8eaed]/70 transition hover:bg-white/5 hover:text-[#e8eaed]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="flex min-w-0 items-center gap-2 px-2 text-sm font-medium text-[#e8eaed]"
          title="Escolher semana"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-brand-yellow" />
          <span className="truncate">{label}</span>
        </button>

        <button
          type="button"
          aria-label="Próxima semana"
          onClick={() => onChange(neighboringWeekStarts(weekStart, 1))}
          className="flex h-full items-center px-2.5 text-[#e8eaed]/70 transition hover:bg-white/5 hover:text-[#e8eaed]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => onChange(currentWeekStart())}
          className="h-11 rounded-lg border border-[#5f6368]/40 bg-[#202124] px-3 text-sm text-[#e8eaed]/75 transition hover:bg-[#28292c] hover:text-[#e8eaed]"
        >
          Esta semana
        </button>
      )}

      {pickerOpen && (
        <div className="relative">
          <div className="absolute left-0 top-0 z-30 w-[260px] rounded-xl border border-[#5f6368]/45 bg-[#2d2e30] p-3 shadow-2xl sm:left-auto sm:right-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#e8eaed]/45">
              Ir para a semana de
            </p>
            <input
              type="date"
              value={range.start}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                onChange(weekRangeFromStart(value).start);
                setPickerOpen(false);
              }}
              className="h-10 w-full rounded-lg border border-[#5f6368]/50 bg-[#202124] px-2 text-sm text-[#e8eaed] focus:border-brand-yellow/50 focus:outline-none"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-[#e8eaed]/45">
              Escolha qualquer dia — o board abre a semana completa (segunda a domingo), ex.:{" "}
              {format(parseISO("2026-08-10"), "dd/MM")} – {format(parseISO("2026-08-16"), "dd/MM")}.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="mt-2 w-full rounded-lg py-1.5 text-xs text-[#e8eaed]/50 hover:bg-white/5"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
