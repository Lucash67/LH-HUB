"use client";

import { LabAppShell, StatusPill } from "../_components/lab-app-shell";
import { LabKpi } from "../_components/lab-widgets";
import { Package, TrendingUp, Users } from "lucide-react";

const OPS = [
  {
    name: "Salgados",
    local: "Centro · operação principal",
    fat: "R$ 5.420",
    un: "1.240",
    lucro: "R$ 2.110",
    margem: "38,9%",
    status: "Bom",
    tone: "good" as const,
    progress: 78,
  },
  {
    name: "Brigadeiros",
    local: "Zona Sul · doces",
    fat: "R$ 3.344",
    un: "860",
    lucro: "R$ 1.105",
    margem: "33,0%",
    status: "Atenção",
    tone: "warn" as const,
    progress: 54,
  },
  {
    name: "Eventos",
    local: "Sob demanda",
    fat: "R$ 980",
    un: "210",
    lucro: "R$ 410",
    margem: "41,8%",
    status: "Bom",
    tone: "good" as const,
    progress: 62,
  },
];

export default function LabOperacoesPage() {
  return (
    <LabAppShell title="Operações" actionLabel="+ Nova operação">
      <div className="grid grid-cols-3 gap-3">
        <LabKpi label="Ativas" value="3" icon={Package} tone="purple" />
        <LabKpi label="Fat. total" value="R$ 9,7k" icon={TrendingUp} tone="cyan" />
        <LabKpi label="Clientes" value="186" icon={Users} tone="blue" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {OPS.map((op) => (
          <article key={op.name} className="omni-glass omni-glass-hover rounded-2xl p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-white">{op.name}</h2>
                <p className="text-xs text-[#A0A0B0]">{op.local}</p>
              </div>
              <StatusPill tone={op.tone}>{op.status}</StatusPill>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Metric label="Faturamento" value={op.fat} />
              <Metric label="Unidades" value={op.un} />
              <Metric label="Lucro" value={op.lucro} accent />
              <Metric label="Margem" value={op.margem} />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] text-[#A0A0B0]">
                <span>Meta do mês</span>
                <span>{op.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full omni-gradient-bg"
                  style={{ width: `${op.progress}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </LabAppShell>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[#A0A0B0]">{label}</p>
      <p className={accent ? "font-semibold text-[#22C55E]" : "font-semibold"}>{value}</p>
    </div>
  );
}
