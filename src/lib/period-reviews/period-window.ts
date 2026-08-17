import { addMonths, addWeeks, format, parseISO } from "date-fns";
import { getWeekRange, getMonthRange } from "@/lib/utils";
import type { PeriodType } from "@/lib/period-reviews/types";

/** Resolve chave e intervalo a partir de offset (0 = período atual). */
export function resolvePeriodWindow(
  periodType: PeriodType,
  offset: number,
  reference = new Date(),
): { periodKey: string; rangeStart: string; rangeEnd: string; label: string } {
  if (periodType === "weekly") {
    const anchor = addWeeks(reference, offset);
    const { start, end } = getWeekRange(anchor);
    return {
      periodKey: start,
      rangeStart: start,
      rangeEnd: end,
      label: `${format(parseISO(start), "dd/MM")} – ${format(parseISO(end), "dd/MM")}`,
    };
  }

  const anchor = addMonths(reference, offset);
  const { start, end } = getMonthRange(anchor);
  return {
    periodKey: format(parseISO(start), "yyyy-MM"),
    rangeStart: start,
    rangeEnd: end,
    label: format(parseISO(start), "MMMM yyyy"),
  };
}
