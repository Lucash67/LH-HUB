import { CRM_TEMPERATURES, type CrmTemperature } from "@/constants/crm-brand";

export function isCrmTemperature(value: string): value is CrmTemperature {
  return (CRM_TEMPERATURES as readonly string[]).includes(value);
}

/** Temperatura inicial a partir do estágio (e ticket, na negociação). */
export function defaultTemperatureForStage(slug: string, value = 0): CrmTemperature {
  if (slug === "won") return "won";
  if (slug === "lost") return "lost";
  if (slug === "lead") return "cold";
  if (slug === "qualified") return "warm";
  if (slug === "negotiation") return value >= 3000 ? "alert" : "hot";
  return "neutral";
}

/** Ao mudar estágio: Fechado/Perdido vencem; senão mantém a temperatura manual. */
export function temperatureAfterStageChange(
  stageSlug: string,
  value: number,
  current: string | null | undefined,
): CrmTemperature {
  if (stageSlug === "won") return "won";
  if (stageSlug === "lost") return "lost";
  if (current && isCrmTemperature(current) && current !== "won" && current !== "lost") {
    return current;
  }
  return defaultTemperatureForStage(stageSlug, value);
}
