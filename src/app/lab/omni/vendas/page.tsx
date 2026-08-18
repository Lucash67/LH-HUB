"use client";

import { useMemo, useState } from "react";
import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";
import { LabFilterChips, LabKpi } from "../_components/lab-widgets";
import { ShoppingCart } from "lucide-react";

const SALES = [
  { id: "#1042", time: "09:12", client: "Ana Costa", product: "Coxinha x12", value: "R$ 72,00", method: "Pix", status: "Pago", tone: "good" as const },
  { id: "#1041", time: "09:40", client: "Bruno Lima", product: "Croissant x4", value: "R$ 32,00", method: "Cartão", status: "Pago", tone: "good" as const },
  { id: "#1040", time: "10:05", client: "Carla Dias", product: "Brigadeiro x20", value: "R$ 90,00", method: "Pix", status: "Pendente", tone: "warn" as const },
  { id: "#1039", time: "11:20", client: "Diego Souza", product: "Kibe x8", value: "R$ 52,00", method: "Dinheiro", status: "Pago", tone: "good" as const },
  { id: "#1038", time: "14:15", client: "Elena Prado", product: "Empada x6", value: "R$ 45,00", method: "Pix", status: "Pago", tone: "good" as const },
  { id: "#1037", time: "15:02", client: "Felipe Nunes", product: "Beijinho x15", value: "R$ 60,00", method: "Cartão", status: "Cancelado", tone: "critical" as const },
  { id: "#1036", time: "16:30", client: "Ana Costa", product: "Enroladinho x10", value: "R$ 55,00", method: "Pix", status: "Pago", tone: "good" as const },
];

export default function LabVendasPage() {
  const [filter, setFilter] = useState("Todas");
  const filtered = useMemo(() => {
    if (filter === "Todas") return SALES;
    if (filter === "Pagas") return SALES.filter((s) => s.status === "Pago");
    if (filter === "Pendentes") return SALES.filter((s) => s.status === "Pendente");
    return SALES.filter((s) => s.status === "Cancelado");
  }, [filter]);

  return (
    <LabAppShell title="Vendas" actionLabel="+ Nova venda">
      <div className="grid grid-cols-3 gap-3">
        <LabKpi label="Hoje" value="R$ 486" icon={ShoppingCart} tone="purple" />
        <LabKpi label="Pedidos" value="18" icon={ShoppingCart} tone="blue" />
        <LabKpi label="Ticket" value="R$ 27" icon={ShoppingCart} tone="cyan" />
      </div>
      <SearchFilterBar placeholder="Buscar venda, cliente..." />
      <LabFilterChips
        options={["Todas", "Pagas", "Pendentes", "Canceladas"]}
        value={filter}
        onChange={setFilter}
      />
      <div className="omni-glass overflow-hidden rounded-2xl">
        {filtered.map((s, i) => (
          <div
            key={s.id}
            className="relative flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-0"
          >
            <div className="absolute left-0 top-0 h-full w-0.5 omni-gradient-bg opacity-40" style={{ opacity: i === 0 ? 1 : 0.25 }} />
            <div className="min-w-[3.5rem] text-xs font-medium text-[#0CD4FF]">{s.time}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#A0A0B0]">{s.id}</p>
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
