/**
 * Frases de boas-vindas da dashboard.
 *
 * A saudação ("Bom dia/Boa tarde/Boa noite") vem do horário local do usuário e
 * o resto da frase muda entre fim de semana (não há operação: o painel é de
 * consulta) e dia útil (o painel é de ação). Para trocar a copy, edite apenas
 * WEEKEND_COPY / WEEKDAY_COPY.
 */
import { getTimeGreeting, isWeekendForUser } from "@/lib/time-greeting";

export interface GreetingCopy {
  /** Texto que vem depois do nome, incluindo a pontuação final. */
  suffix: string;
  subtitle: string;
}

export const WEEKEND_COPY: GreetingCopy = {
  suffix: ", aqui está seu desempenho da semana em seu SaaS.",
  subtitle: "Deseja consultar algo mais?",
};

export const WEEKDAY_COPY: GreetingCopy = {
  suffix: ".",
  subtitle: "O que deseja fazer hoje?",
};

export interface DashboardGreeting extends GreetingCopy {
  greeting: string;
  isWeekend: boolean;
}

export function resolveDashboardGreeting(
  timeZone?: string,
  date = new Date(),
): DashboardGreeting {
  const isWeekend = isWeekendForUser(timeZone, date);
  return {
    greeting: getTimeGreeting(timeZone, date),
    isWeekend,
    ...(isWeekend ? WEEKEND_COPY : WEEKDAY_COPY),
  };
}
