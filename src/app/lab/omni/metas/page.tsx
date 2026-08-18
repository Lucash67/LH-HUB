"use client";

import { LabAppShell } from "../_components/lab-app-shell";

const BARS = [
  { label: "Vendas", value: 72, text: "72%" },
  { label: "Novos clientes", value: 54, text: "54%" },
  { label: "Ticket médio", value: 81, text: "81%" },
];

export default function LabMetasPage() {
  return (
    <LabAppShell title="Metas">
      <div className="omni-glass rounded-2xl p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#A0A0B0]">Meta de faturamento · este mês</p>
            <p className="mt-1 text-2xl font-bold">R$ 8.764 / R$ 11.200</p>
            <p className="mt-1 text-sm font-semibold text-[#22C55E]">+12,5% vs mês anterior</p>
          </div>
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full"
            style={{ background: "conic-gradient(#7C3CFF 0 78%, #1F2430 78% 100%)" }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#0B0D17] text-center">
              <span className="text-3xl font-bold">78%</span>
              <span className="text-[10px] text-[#A0A0B0]">Meta atingida</span>
            </div>
          </div>
        </div>
      </div>

      <div className="omni-glass space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Outras metas</h2>
        {BARS.map((b) => (
          <div key={b.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-[#A0A0B0]">{b.label}</span>
              <span className="font-semibold text-white">{b.text}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full omni-gradient-bg" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </LabAppShell>
  );
}
