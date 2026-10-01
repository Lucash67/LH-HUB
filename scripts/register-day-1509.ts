/**
 * 15/09/2026 — Salgados. A nota só tem o lucro.
 * Não inventa venda, compra nem faturamento.
 * O diário entra para meta, cofrinho teórico e mês contarem R$70.
 *
 * Uso: pnpm tsx scripts/register-day-1509.ts
 */
import "./load-env";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";

const DATE = "2026-09-15";
const BUSINESS = "salgados";

async function main() {
  const existing = await getDiaryEntry(BUSINESS, DATE);
  if (existing && existing.profit === 70 && (existing.revenue.received ?? 0) === 0) {
    console.log(`✅ ${DATE} já está no diário — lucro R$70, sem faturamento inventado`);
    process.exit(0);
  }

  await upsertDiaryEntry({
    version: 1,
    businessId: BUSINESS,
    date: DATE,
    revenue: { received: 0, pending: 0, total: 0 },
    profit: 70,
    quantitySold: 0,
    quantityLost: 0,
    observations: [
      "Nota só tinha \"Lucro: R$70\". Sem lista, sem compra, sem faturamento.",
      "Lucro homologado R$70 para meta, mês e cofrinho teórico.",
      "Cofrinho prático não muda: o saldo de 17/09 (R$2.957,95) já inclui este dia.",
    ].join("\n"),
    manualInsights: "Dia contado só pelo lucro. Lista ainda não existe.",
    lessonsLearned: "Quando a nota não tem lista, o lucro entra no diário e a receita fica zerada.",
    tags: ["registro-dia", "somente-lucro"],
  });

  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry || entry.profit !== 70) {
    throw new Error("15/09 não gravou lucro R$70");
  }
  console.log(`✅ ${DATE} OK — lucro R$70 · receita R$0 · sem vendas`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
