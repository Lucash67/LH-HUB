"use client";

import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";

const OPS = [
  { name: "Salgados", local: "Centro", fat: "R$ 5.420", un: "1.240", lucro: "R$ 2.110", status: "Bom", tone: "good" as const },
  { name: "Brigadeiros", local: "Zona Sul", fat: "R$ 3.344", un: "860", lucro: "R$ 1.105", status: "Atenção", tone: "warn" as const },
  { name: "Eventos", local: "Sob demanda", fat: "R$ 980", un: "210", lucro: "R$ 410", status: "Bom", tone: "good" as const },
];

export default function LabOperacoesPage() {
  return (
    <LabAppShell title="Operações" actionLabel="+ Nova operação">
      <SearchFilterBar placeholder="Buscar operação..." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {OPS.map((op) => (
          <article key={op.name} className="omni-glass rounded-2xl p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-white">{op.name}</h2>
                <p className="text-xs text-[#A0A0B0]">{op.local}</p>
              </div>
              <StatusPill tone={op.tone}>{op.status}</StatusPill>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Metric label="Faturamento" value={op.fat} />
              <Metric label="Unidades" value={op.un} />
              <Metric label="Lucro" value={op.lucro} accent />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full omni-gradient-bg"
                style={{ width: op.tone === "good" ? "78%" : "54%" }}
              />
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
