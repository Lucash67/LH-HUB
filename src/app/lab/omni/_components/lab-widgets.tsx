"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function LabKpi({
  label,
  value,
  delta,
  icon: Icon,
  tone = "purple",
  down,
  delay = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "purple" | "blue" | "cyan" | "pink" | "green";
  down?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={cn("omni-glass omni-glass-hover omni-fade-up rounded-2xl p-3.5 sm:p-4", delay === 1 && "omni-fade-up-d1", delay === 2 && "omni-fade-up-d2", delay === 3 && "omni-fade-up-d3")}
    >
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#A0A0B0]">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            tone === "purple" && "bg-[#7C3CFF]/15 text-[#7C3CFF]",
            tone === "blue" && "bg-[#3882F6]/15 text-[#3882F6]",
            tone === "cyan" && "bg-[#0CD4FF]/15 text-[#0CD4FF]",
            tone === "pink" && "bg-pink-500/15 text-pink-400",
            tone === "green" && "bg-[#22C55E]/15 text-[#22C55E]",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
      {delta && (
        <p className={cn("mt-1 text-xs font-semibold", down ? "text-[#EF4444]" : "text-[#22C55E]")}>
          {delta}
        </p>
      )}
    </div>
  );
}

export function LabSectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#A0A0B0]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function LabFilterChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn("omni-chip", value === opt && "omni-chip-active")}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function AreaSpark({ id = "labSpark" }: { id?: string }) {
  return (
    <svg viewBox="0 0 360 160" className="h-40 w-full sm:h-48" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7C3CFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7C3CFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2="360" y1={20 + i * 35} y2={20 + i * 35} stroke="#ffffff10" />
      ))}
      <path
        d="M0 120 C 40 110, 70 100, 100 95 S 160 70, 200 75 S 260 40, 300 35 S 340 20, 360 18 L 360 160 L 0 160 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M0 120 C 40 110, 70 100, 100 95 S 160 70, 200 75 S 260 40, 300 35 S 340 20, 360 18"
        fill="none"
        stroke="#7C3CFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="360" cy="18" r="4" fill="#0CD4FF" className="omni-pulse-dot" />
    </svg>
  );
}

export function DonutChart({
  percent,
  label,
  size = 128,
  colors = ["#7C3CFF", "#3882F6"],
}: {
  percent: number;
  label: string;
  size?: number;
  colors?: [string, string] | string[];
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${colors[0]} 0 ${p}%, ${colors[1] ?? "#1F2430"} ${p}% 100%)`,
        boxShadow: `0 0 28px ${colors[0]}44`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full bg-[#0B0D17] text-center"
        style={{ width: size * 0.62, height: size * 0.62 }}
      >
        <span className="text-xl font-bold" style={{ fontSize: size * 0.16 }}>
          {p}%
        </span>
        <span className="text-[10px] text-[#A0A0B0]">{label}</span>
      </div>
    </div>
  );
}
