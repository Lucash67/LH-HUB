import type { CrmTemperature } from "@/constants/crm-brand";

export type NorteBucket = "now" | "soon" | "hold" | "nurture";
export type NorteChannel = "whatsapp" | "presencial" | "aguardar" | "carinho";

export type NorteDealInput = {
  dealId: string;
  title: string;
  value: number;
  source: string | null;
  notes: string | null;
  temperature: CrmTemperature;
  updatedAt: Date;
  stageSlug: string;
  stageLabel: string;
  isWon: boolean;
  isLost: boolean;
  contactId: string | null;
  contactName: string | null;
  contactCompany: string | null;
  contactPhone: string | null;
  contactNotes: string | null;
};

export type NorteItem = {
  dealId: string;
  contactId: string | null;
  contactName: string;
  nickname: string;
  company: string | null;
  phone: string | null;
  waLink: string | null;
  title: string;
  stageLabel: string;
  stageSlug: string;
  temperature: CrmTemperature;
  value: number;
  bucket: NorteBucket;
  priority: number;
  minutes: number;
  channel: NorteChannel;
  when: string;
  why: string;
  how: string;
  message: string | null;
};

export type NorteHuntCard = {
  title: string;
  why: string;
  how: string;
};

export type NortePlan = {
  generatedAt: string;
  weekday: string;
  isWeekend: boolean;
  headline: string;
  focusMinutes: number;
  hero: NorteItem | null;
  now: NorteItem[];
  soon: NorteItem[];
  hold: NorteItem[];
  nurture: NorteItem[];
  hunt: NorteHuntCard[];
};

const NICKNAMES: Record<string, string> = {
  "Maria Luiza Pinheiro": "Malu",
  "Jeferson Costa": "Jef",
  "Maurício Machado": "Maurício",
  "Arthur Anadon": "Arthur",
  "Samuel Infinity": "Samuel",
};

const TEMP_SCORE: Record<CrmTemperature, number> = {
  alert: 100,
  hot: 72,
  cold: 58,
  warm: 22,
  neutral: 36,
  won: 10,
  lost: 0,
};

export function phoneToWaDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function waMeLink(phone: string | null | undefined, text?: string | null): string | null {
  const digits = phoneToWaDigits(phone);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

function nicknameFor(name: string | null): string {
  if (!name) return "aí";
  return NICKNAMES[name] ?? firstName(name);
}

function daysSince(date: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86_400_000));
}

function looksPresencial(input: NorteDealInput): boolean {
  const blob = `${input.source ?? ""} ${input.notes ?? ""} ${input.contactCompany ?? ""} ${input.contactNotes ?? ""}`;
  return /acal|presencial|mesmo local|corredor|no trabalho/i.test(blob);
}

function alreadyTouchedToday(notes: string | null, todayLabel: string): boolean {
  if (!notes) return false;
  return notes.includes(`Norte · ação feita em ${todayLabel}`);
}

function contextWhen(isWeekend: boolean, channel: NorteChannel, presencial: boolean): string {
  if (channel === "aguardar") return "Não é hoje";
  if (channel === "carinho") return "Quando sobrar 2 minutos";
  if (presencial && isWeekend) return "WPP curto agora · conversa na segunda, na Acal";
  if (presencial) return "Hoje, presencial se cruzar · senão WPP";
  if (isWeekend) return "Pode mandar hoje — texto curto, sem pressão";
  return "Hoje";
}

