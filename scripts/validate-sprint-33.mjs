/**
 * Sprint 3.3 — Validação Diário Operacional
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const row = db
  .prepare(
    "SELECT content FROM notes WHERE entity_type = 'operational_diary' AND entity_id = 'salgados:2026-07-20'",
  )
  .get();

if (!row) {
  console.error("✗ Registro 20/07 não encontrado");
  process.exit(1);
}

const e = JSON.parse(row.content);
const checks = [
  ["Diário criado", e.version === 1],
  ["Data 20/07", e.date === "2026-07-20"],
  ["Receita pendente R$ 5", e.revenue.pending === 5],
  ["Receita total R$ 70", e.revenue.total === 70],
  ["Perda 1 unidade", e.quantityLost === 1],
  ["Aprendizados", Boolean(e.lessonsLearned)],
  ["3 hipóteses", e.productHypotheses?.length === 3],
  ["Ação placa", e.suggestedActions?.some((a) => a.id === "placa-qrcode-v2")],
  ["Inteligência comercial", e.commercialIntelligence?.whatWeLearnedToday?.length === 4],
  ["Conclusão atrito", e.commercialIntelligence?.conclusion?.includes("atrito")],
];

for (const [label, pass] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${label}`);
}

db.close();
if (checks.some(([, p]) => !p)) process.exit(1);
console.log(`\n${checks.length}/${checks.length} OK`);
