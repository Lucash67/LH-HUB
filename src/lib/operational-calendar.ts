import { getDay, parseISO } from "date-fns";
import { SALGADOS_BUSINESS_ID } from "@/lib/business-units";

/** Salgados opera seg–sex; demais negócios contam todos os dias. */
export function isOperationalDay(date: string, businessId: string): boolean {
  if (businessId !== SALGADOS_BUSINESS_ID && businessId !== "salgados") return true;
  const day = getDay(parseISO(date));
  return day !== 0 && day !== 6;
}

export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const WEEKDAY_MON_FRI = [
  { index: 1, label: "Seg" },
  { index: 2, label: "Ter" },
  { index: 3, label: "Qua" },
  { index: 4, label: "Qui" },
  { index: 5, label: "Sex" },
] as const;
