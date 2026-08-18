"use client";

import {
  Bell,
  ChevronRight,
  CreditCard,
  Lock,
  Moon,
  Shield,
  User,
} from "lucide-react";
import { LabAppShell } from "../_components/lab-app-shell";

const GROUPS = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Perfil", hint: "Lucas Henrique" },
      { icon: Lock, label: "Segurança", hint: "Senha e sessões" },
      { icon: CreditCard, label: "Plano", hint: "Pro Plan" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: Moon, label: "Aparência", hint: "Tema OMNI" },
      { icon: Bell, label: "Notificações", hint: "Push e e-mail" },
      { icon: Shield, label: "Privacidade", hint: "Dados e permissões" },
    ],
  },
  {
    title: "Geral",
    items: [
      { icon: User, label: "Operações ativas", hint: "Salgados · Brigadeiros" },
      { icon: Shield, label: "Backup", hint: "Exportar dados" },
    ],
  },
];

export default function LabConfiguracoesPage() {
  return (
    <LabAppShell title="Configurações">
      <div className="space-y-5">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">
              {group.title}
            </h2>
            <div className="omni-glass overflow-hidden rounded-2xl">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left last:border-0 hover:bg-white/[0.03]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#A0A0B0]">{item.hint}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#A0A0B0]" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </LabAppShell>
  );
}
