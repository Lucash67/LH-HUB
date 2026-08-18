"use client";

import { useState } from "react";
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
import { OmniWordmark } from "../_components/lab-ui";

const GROUPS = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Perfil", hint: "Lucas Henrique", toggle: false },
      { icon: Lock, label: "Segurança", hint: "Senha e sessões", toggle: false },
      { icon: CreditCard, label: "Plano", hint: "Pro Plan", toggle: false },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: Moon, label: "Aparência", hint: "Tema OMNI", toggle: false },
      { icon: Bell, label: "Notificações", hint: "Push e e-mail", toggle: true },
      { icon: Shield, label: "Privacidade", hint: "Dados e permissões", toggle: false },
    ],
  },
  {
    title: "Geral",
    items: [
      { icon: User, label: "Operações ativas", hint: "Salgados · Brigadeiros", toggle: false },
      { icon: Shield, label: "Backup", hint: "Exportar dados", toggle: false },
    ],
  },
];

export default function LabConfiguracoesPage() {
  const [notifs, setNotifs] = useState(true);

  return (
    <LabAppShell title="Configurações">
      <div className="omni-glass omni-fade-up flex items-center gap-4 rounded-2xl p-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold"
          style={{
            background:
              "linear-gradient(#12141F,#12141F) padding-box, linear-gradient(135deg,#7C3CFF,#0CD4FF) border-box",
            border: "2px solid transparent",
          }}
        >
          LH
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">Lucas Henrique</p>
          <p className="text-xs text-[#A0A0B0]">lucas@omni.business · Pro Plan</p>
          <div className="mt-2">
            <OmniWordmark size={18} />
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-[#0CD4FF] hover:border-[#7C3CFF]/40"
        >
          Editar
        </button>
      </div>

      <div className="space-y-5">
        {GROUPS.map((group, gi) => (
          <section key={group.title} className={gi === 0 ? "omni-fade-up omni-fade-up-d1" : ""}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">
              {group.title}
            </h2>
            <div className="omni-glass overflow-hidden rounded-2xl">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isNotif = item.label === "Notificações";
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (isNotif) setNotifs((v) => !v);
                    }}
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left last:border-0 hover:bg-white/[0.03]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#A0A0B0]">{item.hint}</p>
                    </div>
                    {item.toggle ? (
                      <span
                        className={
                          notifs
                            ? "relative h-6 w-11 rounded-full omni-gradient-bg"
                            : "relative h-6 w-11 rounded-full bg-white/15"
                        }
                      >
                        <span
                          className={
                            notifs
                              ? "absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow"
                              : "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white/70 shadow"
                          }
                        />
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#A0A0B0]" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="px-1 text-center text-[11px] text-[#A0A0B0]">
        Lab visual · alterações não salvam · produção em /configuracoes
      </p>
    </LabAppShell>
  );
}
