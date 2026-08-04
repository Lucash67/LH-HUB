/**
 * Frases de boas-vindas da dashboard.
 *
 * A saudação ("Bom dia/Boa tarde/Boa noite") vem do horário local do usuário,
 * mas o resto da frase segue o dia que está em foco no filtro temporal, não o
 * relógio: falar de "hoje" enquanto o painel mostra um sábado antigo seria
 * mentira. Para trocar a copy, edite WEEKEND_COPY / WEEKDAY_COPY_ROTATION.
 */
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getLocalDateKey,
  getTimeGreeting,
  resolveUserTimeZone,
} from "@/lib/time-greeting";

export interface GreetingCopy {
  /** Texto que vem depois do nome, incluindo a pontuação final. */
  suffix: string;
  subtitle: string;
}

/** Fim de semana: não há operação, o painel é de consulta. Frase fixa. */
export const WEEKEND_COPY: GreetingCopy = {
  suffix: ", aqui está seu desempenho da semana em seu SaaS.",
  subtitle: "Deseja consultar algo mais?",
};

/** Dia útil em andamento: o painel é de ação. Alterna uma frase por dia. */
export const WEEKDAY_COPY_ROTATION: GreetingCopy[] = [
  {
    suffix: ".",
    subtitle: "O que deseja fazer hoje?",
  },
  {
    suffix: ", pronto para operar?",
    subtitle: "Comece registrando o dia.",
  },
  {
    suffix: ", o dia é seu.",
    subtitle: "O que deseja fazer hoje?",
  },
  {
    suffix: ", sua operação está sob controle.",
    subtitle: "Registrar, revisar ou consultar?",
  },
  {
    suffix: ", vamos bater a meta de hoje.",
    subtitle: "Por onde quer começar?",
  },
];

/**
 * Escolhe a frase do dia pela data local, não por sorteio: a frase é estável
 * durante o dia inteiro e igual no servidor e no navegador.
 */
function weekdayCopyFor(dateKey: string): GreetingCopy {
  const daysSinceEpoch = Math.floor(Date.parse(`${dateKey}T12:00:00Z`) / 86_400_000);
  const index =
    ((daysSinceEpoch % WEEKDAY_COPY_ROTATION.length) + WEEKDAY_COPY_ROTATION.length) %
    WEEKDAY_COPY_ROTATION.length;
  return WEEKDAY_COPY_ROTATION[index] ?? WEEKDAY_COPY_ROTATION[0]!;
}

function isWeekendDateKey(dateKey: string): boolean {
  const weekday = parseISO(dateKey).getDay();
  return weekday === 0 || weekday === 6;
}

function describeDate(dateKey: string): string {
  return format(parseISO(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export type GreetingMode = "weekend" | "operate" | "review" | "future";

export interface DashboardGreeting extends GreetingCopy {
  greeting: string;
  mode: GreetingMode;
  /** Fim de semana ou dia fora de hoje: o painel é de consulta, não de ação. */
  isConsulting: boolean;
}

export interface GreetingInput {
  /** Dia em foco (yyyy-MM-dd). Ausente na visão geral. */
  viewDate?: string | null;
  timeZone?: string;
  now?: Date;
}

export function resolveDashboardGreeting({
  viewDate,
  timeZone,
  now = new Date(),
}: GreetingInput = {}): DashboardGreeting {
  const tz = timeZone ?? resolveUserTimeZone();
  const greeting = getTimeGreeting(tz, now);
  const today = getLocalDateKey(tz, now);

  // O dia em foco manda. Sem dia (visão geral) o painel é do próprio hoje.
  const focus = viewDate ?? today;

  const build = (mode: GreetingMode, copy: GreetingCopy): DashboardGreeting => ({
    greeting,
    mode,
    isConsulting: mode !== "operate",
    ...copy,
  });

  if (isWeekendDateKey(focus)) {
    return build("weekend", WEEKEND_COPY);
  }

  if (focus > today) {
    return build("future", {
      suffix: `, ${describeDate(focus)} ainda não chegou.`,
      subtitle: "Deseja consultar outro dia?",
    });
  }

  if (focus < today) {
    return build("review", {
      suffix: `, aqui está o desempenho de ${describeDate(focus)}.`,
      subtitle: "Deseja consultar algo mais?",
    });
  }

  return build("operate", weekdayCopyFor(focus));
}
