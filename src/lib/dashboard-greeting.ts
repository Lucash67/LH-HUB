/**
 * Frases de boas-vindas da dashboard.
 *
 * A saudação ("Bom dia/Boa tarde/Boa noite") vem do horário local do usuário e
 * o resto da frase muda entre fim de semana (não há operação: o painel é de
 * consulta) e dia útil (o painel é de ação). Nos dias úteis a frase alterna
 * entre as variações da rotação, uma por dia. Para trocar a copy, edite apenas
 * WEEKEND_COPY / WEEKDAY_COPY_ROTATION.
 */
import {
  getLocalDateKey,
  getTimeGreeting,
  isWeekendForUser,
  resolveUserTimeZone,
} from "@/lib/time-greeting";

export interface GreetingCopy {
  /** Texto que vem depois do nome, incluindo a pontuação final. */
  suffix: string;
  subtitle: string;
}

export const WEEKEND_COPY: GreetingCopy = {
  suffix: ", aqui está seu desempenho da semana em seu SaaS.",
  subtitle: "Deseja consultar algo mais?",
};

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

export interface DashboardGreeting extends GreetingCopy {
  greeting: string;
  isWeekend: boolean;
}

export function resolveDashboardGreeting(
  timeZone?: string,
  date = new Date(),
): DashboardGreeting {
  const tz = timeZone ?? resolveUserTimeZone();
  const isWeekend = isWeekendForUser(tz, date);
  return {
    greeting: getTimeGreeting(tz, date),
    isWeekend,
    ...(isWeekend ? WEEKEND_COPY : weekdayCopyFor(getLocalDateKey(tz, date))),
  };
}
