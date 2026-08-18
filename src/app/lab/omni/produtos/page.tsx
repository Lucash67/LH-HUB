"use client";

import { LabAppShell, SearchFilterBar, StatusPill } from "../_components/lab-app-shell";

const PRODUCTS = [
  { name: "Coxinha de Frango", cat: "Salgados", stock: "120 un.", price: "R$ 6,00", status: "Ativo", tone: "active" as const, emoji: "🥟" },
  { name: "Croissant", cat: "Salgados", stock: "48 un.", price: "R$ 8,00", status: "Baixo", tone: "warn" as const, emoji: "🥐" },
  { name: "Brigadeiro Belga", cat: "Doces", stock: "210 un.", price: "R$ 4,50", status: "Ativo", tone: "active" as const, emoji: "🍫" },
  { name: "Beijinho", cat: "Doces", stock: "12 un.", price: "R$ 4,00", status: "Crítico", tone: "critical" as const, emoji: "⚪" },
  { name: "Empada de Palmito", cat: "Salgados", stock: "75 un.", price: "R$ 7,50", status: "Ativo", tone: "active" as const, emoji: "🥧" },
  { name: "Kibe", cat: "Salgados", stock: "33 un.", price: "R$ 6,50", status: "Atenção", tone: "warn" as const, emoji: "🥙" },
];

export default function LabProdutosPage() {
  return (
    <LabAppShell title="Produtos" actionLabel="+ Novo produto">
      <SearchFilterBar placeholder="Buscar produto..." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((p) => (
          <article key={p.name} className="omni-glass flex gap-3 rounded-2xl p-4">
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
                <span className="text-[#A0A0B0]">{p.stock}</span>
                <span className="font-bold text-[#0CD4FF]">{p.price}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </LabAppShell>
  );
}
