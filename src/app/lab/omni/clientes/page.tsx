"use client";

import { useMemo, useState } from "react";
import { LabAppShell } from "../_components/lab-app-shell";
import { LabFilterChips } from "../_components/lab-widgets";

const CLIENTS = [
  { name: "Ana Costa", phone: "(11) 98888-1001", orders: 28, total: "R$ 1.240", initials: "AC", color: "#7C3CFF", tag: "VIP" },
  { name: "Bruno Lima", phone: "(11) 97777-2202", orders: 19, total: "R$ 860", initials: "BL", color: "#3882F6", tag: "Frequente" },
  { name: "Carla Dias", phone: "(11) 96666-3303", orders: 41, total: "R$ 2.150", initials: "CD", color: "#0CD4FF", tag: "VIP" },
  { name: "Diego Souza", phone: "(11) 95555-4404", orders: 7, total: "R$ 310", initials: "DS", color: "#A855F7", tag: "Novo" },
  { name: "Elena Prado", phone: "(11) 94444-5505", orders: 33, total: "R$ 1.780", initials: "EP", color: "#22C55E", tag: "Frequente" },
  { name: "Felipe Nunes", phone: "(11) 93333-6606", orders: 12, total: "R$ 540", initials: "FN", color: "#F59E0B", tag: "Inativo" },
  { name: "Giulia Rocha", phone: "(11) 92222-7707", orders: 5, total: "R$ 210", initials: "GR", color: "#EC4899", tag: "Novo" },
  { name: "Hugo Martins", phone: "(11) 91111-8808", orders: 22, total: "R$ 990", initials: "HM", color: "#06B6D4", tag: "Frequente" },
];

export default function LabClientesPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("Todos");

  const filtered = useMemo(() => {
    return CLIENTS.filter((c) => {
      if (tag !== "Todos" && c.tag !== tag) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.phone.includes(s);
    });
  }, [q, tag]);

  return (
    <LabAppShell title="Clientes" actionLabel="+ Novo cliente">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar cliente..."
        className="omni-field"
      />
      <LabFilterChips
        options={["Todos", "VIP", "Frequente", "Novo", "Inativo"]}
        value={tag}
        onChange={setTag}
      />
      <div className="omni-glass overflow-hidden rounded-2xl">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#A0A0B0]">Nenhum cliente neste filtro.</p>
        ) : (
          filtered.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-0 transition hover:bg-white/[0.03]"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: `${c.color}33`, color: c.color }}
              >
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-white">{c.name}</p>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#A0A0B0]">
                    {c.tag}
                  </span>
                </div>
                <p className="text-xs text-[#A0A0B0]">{c.phone}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-white">{c.orders} pedidos</p>
                <p className="text-[#0CD4FF]">{c.total}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </LabAppShell>
  );
}
