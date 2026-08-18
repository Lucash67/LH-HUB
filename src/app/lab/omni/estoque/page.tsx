"use client";

import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";

const STOCK = [
  { name: "Coxinha de Frango", qtd: 120, min: 40, status: "Bom", tone: "good" as const },
  { name: "Croissant", qtd: 48, min: 50, status: "Baixo", tone: "warn" as const },
  { name: "Brigadeiro Belga", qtd: 210, min: 80, status: "Bom", tone: "good" as const },
  { name: "Beijinho", qtd: 12, min: 40, status: "Crítico", tone: "critical" as const },
  { name: "Empada de Palmito", qtd: 75, min: 30, status: "Bom", tone: "good" as const },
  { name: "Kibe", qtd: 33, min: 40, status: "Atenção", tone: "warn" as const },
];

export default function LabEstoquePage() {
  return (
    <LabAppShell title="Estoque" actionLabel="+ Entrada">
      <SearchFilterBar placeholder="Buscar no estoque..." />
      <div className="omni-glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr] gap-2 border-b border-white/5 px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-[#A0A0B0] sm:grid">
          <span>Produto</span>
          <span>Qtd</span>
          <span>Mínimo</span>
          <span>Status</span>
        </div>
        {STOCK.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-1 gap-2 border-b border-white/5 px-4 py-3 last:border-0 sm:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr] sm:items-center"
          >
            <p className="font-medium text-white">{row.name}</p>
            <p className="text-sm text-[#A0A0B0] sm:text-white">
              <span className="sm:hidden">Qtd · </span>
              {row.qtd} un.
            </p>
            <p className="text-sm text-[#A0A0B0]">
              <span className="sm:hidden">Mín · </span>
              {row.min} un.
            </p>
            <div>
              <StatusPill tone={row.tone}>{row.status}</StatusPill>
            </div>
          </div>
        ))}
      </div>
    </LabAppShell>
  );
}
