"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { WeekPulse, WeekPulseDay } from "@/lib/week-pulse";

/** Dias úteis da semana até o dia em foco (inclusive). Ex.: na quinta → seg–qui. */
function daysThroughFocus(days: WeekPulseDay[]): WeekPulseDay[] {
  const focus = days.find((day) => day.isFocus);
  if (!focus) return days;
  return days.filter((day) => day.date <= focus.date);
}

/** Mini gráfico de unidades vendidas na semana — substitui o card de KPI do banner. */
export function WeekUnitsPanel({
  pulse,
  className,
}: {
  pulse: WeekPulse;
  className?: string;
}) {
  const days = daysThroughFocus(pulse.days);
  const units = days.reduce((total, day) => total + day.units, 0);
  const operationalDays = days.filter((day) => day.units > 0).length;
  const maxUnits = Math.max(...days.map((day) => day.units), 1);
  const rangeLabel =
    days.length > 0
      ? `${format(parseISO(days[0]!.date), "dd/MM")} – ${format(parseISO(days[days.length - 1]!.date), "dd/MM")}`
      : pulse.rangeLabel;

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-yellow/20 bg-surface-base/70 p-3.5 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
          Vendas na semana
        </p>
        <span className="text-[10px] font-semibold text-text-secondary">{rangeLabel}</span>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-black leading-none text-brand-yellow">
          {units}
          <span className="ml-1 text-sm font-bold text-text-secondary">un</span>
        </p>
        <p className="text-[11px] text-text-muted">
          {operationalDays} {operationalDays === 1 ? "dia" : "dias"}
        </p>
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        {days.map((day, index) => {
          const heightPct =
            day.units > 0 ? Math.max((day.units / maxUnits) * 100, 14) : 0;
          return (
            <div
              key={day.date}
              title={`${day.label} · ${day.units} un`}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span className="text-[9px] font-bold tabular-nums text-text-secondary">
                {day.units > 0 ? day.units : "—"}
              </span>
              <div className="relative h-14 w-full overflow-hidden rounded-[4px] bg-surface-hover/60 sm:h-16">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-x-0 bottom-0 rounded-[4px]",
                    day.isFocus
                      ? "bg-gradient-to-t from-brand-yellow to-[#FFEA70]"
                      : "bg-brand-yellow/55",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold capitalize",
                  day.isFocus ? "text-brand-yellow" : "text-text-muted",
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
