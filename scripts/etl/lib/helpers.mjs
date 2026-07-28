import { v5 as uuidv5, validate as uuidValidate } from "uuid";

export const ETL_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

export const BUSINESS_UUID = {
  salgados: "00000000-0000-4000-8000-000000000001",
  brigadeiros: "00000000-0000-4000-8000-000000000002",
};

export function businessUuid(slug) {
  return BUSINESS_UUID[slug] ?? uuidv5(`business:${slug}`, ETL_NAMESPACE);
}

export function ensureUuid(id) {
  if (!id) return uuidv5(`empty:${Math.random()}`, ETL_NAMESPACE);
  if (uuidValidate(id)) return id;
  return uuidv5(id, ETL_NAMESPACE);
}

export function operationDayUuid(businessSlug, date) {
  return uuidv5(`operation-day:${businessUuid(businessSlug)}:${date}`, ETL_NAMESPACE);
}

export function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlNum(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "NULL";
  return String(Number(value));
}

export function sqlJson(value) {
  if (value === null || value === undefined) return "NULL";
  return `${sqlStr(JSON.stringify(value))}::jsonb`;
}

export function sqlTextArray(values) {
  if (!values || values.length === 0) return "'{}'::text[]";
  const inner = values.map((v) => sqlStr(v)).join(", ");
  return `ARRAY[${inner}]::text[]`;
}

export function parseIsoTimestamp(value) {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function parseTags(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function chunkArray(items, size = 40) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
