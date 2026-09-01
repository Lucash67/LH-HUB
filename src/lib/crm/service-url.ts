/** Normaliza link do serviço/site do negócio. */
export function normalizeServiceUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
