"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WeekPulse } from "@/lib/week-pulse";

/** Mini gráfico de unidades vendidas na semana — substitui o card de KPI do banner. */
export function WeekUnitsPanel({
  pulse,
  className,
}: {
  pulse: WeekPulse;
  className?: string;
}) {
  const maxUnits = Math.max(...pulse.days.map((day) => day.units), 1);

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
        <span className="text-[10px] font-semibold text-text-secondary">{pulse.rangeLabel}</span>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-black leading-none text-brand-yellow">
          {pulse.units}
          <span className="ml-1 text-sm font-bold text-text-secondary">un</span>
        </p>
        <p className="text-[11px] text-text-muted">
          {pulse.operationalDays} {pulse.operationalDays === 1 ? "dia" : "dias"}
        </p>
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        {pulse.days.map((day, index) => {
          const height =
            day.units > 0 ? Math.max((day.units / maxUnits) * 100, 12) : 0;
          return (
            <div
              key={day.date}
              title={`${day.label} · ${day.units} un`}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span className="text-[9px] font-bold tabular-nums text-text-secondary">
                {day.units > 0 ? day.units : "—"}
              </span>
              <div className="flex h-14 w-full items-end overflow-hidden rounded-[4px] bg-surface-hover/60 sm:h-16">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "w-full rounded-[4px]",
                    day.isFocus
                      ? "bg-gradient-to-t from-brand-yellow to-[#FFEA70]"
                      : "bg-brand-yellow/40",
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
