"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Lock,
  Package,
  Rocket,
  Shield,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GhostButton,
  GradientButton,
  LabBackBar,
  OmniWordmark,
  PaginationDots,
} from "../_components/lab-ui";

const SLIDES = [
  {
    id: "welcome",
    title: (
      <>
        Seu sistema operacional
        <span className="mt-1 block omni-gradient-text">de negócios.</span>
      </>
    ),
    description:
      "Um sistema completo para você entender, controlar e fazer sua operação crescer.",
    body: "features",
  },
  {
    id: "connected",
    title: (
      <>
        Tudo conectado.
        <span className="mt-1 block omni-gradient-text">Em um só lugar.</span>
      </>
    ),
    description:
      "Operações, vendas, estoque, financeiro e clientes trabalhando juntos dentro de um único ecossistema.",
    body: "orbit",
  },
  {
    id: "decisions",
    title: (
      <>
        Transforme
        <span className="mt-1 block omni-gradient-text">dados em decisões.</span>
      </>
    ),
    description:
      "Tenha uma visão clara dos seus resultados e descubra o que está acontecendo na sua operação.",
    body: "dashboard",
  },
  {
    id: "control",
    title: (
      <>
        Mais controle.{" "}
        <span className="omni-gradient-text">Mais resultado.</span>
      </>
    ),
    description:
      "Acompanhe sua operação, identifique oportunidades e tome decisões melhores para crescer.",
    body: "performance",
  },
] as const;

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

const ORBIT = [
  { icon: ShoppingCart, label: "Vendas", angle: -90 },
  { icon: Wallet, label: "Financeiro", angle: -30 },
  { icon: Target, label: "Metas", angle: 30 },
  { icon: Briefcase, label: "Operações", angle: 90 },
  { icon: Users, label: "Clientes", angle: 150 },
  { icon: Package, label: "Estoque", angle: 210 },
];

