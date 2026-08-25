/** Único dia a forçar para o modelo novo (não tocar no 25/08). */
export const FORCE_TEMPLATE_NOTE_DATE = "2026-08-26";

const NEW_TEMPLATE_MARKER = "Unifor & Acal";

export function usesNewDailyDraftTemplate(body: string | null | undefined): boolean {
  return (body ?? "").includes(NEW_TEMPLATE_MARKER);
}