function buildCopy(input: NorteDealInput, ctx: { isWeekend: boolean; nickname: string }): {
  bucket: NorteBucket;
  minutes: number;
  channel: NorteChannel;
  why: string;
  how: string;
  message: string | null;
} {
  const { nickname, isWeekend } = ctx;
  const presencial = looksPresencial(input);
  const highTicket = input.value >= 3000;

  if (input.isLost) {
    return {
      bucket: "hold",
      minutes: 0,
      channel: "aguardar",
      why: "Marcado como perdido.",
      how: "Só reabra se a pessoa voltar sozinha.",
      message: null,
    };
  }

  if (input.isWon) {
    return {
      bucket: "nurture",
      minutes: 3,
      channel: "carinho",
      why: "Já fechou. Agora o jogo é carinho e indicação — não venda de novo.",
      how: "Pergunte se a landing está ok e, se fluir, peça 1 nome de alguém que precise de site.",
      message: `Fala ${nickname}! Tudo certo com a landing? Se alguém do teu círculo precisar de site ou sistema, me chama que eu cuido.`,
    };
  }

  if (input.temperature === "alert" || (input.stageSlug === "negotiation" && highTicket)) {
    return {
      bucket: "now",
      minutes: isWeekend && presencial ? 5 : 15,
      channel: presencial ? "presencial" : "whatsapp",
      why: highTicket
        ? `Ticket alto (${input.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}) parado depois da proposta. Esse é o maior dinheiro aberto do funil.`
        : "Proposta em aberto e a conversa esfriou — um toque agora evita o sumiço.",
      how: presencial
        ? isWeekend
          ? "Não fecha contrato no domingo. Manda um WPP curto só pra marcar 5 min na segunda, no trabalho. Não reapresente o orçamento."
          : "Aborde no corredor com pergunta, não com preço: “você chegou a ver a proposta? o que trava?”. Escuta primeiro."
        : "Um follow-up só. Lembre o combinado, ofereça tirar 1 dúvida, sugira horário. Sem desconto no primeiro toque.",
      message: presencial
        ? `Fala ${nickname}! Passei pra gente alinhar aquele fluxo de relatórios. Segunda eu te encontro na Acal pra 5 min — qual horário te ajuda?`
        : `Fala ${nickname}! Vim saber se você teve tempo de olhar a proposta. Se tiver alguma dúvida de escopo ou prazo, a gente resolve rápido. Qual dia essa semana fica bom?`,
    };
  }

  if (input.stageSlug === "lead" && (input.temperature === "warm" || input.temperature === "hot")) {
    return {
      bucket: "hold",
      minutes: 0,
      channel: "aguardar",
      why: "O primeiro toque já foi. Agora a bola está com eles.",
      how: "Não mande de novo hoje. Se não responder em 3–4 dias, um único “conseguiu ver?”.",
      message: null,
    };
  }

  if (input.stageSlug === "lead" || input.temperature === "cold") {
    return {
      bucket: "now",
      minutes: 8,
      channel: "whatsapp",
      why: "Ainda não teve o primeiro contato de verdade. Lead parado não vira cliente.",
      how: "WPP curto, sem orçamento. Lembra quem você é, o contexto, e pede 10 minutos. O objetivo é resposta, não fechar.",
      message: `Fala ${nickname}! Aqui é o Lucas. Fiquei de te chamar pra conversar sobre o site. Tem 10 min essa semana pra gente alinhar o que você precisa?`,
    };
  }

  if (input.stageSlug === "qualified") {
    return {
      bucket: "soon",
      minutes: 20,
      channel: "whatsapp",
      why: "A pessoa já demonstrou interesse. Falta virar proposta com número e prazo.",
      how: "Faça 3 perguntas: orçamento, prazo e o que precisa estar no ar. Só então manda a faixa de valor.",
      message: `Fala ${nickname}! Pra eu te mandar uma proposta certeira: qual o prazo que você imagina e o que precisa estar pronto no site?`,
    };
  }

  if (input.temperature === "hot") {
    return {
      bucket: "soon",
      minutes: 10,
      channel: "whatsapp",
      why: "Está quente — responda rápido se puxarem, e avance um passo (prazo, escopo ou sim).",
      how: "Não some. Se estiver na sua vez, manda o próximo recorte objetivo. Se estiver na vez deles, espera mais um dia.",
      message: `Fala ${nickname}! Só confirmando se ficou alguma dúvida pra gente avançar.`,
    };
  }

  if (input.temperature === "warm" || input.stageSlug === "negotiation") {
    return {
      bucket: "hold",
      minutes: 0,
      channel: "aguardar",
      why: "Proposta ou parceria já está na mesa. Cobrar de novo hoje parece desespero e queima o jogo.",
      how: "Espere 5–7 dias sem resposta. Enquanto isso, foque em alerta e no primeiro contato dos frios.",
      message: null,
    };
  }

  return {
    bucket: "soon",
    minutes: 10,
    channel: "whatsapp",
    why: "Está no funil, mas sem urgência clara.",
    how: "Um toque leve só se passar da semana sem movimento.",
    message: `Fala ${nickname}! Passando pra saber se ainda faz sentido a gente conversar.`,
  };
}

