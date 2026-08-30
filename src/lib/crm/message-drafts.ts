import type { CrmMessageKind } from "@/constants/crm-brand";

/** Fortaleza é UTC−3 o ano inteiro (sem horário de verão). */
export function localFortalezaToDate(local: string | null | undefined): Date | null {
  if (!local) return null;
  const trimmed = local.trim();
  if (!trimmed) return null;
  const iso = trimmed.length === 16 ? `${trimmed}:00-03:00` : `${trimmed}-03:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateToFortalezaLocalInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function formatFortalezaWhen(date: Date | string | null | undefined): string {
  if (!date) return "Sem horário";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "Sem horário";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Próxima segunda 08:00 em Fortaleza — o horário clássico de pitch. */
export function nextMonday0800Local(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = Number(get("hour"));
  let add = (1 - weekIndex + 7) % 7;
  if (add === 0 && hour >= 8) add = 7;

  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const utcNoon = Date.UTC(year, month - 1, day, 15, 0, 0);
  const target = new Date(utcNoon + add * 86_400_000);
  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, "0");
  const d = String(target.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}T08:00`;
}

export function suggestPitch(kind: CrmMessageKind, nickname: string): string {
  const n = nickname || "aí";
  if (kind === "pitch_inicial") {
    return `Fala ${n}! Aqui é o Lucas. Fiquei de te chamar pra conversar sobre o que a gente alinhou. Tem 10 min hoje pra eu te mostrar o caminho?`;
  }
  if (kind === "follow_up") {
    return `Fala ${n}! Vim saber se você teve tempo de olhar a proposta. Se tiver alguma dúvida de escopo ou prazo, a gente resolve rápido. Qual horário te ajuda?`;
  }
  if (kind === "qualificacao") {
    return `Fala ${n}! Pra eu te mandar uma proposta certeira: qual o prazo que você imagina e o que precisa estar pronto?`;
  }
  if (kind === "carinho") {
    return `Fala ${n}! Tudo certo com o que a gente fez? Se alguém do teu círculo precisar de site ou automação, me chama.`;
  }
  return `Fala ${n}!`;
}

export function firstNameOf(full: string | null | undefined): string {
  if (!full) return "aí";
  return full.trim().split(/\s+/)[0] || "aí";
}
