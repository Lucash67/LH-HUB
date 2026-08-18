"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LabAppShell } from "../_components/lab-app-shell";

const TABS = ["Resumo", "Receitas", "Despesas"] as const;

const BREAKDOWN = [
  { label: "Receitas", value: "R$ 8.764,50", pct: 62, color: "#7C3CFF" },
  { label: "Despesas", value: "R$ 1.842,35", pct: 13, color: "#EF4444" },
  { label: "Lucro", value: "R$ 3.215,20", pct: 25, color: "#0CD4FF" },
];

export default function LabFinanceiroPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumo");

  return (
    <LabAppShell title="Financeiro">
      <div className="flex rounded-xl border border-[#7C3CFF]/20 bg-[#12141F] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
              tab === t ? "omni-gradient-bg text-white" : "text-[#A0A0B0]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="omni-glass rounded-2xl p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: "conic-gradient(#7C3CFF 0 62%, #EF4444 62% 75%, #0CD4FF 75% 100%)",
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0B0D17] text-center">
              <p className="text-[10px] text-[#A0A0B0]">Faturamento</p>
              <p className="text-lg font-bold">R$ 8.764</p>
            </div>
          </div>
          <div className="w-full max-w-xs space-y-3">
            {BREAKDOWN.map((b) => (
              <div key={b.label} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                <span className="flex-1 text-[#A0A0B0]">{b.label}</span>
                <span className="font-semibold text-white">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tab !== "Resumo" && (
        <div className="omni-glass rounded-2xl p-4 text-sm text-[#A0A0B0]">
          Lista mock de {tab.toLowerCase()} — visual alinhado às prints, sem backend.
        </div>
      )}
    </LabAppShell>
  );
}
