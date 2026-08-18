"use client";

import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";

const SALES = [
  { id: "#1042", client: "Ana Costa", product: "Coxinha x12", value: "R$ 72,00", method: "Pix", status: "Pago", tone: "good" as const },
  { id: "#1041", client: "Bruno Lima", product: "Croissant x4", value: "R$ 32,00", method: "Cartão", status: "Pago", tone: "good" as const },
  { id: "#1040", client: "Carla Dias", product: "Brigadeiro x20", value: "R$ 90,00", method: "Pix", status: "Pendente", tone: "warn" as const },
  { id: "#1039", client: "Diego Souza", product: "Kibe x8", value: "R$ 52,00", method: "Dinheiro", status: "Pago", tone: "good" as const },
  { id: "#1038", client: "Elena Prado", product: "Empada x6", value: "R$ 45,00", method: "Pix", status: "Pago", tone: "good" as const },
  { id: "#1037", client: "Felipe Nunes", product: "Beijinho x15", value: "R$ 60,00", method: "Cartão", status: "Cancelado", tone: "critical" as const },
];

export default function LabVendasPage() {
  return (
    <LabAppShell title="Vendas" actionLabel="+ Nova venda">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Hoje" value="R$ 486" />
        <Stat label="Pedidos" value="18" />
        <Stat label="Ticket" value="R$ 27" />
      </div>
      <SearchFilterBar placeholder="Buscar venda..." />
      <div className="omni-glass overflow-hidden rounded-2xl">
        {SALES.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#A0A0B0]">{s.id}</p>
              <p className="font-medium text-white">{s.client}</p>
              <p className="text-xs text-[#A0A0B0]">{s.product}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{s.value}</p>
              <p className="text-[11px] text-[#A0A0B0]">{s.method}</p>
            </div>
            <StatusPill tone={s.tone}>{s.status}</StatusPill>
          </div>
        ))}
      </div>
    </LabAppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="omni-glass rounded-2xl p-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-[#A0A0B0]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
