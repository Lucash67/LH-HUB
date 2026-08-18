"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Rocket,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { LabBackBar, OmniWordmark, GradientButton } from "../_components/lab-ui";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Visão completa",
    text: "Todas as áreas do seu negócio em um só lugar.",
  },
  {
    icon: Target,
    title: "Mais controle",
    text: "Acompanhe métricas, resultados e indicadores em tempo real.",
  },
  {
    icon: Brain,
    title: "Inteligência",
    text: "Decisões melhores com dados e insights claros.",
  },
  {
    icon: Rocket,
    title: "Crescimento",
    text: "Organização e metas para você escalar a operação.",
  },
];

/**
 * Clone visual do login das referências.
 * Não autentica — só UI de lab. Produção continua em /login.
 */
export default function LabLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="omni-orb -right-24 top-10 h-72 w-72 bg-[#7C3CFF]/30" />
      <div className="omni-orb bottom-0 left-1/4 h-64 w-64 bg-[#0CD4FF]/15" />

      <LabBackBar />

      {/* Desktop split */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-49px)] max-w-6xl lg:grid-cols-2">
        {/* Left marketing — desktop */}
        <aside className="relative hidden flex-col justify-between px-10 py-10 lg:flex xl:px-14">
          <OmniWordmark size={40} />

          <div className="max-w-lg">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
              Seu sistema operacional
              <span className="mt-1 block omni-gradient-text">de negócios.</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[#A0A0B0]">
              Um sistema completo para você entender, controlar e fazer sua operação crescer.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-5 xl:grid-cols-4">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title}>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#7C3CFF]/40">
                      <Icon className="h-5 w-5 text-[#0CD4FF]" strokeWidth={1.75} />
                    </div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#A0A0B0]">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-[#A0A0B0]">
            <Shield className="h-3.5 w-3.5 text-[#7C3CFF]" />
            Seus dados estão protegidos com segurança de nível empresarial.
          </p>

          {/* Decorative ring */}
          <div
            className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full border-[10px] opacity-40"
            style={{
              borderImage: "linear-gradient(135deg,#7C3CFF,#0CD4FF) 1",
              borderColor: "transparent",
              background:
                "linear-gradient(#05050C,#05050C) padding-box, linear-gradient(135deg,#7C3CFF,#0CD4FF) border-box",
              borderStyle: "solid",
              borderWidth: 10,
              borderRadius: "9999px",
              maskImage: "linear-gradient(#000 0 0)",
            }}
            aria-hidden
          />
        </aside>

        {/* Form column */}
        <section className="flex flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/lab/omni/onboarding"
            className="mb-6 inline-flex w-fit items-center gap-1 text-sm text-[#A0A0B0] hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="omni-glass omni-fade-up mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
              <OmniWordmark size={34} showTagline className="mb-5 lg:hidden" />
              <OmniWordmark size={28} className="mb-5 hidden lg:flex" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C3CFF]">
                Bem-vindo de volta
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Faça login para continuar</h2>
              <p className="mt-1 text-xs text-[#A0A0B0]">
                Clone visual · não autentica · produção em{" "}
                <Link href="/login" className="text-[#0CD4FF] hover:underline">
                  /login
                </Link>
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#A0A0B0]">E-mail</span>
                <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D17] px-3 focus-within:border-[#7C3CFF]/50">
                  <Mail className="h-4 w-4 text-[#7C3CFF]" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#A0A0B0]">Senha</span>
                <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D17] px-3 focus-within:border-[#7C3CFF]/50">
                  <Lock className="h-4 w-4 text-[#7C3CFF]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-white/40 hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 text-xs">
                <label className="inline-flex items-center gap-2 text-[#A0A0B0]">
                  <input type="checkbox" className="rounded border-white/20 accent-[#7C3CFF]" />
                  Lembrar de mim
                </label>
                <button type="button" className="font-medium text-[#7C3CFF] hover:text-[#0CD4FF]">
                  Esqueci minha senha
                </button>
              </div>

              <GradientButton type="submit" href="/lab/omni/dashboard">
                Entrar
              </GradientButton>
            </form>

            <div className="my-5 flex items-center gap-3 text-[11px] text-[#A0A0B0]">
              <span className="h-px flex-1 bg-white/10" />
              ou continue com
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <SocialBtn label="Google" />
              <SocialBtn label="Microsoft" />
            </div>

            <p className="mt-5 text-center text-xs text-[#A0A0B0]">
              Ainda não tem uma conta?{" "}
              <button type="button" className="font-semibold text-[#7C3CFF]">
                Criar conta
              </button>
            </p>
          </div>

          <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-[11px] text-[#A0A0B0]">
            <Shield className="h-3.5 w-3.5 text-[#7C3CFF]" />
            Seus dados estão protegidos com segurança de nível empresarial.
          </p>
        </section>
      </div>
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B0D17] text-sm font-medium text-white/85 transition hover:border-[#7C3CFF]/35"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
        {label[0]}
      </span>
      {label}
    </button>
  );
}
