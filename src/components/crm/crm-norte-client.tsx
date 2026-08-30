"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Check,
  Compass,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { CRM_TEMPERATURE_META, type CrmTemperature } from "@/constants/crm-brand";
import type { NorteItem, NortePlan } from "@/lib/crm/norte-playbook";
import { cn } from "@/lib/utils";

const CHANNEL_LABEL = {
  whatsapp: "WhatsApp",
  presencial: "Presencial",
  aguardar: "Esperar",
  carinho: "Carinho",
} as const;

function formatBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TempBadge({ temperature }: { temperature: CrmTemperature }) {
  const meta = CRM_TEMPERATURE_META[temperature];
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.badge,
      )}
    >
      {meta.label}
    </span>
  );
}

function ActionCard({
  item,
  featured,
  onDone,
  busy,
}: {
  item: NorteItem;
  featured?: boolean;
  onDone: (dealId: string) => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const meta = CRM_TEMPERATURE_META[item.temperature];

  async function copyMessage() {
    if (!item.message) return;
    await navigator.clipboard.writeText(item.message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        featured ? cn("shadow-[0_0_28px_rgba(16,185,129,0.12)]", meta.card) : "border-white/10 bg-[#1a1c24]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            {item.when} · {CHANNEL_LABEL[item.channel]} · {item.minutes || 0} min
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-white">
            {item.nickname}
            {item.company ? (
              <span className="ml-2 text-sm font-medium text-[#A0A0A0]">{item.company}</span>
            ) : null}
          </h3>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            {item.stageLabel} · {formatBrl(item.value)}
          </p>
        </div>
        <TempBadge temperature={item.temperature} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#E8E8E8]">{item.why}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">
        <span className="font-semibold text-white">Como: </span>
        {item.how}
      </p>

      {item.message ? (
        <blockquote className="mt-3 rounded-xl border border-white/10 bg-[#0b0c14]/70 px-3 py-2.5 text-sm leading-relaxed text-[#F5F6FA]">
          {item.message}
        </blockquote>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.waLink ? (
          <a
            href={item.waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Abrir WhatsApp
          </a>
        ) : null}
        {item.message ? (
          <button
            type="button"
            onClick={() => void copyMessage()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#F5F6FA] hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar texto"}
          </button>
        ) : null}
        {item.bucket !== "hold" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDone(item.dealId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Fiz isso
          </button>
        ) : null}
        <Link
          href={`/crm/negocios/${item.dealId}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-[#A0A0A0] hover:text-white"
        >
          Ver negócio
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export function CrmNorteClient() {
  const [plan, setPlan] = useState<NortePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/crm/norte");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha no Norte.");
    setPlan(data.plan);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onDone(dealId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/norte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, outcome: "done" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não deu pra marcar.");
      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro.");
    } finally {
      setBusy(false);
    }
  }

  if (!plan && !error) {
    return <p className="text-sm text-[#A0A0A0]">Montando o seu norte…</p>;
  }

  const restNow = plan?.now.filter((i) => i.dealId !== plan.hero?.dealId) ?? [];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(56,130,246,0.14),_transparent_40%)] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_0_22px_rgba(16,185,129,0.35)]">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Norte
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {plan?.headline ?? "Plano de ação"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#C8C8C8]">
              Não é pra fazer o funil inteiro. É pra saber a próxima jogada — e como
              abordar. {plan ? `Hoje é ${plan.weekday}.` : ""}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {plan?.hero ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Target className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Se só fizer uma coisa
            </h2>
          </div>
          <ActionCard item={plan.hero} featured onDone={onDone} busy={busy} />
        </section>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-[#1a1c24] px-4 py-6 text-sm text-[#A0A0A0]">
          Nada urgente agora. Olha a caça ao próximo lead, abaixo.
        </p>
      )}

      {restNow.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Ainda hoje, se sobrar tempo
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {restNow.map((item) => (
              <ActionCard key={item.dealId} item={item} onDone={onDone} busy={busy} />
            ))}
          </div>
        </section>
      ) : null}

      {plan?.soon.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Em seguida
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {plan.soon.map((item) => (
              <ActionCard key={item.dealId} item={item} onDone={onDone} busy={busy} />
            ))}
          </div>
        </section>
      ) : null}

      {plan?.hold.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-yellow-200/80">
            <Ban className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Não mexa agora
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {plan.hold.map((item) => (
              <ActionCard key={item.dealId} item={item} onDone={onDone} busy={busy} />
            ))}
          </div>
        </section>
      ) : null}

      {plan?.nurture.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-200/80">
            <Heart className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Clientes — carinho, não cobrança
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {plan.nurture.map((item) => (
              <ActionCard key={item.dealId} item={item} onDone={onDone} busy={busy} />
            ))}
          </div>
        </section>
      ) : null}

      {plan?.hunt.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#0CD4FF]">
            <Sparkles className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
              De onde vem o próximo lead
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plan.hunt.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4"
              >
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#C8C8C8]">{card.why}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#A0A0A0]">{card.how}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
