import Link from "next/link";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  LogIn,
  Package,
  Settings,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { LabBadge, OmniWordmark } from "./_components/lab-ui";

const ENTRY = [
  {
    href: "/lab/omni/onboarding",
    title: "Onboarding",
    description: "4 telas mobile das prints.",
    icon: Smartphone,
  },
  {
    href: "/lab/omni/login",
    title: "Login",
    description: "Clone visual (não autentica).",
    icon: LogIn,
  },
];

const MODULES = [
  { href: "/lab/omni/dashboard", title: "Dashboard", icon: LayoutDashboard },
  { href: "/lab/omni/operacoes", title: "Operações", icon: Package },
  { href: "/lab/omni/produtos", title: "Produtos", icon: ShoppingCart },
  { href: "/lab/omni/vendas", title: "Vendas", icon: TrendingUp },
  { href: "/lab/omni/financeiro", title: "Financeiro", icon: Wallet },
  { href: "/lab/omni/clientes", title: "Clientes", icon: Users },
  { href: "/lab/omni/estoque", title: "Estoque", icon: Warehouse },
  { href: "/lab/omni/metas", title: "Metas", icon: Target },
  { href: "/lab/omni/relatorios", title: "Relatórios", icon: FileText },
  { href: "/lab/omni/configuracoes", title: "Configurações", icon: Settings },
];

export default function OmniLabHubPage() {
  return (
    <div className="relative mx-auto min-h-screen max-w-4xl px-5 py-10">
      <div className="omni-orb -right-10 top-0 h-56 w-56 bg-[#7C3CFF]/30" />
      <div className="omni-orb bottom-20 -left-10 h-48 w-48 bg-[#0CD4FF]/15" />

      <div className="relative z-10 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <OmniWordmark size={36} />
            <LabBadge />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Design Lab <span className="omni-gradient-text">OMNI</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#A0A0B0]">
            Ambiente de teste para clonar as referências visuais sem afetar a produção. Auth real
            em{" "}
            <Link href="/login" className="text-[#0CD4FF] hover:underline">
              /login
            </Link>
            · produto em{" "}
            <Link href="/" className="text-[#0CD4FF] hover:underline">
              /
            </Link>
            .
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">
            Entrada
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ENTRY.map((screen) => {
              const Icon = screen.icon;
              return (
                <Link
                  key={screen.href}
                  href={screen.href}
                  className="omni-glass group flex items-start gap-3 rounded-2xl p-4 transition hover:border-[#7C3CFF]/45"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{screen.title}</p>
                    <p className="mt-1 text-xs text-[#A0A0B0]">{screen.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-[#0CD4FF] opacity-70 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">
            Módulos (mock)
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="omni-glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition hover:border-[#7C3CFF]/45"
                >
                  <Icon className="h-5 w-5 text-[#7C3CFF]" />
                  <span className="text-xs font-semibold text-white">{m.title}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="omni-glass rounded-2xl p-4 text-sm text-[#A0A0B0]">
          <p className="mb-2 flex items-center gap-2 font-semibold text-white">
            <Sparkles className="h-4 w-4 text-[#7C3CFF]" />
            Regras deste lab
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed">
            <li>Não grava no banco e não altera fluxos de produção.</li>
            <li>Navegação lateral funciona entre todos os módulos mock.</li>
            <li>Branch: <code className="text-[#0CD4FF]">feat/omni-design-lab</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