function scoreItem(input: NorteDealInput, item: NorteItem, now: Date): number {
  if (input.isLost) return 0;
  let score = TEMP_SCORE[input.temperature] ?? 20;
  if (input.stageSlug === "negotiation") score += 18;
  if (input.stageSlug === "lead") score += 12;
  if (input.stageSlug === "qualified") score += 16;
  score += Math.min(40, input.value / 150);
  score += Math.min(24, daysSince(input.updatedAt, now) * 2);
  if (item.phone) score += 4;
  if (item.bucket === "hold") score -= 40;
  if (item.bucket === "nurture") score = 8 + Math.min(12, daysSince(input.updatedAt, now));
  return Math.round(score);
}

function huntCards(inputs: NorteDealInput[]): NorteHuntCard[] {
  const won = inputs.filter((d) => d.isWon);
  const cards: NorteHuntCard[] = [];
  if (won.length) {
    const names = won
      .map((d) => nicknameFor(d.contactName))
      .filter((n) => n !== "aí")
      .slice(0, 2)
      .join(" e ");
    cards.push({
      title: "Peça 1 indicação pra quem já fechou",
      why: `${names || "Quem já é cliente"} já recebeu o trabalho. Indicação quente vale mais que lead frio de Instagram.`,
      how: "No mesmo WPP de carinho: “conhece alguém que precise de site ou automação?”. Um nome basta.",
    });
  }
  cards.push({
    title: "O próximo lead da Acal",
    why: "Você já tem um gestor de Price pedindo automação. Quem mais sofre com relatório manual na loja?",
    how: "Não prospecte em reunião. Pergunte no café: “quem mais gasta tempo montando planilha toda semana?”.",
  });
  cards.push({
    title: "Quem viu a divulgação no Insta",
    why: "Malu e Samuel já colocaram seu trabalho na frente de gente nova. Isso esfria se você não puxar conversa.",
    how: "Responda quem curtir/comentar. Um “vi que você viu a landing — quer que eu te mostre como ficou?” abre porta.",
  });
  return cards;
}

export function buildNortePlan(deals: NorteDealInput[], now = new Date()): NortePlan {
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    weekday: "long",
  }).format(now);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  const isWeekend = weekday === "sábado" || weekday === "domingo";

  const items: NorteItem[] = deals
    .filter((d) => !d.isLost)
    .filter((d) => !alreadyTouchedToday(d.notes, dateLabel))
    .map((d) => {
      const contactName = d.contactName ?? "Sem contato";
      const nickname = nicknameFor(d.contactName);
      const copy = buildCopy(d, { isWeekend, nickname });
      const message = copy.message;
      const item: NorteItem = {
        dealId: d.dealId,
        contactId: d.contactId,
        contactName,
        nickname,
        company: d.contactCompany,
        phone: d.contactPhone,
        waLink: waMeLink(d.contactPhone, message),
        title: d.title,
        stageLabel: d.stageLabel,
        stageSlug: d.stageSlug,
        temperature: d.temperature,
        value: d.value,
        bucket: copy.bucket,
        priority: 0,
        minutes: copy.minutes,
        channel: copy.channel,
        when: contextWhen(isWeekend, copy.channel, looksPresencial(d)),
        why: copy.why,
        how: copy.how,
        message,
      };
      item.priority = scoreItem(d, item, now);
      return item;
    })
    .sort((a, b) => b.priority - a.priority);

  const nowItems = items.filter((i) => i.bucket === "now");
  const soon = items.filter((i) => i.bucket === "soon");
  const hold = items.filter((i) => i.bucket === "hold");
  const nurture = items.filter((i) => i.bucket === "nurture");
  const hero = nowItems[0] ?? soon[0] ?? null;

  const headline = hero
    ? isWeekend
      ? `É ${weekday}. Uma ação leve hoje — o fechamento pesado fica pra segunda.`
      : `Uma coisa agora: ${hero.nickname}. O resto espera.`
    : "Nada urgente no funil. Use o tempo pra caçar o próximo lead.";

  return {
    generatedAt: now.toISOString(),
    weekday,
    isWeekend,
    headline,
    focusMinutes: hero?.minutes ?? 15,
    hero,
    now: nowItems,
    soon,
    hold,
    nurture,
    hunt: huntCards(deals),
  };
}

export function noteAfterNorteDone(previous: string | null, dateLabel: string): string {
  const stamp = `Norte · ação feita em ${dateLabel}.`;
  const base = (previous ?? "").trim();
  if (base.includes(stamp)) return base;
  return base ? `${base}\n\n${stamp}` : stamp;
}
