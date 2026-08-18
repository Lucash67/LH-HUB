"use client";

import { useMemo, useState } from "react";
import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";
import { LabFilterChips } from "../_components/lab-widgets";

const PRODUCTS = [
  { name: "Coxinha de Frango", cat: "Salgados", stock: 120, price: "R$ 6,00", status: "Ativo", tone: "active" as const, emoji: "🥟" },
  { name: "Croissant", cat: "Salgados", stock: 48, price: "R$ 8,00", status: "Baixo", tone: "warn" as const, emoji: "🥐" },
  { name: "Brigadeiro Belga", cat: "Doces", stock: 210, price: "R$ 4,50", status: "Ativo", tone: "active" as const, emoji: "🍫" },
  { name: "Beijinho", cat: "Doces", stock: 12, price: "R$ 4,00", status: "Crítico", tone: "critical" as const, emoji: "⚪" },
  { name: "Empada de Palmito", cat: "Salgados", stock: 75, price: "R$ 7,50", status: "Ativo", tone: "active" as const, emoji: "🥧" },
  { name: "Kibe", cat: "Salgados", stock: 33, price: "R$ 6,50", status: "Atenção", tone: "warn" as const, emoji: "🥙" },
  { name: "Enroladinho", cat: "Salgados", stock: 90, price: "R$ 5,50", status: "Ativo", tone: "active" as const, emoji: "🌀" },
  { name: "Prestígio", cat: "Doces", stock: 64, price: "R$ 5,00", status: "Ativo", tone: "active" as const, emoji: "🥥" },
];

export default function LabProdutosPage() {
  const [cat, setCat] = useState("Todos");
  const [selected, setSelected] = useState<(typeof PRODUCTS)[number] | null>(null);

  const filtered = useMemo(
    () => (cat === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat)),
    [cat],
  );

  return (
    <LabAppShell title="Produtos" actionLabel="+ Novo produto">
      <SearchFilterBar placeholder="Buscar produto..." />
      <LabFilterChips options={["Todos", "Salgados", "Doces"]} value={cat} onChange={setCat} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setSelected(p)}
            className="omni-glass omni-glass-hover flex gap-3 rounded-2xl p-4 text-left"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7C3CFF]/10 text-2xl">
              {p.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{p.name}</h2>
                  <p className="text-xs text-[#A0A0B0]">{p.cat}</p>
                </div>
                <StatusPill tone={p.tone}>{p.status}</StatusPill>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#A0A0B0]">{p.stock} un.</span>
                <span className="font-bold text-[#0CD4FF]">{p.price}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="omni-glass w-full max-w-md rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C3CFF]/15 text-3xl">
                {selected.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selected.name}</h3>
                <p className="text-xs text-[#A0A0B0]">{selected.cat}</p>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] text-[#A0A0B0]">Preço</p>
                <p className="font-bold text-[#0CD4FF]">{selected.price}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] text-[#A0A0B0]">Estoque</p>
                <p className="font-bold">{selected.stock}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] text-[#A0A0B0]">Status</p>
                <StatusPill tone={selected.tone}>{selected.status}</StatusPill>
              </div>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-[#A0A0B0]">
              Detalhe visual do lab — sem CRUD. Na produção, este produto viria do banco.
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="omni-gradient-bg w-full rounded-2xl py-3 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </LabAppShell>
  );
}
