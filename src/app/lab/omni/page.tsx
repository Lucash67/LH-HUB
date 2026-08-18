import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { LabBadge, OmniWordmark } from "./_components/lab-ui";

const SCREENS = [
  {
    href: "/lab/omni/onboarding",
    title: "Onboarding",
    description: "4 telas mobile: welcome, órbita, dados → decisões, desempenho.",
    icon: Smartphone,
  },
  {
    href: "/lab/omni/login",
    title: "Login",
    description: "Clone desktop split + card mobile das prints (sem autenticar).",
    icon: LogIn,
  },
  {
    href: "/lab/omni/dashboard",
    title: "Dashboard",
    description: "KPIs, gráficos e sidebar no estilo das referências (dados mock).",
    icon: LayoutDashboard,
  },
];

/**
 * Hub do Design Lab OMNI.
 * Isolado da produção — não aparece no menu do produto.
 */
export default function OmniLabHubPage() {
  return (
    <div className="relative mx-auto min-h-screen max-w-3xl px-5 py-10">
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
            Ambiente de teste para clonar as referências visuais sem afetar a operação em
            produção. Dados aqui são mock. Auth real continua em{" "}
            <Link href="/login" className="text-[#0CD4FF] hover:underline">
              /login
            </Link>
            . Produto diário em{" "}
            <Link href="/" className="text-[#0CD4FF] hover:underline">
              /
            </Link>
            .
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {SCREENS.map((screen) => {
            const Icon = screen.icon;
            return (
              <Link
                key={screen.href}
                href={screen.href}
                className="omni-glass group flex flex-col rounded-2xl p-4 transition hover:border-[#7C3CFF]/45"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-white">{screen.title}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-[#A0A0B0]">
                  {screen.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0CD4FF] group-hover:gap-1.5">
                  Abrir <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="omni-glass rounded-2xl p-4 text-sm text-[#A0A0B0]">
          <p className="mb-2 flex items-center gap-2 font-semibold text-white">
            <Sparkles className="h-4 w-4 text-[#7C3CFF]" />
            Regras deste lab
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed">
            <li>Não grava no banco e não altera fluxos de produção.</li>
            <li>Botões sociais / criar conta são só visual (como nas prints).</li>
            <li>KPIs e gráficos usam números das referências, não da operação real.</li>
            <li>
              Branch: <code className="text-[#0CD4FF]">feat/omni-design-lab</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