export default function OnboardingLabPage() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden">
      <div className="omni-orb -right-20 -top-10 h-56 w-56 bg-[#7C3CFF]/35" />
      <div className="omni-orb -left-16 bottom-24 h-48 w-48 bg-[#0CD4FF]/20" />

      <LabBackBar />

      <header className="relative z-10 flex items-center justify-between px-5 pt-4">
        <OmniWordmark size={30} />
        <Link href="/lab/omni/login" className="text-sm text-[#A0A0B0] hover:text-white">
          Pular &gt;
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-8">
        <h1 className="text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-white">
          {slide.title}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#A0A0B0]">{slide.description}</p>

        <div
          key={slide.id}
          className="relative my-6 flex min-h-[280px] flex-1 items-center justify-center omni-fade-up"
        >
          {slide.body === "features" && <FeaturesGrid />}
          {slide.body === "orbit" && <OrbitGraphic />}
          {slide.body === "dashboard" && <DashboardPreview />}
          {slide.body === "performance" && <PerformancePreview />}
        </div>

        <PaginationDots total={SLIDES.length} active={index} className="mb-4" />

        {!isLast ? (
          <GradientButton onClick={() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))}>
            Próximo
            <ArrowRight className="h-4 w-4" />
          </GradientButton>
        ) : (
          <GradientButton href="/lab/omni/login">
            Fazer login
            <ArrowRight className="h-4 w-4" />
          </GradientButton>
        )}

        <GhostButton href="/lab/omni/login" className="mt-2.5">
          {isLast ? "Criar conta" : "Entrar"}
        </GhostButton>
      </main>

      {/* Decorative waves */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-60"
        viewBox="0 0 390 160"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 90 C 60 60, 120 120, 180 90 S 300 40, 390 80"
          stroke="url(#labWave)"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <path
          d="M0 110 C 80 80, 140 140, 220 110 S 320 70, 390 100"
          stroke="url(#labWave)"
          strokeWidth="1"
          opacity="0.45"
        />
        <defs>
          <linearGradient id="labWave" x1="0" y1="0" x2="390" y2="0">
            <stop stopColor="#7C3CFF" />
            <stop offset="1" stopColor="#0CD4FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function FeaturesGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {FEATURES.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="omni-glass rounded-2xl p-3.5">
            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl border border-[#7C3CFF]/35 bg-[#7C3CFF]/10">
              <Icon className="h-4 w-4 text-[#0CD4FF]" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-semibold text-white">{f.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#A0A0B0]">{f.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function OrbitGraphic() {
  const radius = 108;
  return (
    <div className="relative h-[260px] w-[260px]">
      <div className="absolute inset-6 rounded-full border border-dashed border-white/10" />
      <div className="absolute inset-0 rounded-full border border-white/5" />
      <div className="absolute left-1/2 top-1/2 z-10 flex h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-transparent omni-ring-glow"
        style={{
          background:
            "linear-gradient(#0B0D17,#0B0D17) padding-box, linear-gradient(135deg,#7C3CFF,#0CD4FF) border-box",
        }}
      >
        <p className="text-sm font-bold tracking-[0.12em]">OMNI</p>
        <p className="mt-0.5 max-w-[80px] text-center text-[7px] uppercase leading-tight tracking-wider text-[#A0A0B0]">
          Seu sistema operacional de negócios
        </p>
      </div>
      {ORBIT.map((node) => {
        const Icon = node.icon;
        const rad = (node.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={node.label}
            className="absolute left-1/2 top-1/2 flex w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7C3CFF]/40 bg-[#12141F]/90 shadow-[0_0_16px_rgba(124,60,255,0.25)]">
              <Icon className="h-4 w-4 text-[#0CD4FF]" strokeWidth={1.75} />
            </div>
            <span className="text-[10px] font-medium text-white/80">{node.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative w-full">
      <div className="omni-glass relative z-10 rounded-2xl p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Visão geral</p>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-[#A0A0B0]">
            Este mês ▾
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MiniKpi label="Faturamento" value="R$ 8.764" delta="+12,5%" good />
          <MiniKpi label="Vendas" value="142" delta="+8,2%" good />
          <MiniKpi label="Lucro" value="R$ 3.215" delta="+15,7%" good />
          <MiniKpi label="Despesas" value="R$ 1.842" delta="-4,3%" good={false} />
        </div>
        <div className="mt-3 grid grid-cols-[1.2fr_0.8fr] gap-2">
          <div className="rounded-xl border border-white/5 bg-black/20 p-2.5">
            <p className="mb-2 text-[10px] text-[#A0A0B0]">Evolução de vendas</p>
            <svg viewBox="0 0 120 48" className="h-12 w-full" aria-hidden>
              <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#7C3CFF" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#7C3CFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 40 L20 34 L40 36 L60 22 L80 26 L100 12 L120 8 L120 48 L0 48 Z" fill="url(#lineFill)" />
              <path d="M0 40 L20 34 L40 36 L60 22 L80 26 L100 12 L120 8" fill="none" stroke="#7C3CFF" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/20 p-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(#7C3CFF 0 62%, #3882F6 62% 100%)",
              }}
            >
              <div className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-[#0B0D17] text-[9px] font-bold">
                62%
              </div>
            </div>
            <p className="mt-1 text-[9px] text-[#A0A0B0]">Salgados</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-1 -top-3 z-20 max-w-[150px] rounded-xl border border-[#7C3CFF]/30 bg-[#1A1D2B]/95 p-2.5 shadow-xl">
        <div className="mb-1 flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-[#7C3CFF]" />
          <p className="text-[10px] font-semibold">Insights inteligentes</p>
        </div>
        <p className="text-[9px] leading-snug text-[#A0A0B0]">
          Destaques do que realmente importa na operação.
        </p>
      </div>

      <div className="absolute -bottom-3 left-2 right-2 z-20 flex items-center gap-2 rounded-xl border border-[#0CD4FF]/25 bg-[#1A1D2B]/95 px-3 py-2 shadow-xl">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#0CD4FF]" />
        <p className="text-[10px] leading-snug text-[#A0A0B0]">
          <span className="font-semibold text-white">Relatórios automáticos</span> · leitura visual clara
        </p>
        <BarChart3 className="ml-auto h-4 w-4 text-[#7C3CFF]" />
      </div>
    </div>
  );
}

function PerformancePreview() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-end justify-between px-2">
        {[
          { icon: Target, label: "Metas", color: "#7C3CFF" },
          { icon: BarChart3, label: "Análise", color: "#3882F6" },
          { icon: Rocket, label: "Crescimento", color: "#0CD4FF" },
        ].map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={n.label} className="flex flex-col items-center gap-1" style={{ marginBottom: i * 8 }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border"
                style={{ borderColor: `${n.color}66`, boxShadow: `0 0 16px ${n.color}55` }}
              >
                <Icon className="h-4 w-4" style={{ color: n.color }} />
              </div>
              <span className="text-[10px] text-white/80">{n.label}</span>
            </div>
          );
        })}
      </div>

      <div className="omni-glass rounded-2xl p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Desempenho da operação</p>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-[#A0A0B0]">
            Este mês ▾
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#A0A0B0]">Faturamento</p>
            <p className="text-lg font-bold">R$ 8.764,50</p>
            <p className="text-[11px] font-medium text-[#22C55E]">+ 12,5% vs mês anterior</p>
          </div>
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full"
            style={{ background: "conic-gradient(#7C3CFF 0 78%, #1F2430 78% 100%)" }}
          >
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#0B0D17] text-center">
              <span className="text-sm font-bold">78%</span>
              <span className="text-[7px] text-[#A0A0B0]">Meta</span>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
          <p className="text-[10px] font-semibold text-[#A0A0B0]">Principais oportunidades</p>
          {[
            "Aumentar vendas do produto mais vendido",
            "Reduzir estoque parado",
            "Reativar clientes inativos",
          ].map((t, i) => (
            <div key={t} className="flex items-start gap-2 text-[11px] text-white/85">
              <span
                className={cn(
                  "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  i === 0 && "bg-[#7C3CFF]",
                  i === 1 && "bg-[#3882F6]",
                  i === 2 && "bg-[#0CD4FF]",
                )}
              />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="omni-glass flex items-center gap-3 rounded-2xl px-3 py-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3CFF]/15">
          <Shield className="h-4 w-4 text-[#7C3CFF]" />
        </div>
        <p className="flex-1 text-[11px] leading-snug text-[#A0A0B0]">
          Segurança e confiabilidade. Dados protegidos com nível empresarial.
        </p>
        <Lock className="h-4 w-4 text-[#0CD4FF]" />
      </div>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  delta,
  good,
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/25 p-2">
      <p className="text-[9px] text-[#A0A0B0]">{label}</p>
      <p className="text-sm font-bold">{value}</p>
      <p className={cn("text-[10px] font-medium", good ? "text-[#22C55E]" : "text-[#EF4444]")}>
        {delta}
      </p>
    </div>
  );
}
