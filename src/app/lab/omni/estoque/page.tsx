"use client";

import { useMemo, useState } from "react";
import { LabAppShell, StatusPill } from "../_components/lab-app-shell";
import { LabFilterChips, LabKpi } from "../_components/lab-widgets";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

const STOCK = [
  { name: "Coxinha de Frango", qtd: 120, min: 40, status: "Bom", tone: "good" as const },
  { name: "Croissant", qtd: 48, min: 50, status: "Baixo", tone: "warn" as const },
  { name: "Brigadeiro Belga", qtd: 210, min: 80, status: "Bom", tone: "good" as const },
  { name: "Beijinho", qtd: 12, min: 40, status: "Crítico", tone: "critical" as const },
  { name: "Empada de Palmito", qtd: 75, min: 30, status: "Bom", tone: "good" as const },
  { name: "Kibe", qtd: 33, min: 40, status: "Atenção", tone: "warn" as const },
  { name: "Enroladinho", qtd: 90, min: 40, status: "Bom", tone: "good" as const },
  { name: "Prestígio", qtd: 18, min: 30, status: "Baixo", tone: "warn" as const },
];

export default function LabEstoquePage() {
  const [filter, setFilter] = useState("Todos");
  const filtered = useMemo(() => {
    if (filter === "Todos") return STOCK;
    if (filter === "Críticos") return STOCK.filter((s) => s.tone === "critical" || s.tone === "warn");
    return STOCK.filter((s) => s.tone === "good");
  }, [filter]);

  const critical = STOCK.filter((s) => s.tone === "critical").length;
  const ok = STOCK.filter((s) => s.tone === "good").length;

  return (
    <LabAppShell title="Estoque" actionLabel="+ Entrada">
      <div className="grid grid-cols-3 gap-3">
        <LabKpi label="SKUs" value={String(STOCK.length)} icon={Package} tone="purple" />
        <LabKpi label="Em dia" value={String(ok)} icon={CheckCircle2} tone="green" />
        <LabKpi label="Críticos" value={String(critical)} icon={AlertTriangle} tone="pink" down />
      </div>
      <LabFilterChips
        options={["Todos", "OK", "Críticos"]}
        value={filter}
        onChange={setFilter}
      />
      <div className="omni-glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr_0.8fr] gap-2 border-b border-white/5 px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-[#A0A0B0] sm:grid">
          <span>Produto</span>
          <span>Qtd</span>
          <span>Mínimo</span>
          <span>Cobertura</span>
          <span>Status</span>
        </div>
        {filtered.map((row) => {
          const coverage = Math.min(100, Math.round((row.qtd / Math.max(row.min, 1)) * 50));
          return (
            <div
              key={row.name}
              className="grid grid-cols-1 gap-2 border-b border-white/5 px-4 py-3.5 last:border-0 sm:grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr_0.8fr] sm:items-center"
            >
              <p className="font-medium text-white">{row.name}</p>
              <p className="text-sm">{row.qtd} un.</p>
              <p className="text-sm text-[#A0A0B0]">{row.min} un.</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full omni-gradient-bg"
                  style={{ width: `${coverage}%` }}
                />
              </div>
              <div>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </div>
            </div>
          );
        })}
      </div>
    </LabAppShell>
  );
}
