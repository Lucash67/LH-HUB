"use client";

import { LabAppShell, SearchFilterBar } from "../_components/lab-app-shell";

const CLIENTS = [
  { name: "Ana Costa", phone: "(11) 98888-1001", orders: 28, total: "R$ 1.240", initials: "AC", color: "#7C3CFF" },
  { name: "Bruno Lima", phone: "(11) 97777-2202", orders: 19, total: "R$ 860", initials: "BL", color: "#3882F6" },
  { name: "Carla Dias", phone: "(11) 96666-3303", orders: 41, total: "R$ 2.150", initials: "CD", color: "#0CD4FF" },
  { name: "Diego Souza", phone: "(11) 95555-4404", orders: 7, total: "R$ 310", initials: "DS", color: "#A855F7" },
  { name: "Elena Prado", phone: "(11) 94444-5505", orders: 33, total: "R$ 1.780", initials: "EP", color: "#22C55E" },
  { name: "Felipe Nunes", phone: "(11) 93333-6606", orders: 12, total: "R$ 540", initials: "FN", color: "#F59E0B" },
];

export default function LabClientesPage() {
  return (
    <LabAppShell title="Clientes" actionLabel="+ Novo cliente">
      <SearchFilterBar placeholder="Buscar cliente..." />
      <div className="omni-glass overflow-hidden rounded-2xl">
        {CLIENTS.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: `${c.color}33`, color: c.color }}
            >
              {c.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{c.name}</p>
              <p className="text-xs text-[#A0A0B0]">{c.phone}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-semibold text-white">{c.orders} pedidos</p>
              <p className="text-[#0CD4FF]">{c.total}</p>
            </div>
          </div>
        ))}
      </div>
    </LabAppShell>
  );
}
