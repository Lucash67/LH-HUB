/** Interpreta telefone ou link colado no formulário de negócio novo. */
export function parseContactReach(raw: string | null | undefined): {
  phone: string | null;
  link: string | null;
} {
  const value = raw?.trim() ?? "";
  if (!value) return { phone: null, link: null };

  const digits = value.replace(/\D/g, "");
  const looksUrl =
    /^https?:\/\//i.test(value) ||
    /wa\.me|instagram\.com|t\.me|linkedin\.com|bit\.ly/i.test(value) ||
    (/\//.test(value) && /[a-z]/i.test(value));
  const looksPhone = digits.length >= 8 && !looksUrl;

  if (looksPhone) return { phone: value, link: null };
  if (looksUrl || /[a-z]/i.test(value)) return { phone: null, link: value };
  return { phone: value, link: null };
}
