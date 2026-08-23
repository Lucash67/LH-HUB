"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, LayoutGrid, Sparkles } from "lucide-react";
import { LhHoldingLogo } from "@/components/hub/lh-hub-logo";
import { useSessionUser } from "@/hooks/use-session-user";
import { OMNI_HUB_PATH } from "@/constants/omni-products";
import {
  isOmniOnboardingDone,
  markOmniOnboardingDone,
  resolveOnboardingUserKey,
} from "@/lib/omni-onboarding";
import { PageLoader } from "@/components/ui/loading";

const STEPS = [
  {
    title: "Uma conta OMNI",
    body: "Você entra no ecossistema — não em um único sistema isolado.",
  },
  {
    title: "Escolha o produto",
    body: "No Hub você decide: Business para gestão, Schedule para agenda.",
  },
  {
    title: "Troque quando quiser",
    body: "Volte ao Hub a qualquer momento e abra outro produto da família OMNI.",
  },
] as const;

export function OmniOnboarding() {
  const router = useRouter();
  const { data: user, isFetched } = useSessionUser();
  const [ready, setReady] = useState(false);
  const userKey = resolveOnboardingUserKey(user);

  useEffect(() => {
    if (!isFetched) return;
    if (userKey && isOmniOnboardingDone(userKey)) {
      router.replace(OMNI_HUB_PATH);
      return;
    }
    setReady(true);
  }, [isFetched, userKey, router]);

  function continueToHub() {
    markOmniOnboardingDone(userKey);
    router.push(OMNI_HUB_PATH);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05060c]">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060c] text-[#F5F6FA]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,60,255,0.22),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(12,212,255,0.12),_transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:px-6 sm:py-12">
        <LhHoldingLogo height={48} className="max-w-[180px]" />

        <div className="mt-10 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7C3CFF]">
            Boas-vindas
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Você está entrando na OMNI
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3] sm:text-[15px]">
            Um ecossistema de produtos para o seu negócio. Primeiro conheça o caminho —
            depois escolha onde continuar.
          </p>

          <ul className="mt-8 space-y-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-sm font-bold text-[#C4B5FD]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#A3A3A3]">{step.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7C3CFF]/25 bg-[#7C3CFF]/10 px-3 py-1 text-[11px] font-medium text-[#C4B5FD]">
              <LayoutGrid className="h-3 w-3" />
              Hub
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7C3CFF]/25 bg-[#7C3CFF]/10 px-3 py-1 text-[11px] font-medium text-[#C4B5FD]">
              <Sparkles className="h-3 w-3" />
              Business
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0CD4FF]/25 bg-[#0CD4FF]/10 px-3 py-1 text-[11px] font-medium text-[#67E8F9]">
              <CalendarDays className="h-3 w-3" />
              Schedule
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={continueToHub}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3CFF] to-[#3882F6] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(124,60,255,0.35)] transition hover:brightness-110"
        >
          Continuar para o Hub
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default OmniOnboarding;
