/**
 * Sprint 3.3 — Seed registro oficial 20/07/2026
 */
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

// Import compiled seed via JSON built inline (avoid TS import in mjs)
const entry = {
  version: 1,
  businessId: "salgados",
  date: "2026-07-20",
  dailyGoalUnits: 15,
  purchase: {
    totalUnits: 15,
    investment: 52.5,
    products: [
      { name: "Croissant", quantity: 6 },
      { name: "Pastel", quantity: 5 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: { paidCount: 9, creditCount: 1, fatherSale: { units: 3, amount: 15, buyerName: "Henrique" } },
  revenue: { received: 65, pending: 5, total: 70 },
  profit: 17.5,
  quantitySold: 14,
  quantityLost: 1,
  lossReason: "Desconhecido",
  "Cliente Mikely ficou devendo 1 Croissant. Cobrança será realizada posteriormente.",
  manualInsights:
    "Pastel esgotou rapidamente. Croissant apresentou desempenho inferior ao esperado. Misto com Catupiry apresentou crescimento em relação à semana anterior.",
  lessonsLearned:
    "O preço não estava visível. Clientes perguntaram antes de comprar. Uma placa mais clara pode aumentar a conversão. A demanda dos sabores mudou em relação à semana passada — necessário acompanhar tendência por mais dias antes de alterar permanentemente o mix.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Pessoas perguntaram o preço antes de comprar.",
      "A placa atual possui apenas o QR Code.",
      "O QR Code abre com valor zerado.",
      "Isso gera dúvida durante a compra.",
    ],
    conclusion: "Existe atrito no processo de venda.",
  },
  suggestedActions: [
    {
      id: "placa-qrcode-v2",
      title: "Nova placa com QR Code e preço visível",
      description:
        "Criar placa contendo: QR Code, valor unitário, sabores disponíveis, mensagem chamativa e Pix pré-preenchido com R$ 5,00 (permitindo alteração para múltiplas unidades).",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Pastel", hypothesis: "Pastel tornou-se o sabor de maior saída.", confirmed: null },
    { flavor: "Croissant", hypothesis: "Croissant perdeu força.", confirmed: null },
    { flavor: "Misto com Catupiry", hypothesis: "Misto com Catupiry apresentou crescimento.", confirmed: null },
  ],
  tags: ["atrato-venda", "placa", "qrcode", "mix-produtos", "receita-pendente", "perda-operacional"],
};

const entityId = "salgados:2026-07-20";
const existing = db
  .prepare("SELECT id FROM notes WHERE entity_type = 'operational_diary' AND entity_id = ?")
  .get(entityId);

const content = JSON.stringify(entry);
const now = new Date().toISOString();

if (existing) {
  db.prepare("UPDATE notes SET content = ? WHERE id = ?").run(content, existing.id);
  console.log("Atualizado:", existing.id);
} else {
  const id = randomUUID();
  db.prepare(
    "INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, 'operational_diary', ?, ?, ?)",
  ).run(id, entityId, content, now);
  console.log("Criado:", id);
}

const row = db
  .prepare("SELECT content FROM notes WHERE entity_type = 'operational_diary' AND entity_id = ?")
  .get(entityId);
const parsed = JSON.parse(row.content);
console.log("Validação:", {
  date: parsed.date,
  revenueTotal: parsed.revenue.total,
  pending: parsed.revenue.pending,
  hypotheses: parsed.productHypotheses?.length,
  actions: parsed.suggestedActions?.length,
  lost: parsed.quantityLost,
});
db.close();
