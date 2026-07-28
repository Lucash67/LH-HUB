/**
 * Sprint A.3.1 — Reconstrução histórica oficial 16/07/2026
 * Fonte: rascunho operacional enrich-acal-day1.mjs (oficial)
 * Idempotente — cria backup antes de alterar.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(ROOT, "data", "lucas-business-os.db");
const BUSINESS_ID = "salgados";
const DEPARTMENT = "ACAL";
const OP_DATE = "2026-07-16";
const UNIT_PRICE = 5;
const UNIT_COST = 31.5 / 9;
const INVESTMENT = 31.5;

const GERMANA_NOTES = `Primeira venda múltipla do dia.
Pagador: Germana Nataeli de Oliveira.
Consumidoras: Germana Nataeli de Oliveira e Consumidora ainda não identificada.
A segunda consumidora será identificada futuramente — não cadastrada como cliente definitivo.`;

const OFFICIAL_SALES = [
  { time: "09:09", client: "Diego Martins Pinheiro", items: [{ product: "croissant", qty: 1 }] },
  { time: "09:09", client: "Francisco Ricardo Feijão Pinho", items: [{ product: "misto", qty: 1 }] },
  {
    time: "09:14",
    client: "Germana Nataeli de Oliveira",
    items: [{ product: "pastel", qty: 2 }],
    notes: GERMANA_NOTES,
  },
  { time: "09:16", client: "Daniele Gomes Silva", items: [{ product: "misto", qty: 1 }] },
  { time: "09:26", client: "Maria Graziele Santos Oliveira", items: [{ product: "croissant", qty: 1 }] },
  { time: "09:29", client: "Vanderson Dias", items: [{ product: "croissant", qty: 1 }] },
  { time: "09:55", client: "Maria Mikelly Monteiro Coutinho", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:56", client: "Dayanna Kelly Costa Almeida", items: [{ product: "misto", qty: 1 }] },
];

const DIARY_16 = {
  version: 1,
  businessId: BUSINESS_ID,
  date: OP_DATE,
  dailyGoalUnits: 9,
  purchase: {
    totalUnits: 9,
    investment: INVESTMENT,
    products: [
      { name: "Croissant", quantity: 3 },
      { name: "Misto com Catupiry", quantity: 3 },
      { name: "Pastel de Frango com Presunto", quantity: 3 },
    ],
  },
  sales: { paidCount: 8, creditCount: 0 },
  revenue: { received: 45, pending: 0, total: 45 },
  profit: 13.5,
  quantitySold: 9,
  quantityLost: 0,
  observations: `Primeiro dia oficial de operação ACAL (16/07/2026).
Supervisora Nay autorizou o início. Comercialização apenas salgados (doces sob responsabilidade de Ana — não vendidos).
Objetivo: Validar aceitação dos salgados.
Resultado: 100% do estoque vendido (9 unidades).
Tempo para esgotar estoque: 47 minutos (09:09 às 09:56).
Janela operacional: 09:09 às 09:56.
Forma de pagamento: 100% PIX.
Nenhuma sobra. Nenhum desconto solicitado.
Primeira compra múltipla registrada (Germana — 2 consumidoras).

CONTEXTO FINANCEIRO:
- Receita: R$ 45,00
- Investimento pai do operador: R$ 31,50 (terceiro — não desembolso do operador)
- Lucro operacional: R$ 13,50
- Margem: 30%
- Operador não realizou desembolso financeiro nesta operação`,
  manualInsights:
    "Preço de R$ 5,00 aceito sem objeções. Nenhum pedido de desconto. Nenhum pedido para pagar depois. Todos os pagamentos via PIX. Estoque inicial adequado. Estratégia de começar pequeno mostrou-se correta. Ainda não existem dados suficientes para concluir qual produto possui maior demanda.",
  lessonsLearned: `APRENDIZADO 01 — Preço de R$ 5,00 aceito sem objeções.

APRENDIZADO 02 — Nenhum pedido de desconto.

APRENDIZADO 03 — Nenhum pedido para pagar depois.

APRENDIZADO 04 — Todos os pagamentos via PIX.

APRENDIZADO 05 — Estoque inicial adequado.

APRENDIZADO 06 — Estratégia de começar pequeno mostrou-se correta.

APRENDIZADO 07 — Ainda não existem dados suficientes para concluir qual produto possui maior demanda.

DECISÃO ESTRATÉGICA (final do dia):
Aumentar gradualmente a produção para o dia seguinte (17/07/2026):
- 5 Croissants
- 4 Pastéis de Frango com Presunto
- 3 Mistos com Catupiry
Total: 12 unidades.
Decisão baseada exclusivamente nos dados do primeiro dia.`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "100% do estoque vendido em 47 minutos.",
      "Janela operacional: 09:09 às 09:56.",
      "Primeira venda múltipla — Germana pagou por 2 consumidoras.",
      "Pagador ≠ consumidor — requisito funcional identificado.",
      "Mix equilibrado: 3 Croissant, 3 Pastel, 3 Misto.",
    ],
    conclusion:
      "Validação bem-sucedida. Produção do dia 17 definida em 12 unidades com base exclusiva nos dados deste dia.",
  },
  suggestedActions: [
    {
      id: "producao-dia-17",
      title: "Aumentar produção para 12 unidades (17/07)",
      description: "5 Croissants · 4 Pastéis · 3 Mistos — decisão baseada no primeiro dia.",
      status: "planned",
    },
    {
      id: "payer-consumer-separation",
      title: "Modelar separação pagador/consumidor (futuro)",
      description:
        "Evidência: venda Germana 09:14 — pagador diferente de uma consumidora. Requisito arquitetural.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Mix equilibrado (3+3+3) funcionou — dados insuficientes para favorito.",
      confirmed: null,
    },
  ],
  tags: ["primeiro-dia", "validacao", "pix-100", "estoque-zerado", "germana-multipla"],
};

const stats = {
  salesReplaced: 0,
  clientsCreated: 0,
  clientsUpdated: 0,
  clientsCreatedSet: new Set(),
  clientsUpdatedSet: new Set(),
  legacyNotesRemoved: 0,
  investmentUpdated: false,
  diaryCreated: false,
};

const db = new Database(DB_PATH);

function backupDb() {
  const dir = path.join(ROOT, "backups");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dest = path.join(dir, `backup-pre-reconstruct-1607-${stamp}.db`);
  fs.copyFileSync(DB_PATH, dest);
  console.log(`✓ Backup: ${dest}`);
  return dest;
}

function findProducts() {
  const rows = db.prepare("SELECT id, name FROM products WHERE business_id = ?").all(BUSINESS_ID);
  const map = {};
  for (const p of rows) {
    const lower = p.name.toLowerCase();
    if (lower.includes("croissant")) map.croissant = p.id;
    else if (lower.includes("misto")) map.misto = p.id;
    else if (lower.includes("pastel")) map.pastel = p.id;
  }
  if (!map.croissant || !map.misto || !map.pastel) throw new Error("Produtos não encontrados");
  return map;
}

function ensureClient(name) {
  const canonical = name === "Francisco Vanderson O Dias" ? "Vanderson Dias" : name;
  const aliases = {
    "Dayanna Kelly Costa da Silva": "Dayanna Kelly Costa Almeida",
  };
  const lookup = aliases[canonical] ?? canonical;

  let row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(lookup);
  if (!row && lookup !== name) {
    row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(name);
  }
  if (row) {
    if (row.name !== lookup) {
      db.prepare("UPDATE clients SET name = ?, updated_at = ? WHERE id = ?").run(
        lookup,
        new Date().toISOString(),
        row.id,
      );
    }
    stats.clientsUpdatedSet.add(row.id);
    return row.id;
  }
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO clients (id, business_id, name, sector, company, phone, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
  ).run(id, BUSINESS_ID, lookup, DEPARTMENT, `Cliente identificado — operação ACAL ${OP_DATE}.`, now, now);
  stats.clientsCreatedSet.add(id);
  return id;
}

function saleTotals(items) {
  const units = items.reduce((s, i) => s + i.qty, 0);
  const total = UNIT_PRICE * units;
  const cost = UNIT_COST * units;
  return { units, total, cost, profit: total - cost };
}

function insertSale({ saleId, time, clientId, totals, notes, items, productIds }) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO sales (id, business_id, date, time, client_id, department, payment_method, payment_status, amount_received, payment_date, total_amount, total_cost, profit, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pix', 'paid', ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    saleId,
    BUSINESS_ID,
    OP_DATE,
    time,
    clientId,
    DEPARTMENT,
    totals.total,
    OP_DATE,
    totals.total,
    totals.cost,
    totals.profit,
    notes ?? null,
    now,
    now,
  );
  for (const item of items) {
    const subtotal = UNIT_PRICE * item.qty;
    const cost = UNIT_COST * item.qty;
    db.prepare(
      `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      saleId,
      productIds[item.product],
      item.qty,
      UNIT_PRICE,
      UNIT_COST,
      subtotal,
      subtotal - cost,
    );
  }
  db.prepare(`INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, 'pix', ?, ?)`).run(
    uuidv4(),
    saleId,
    totals.total,
    `${OP_DATE}T${time.replace(":", "")}00.000Z`,
  );
}

function syncDiary(entry) {
  const now = new Date().toISOString();
  const entityId = `${BUSINESS_ID}:${entry.date}`;
  const content = JSON.stringify(entry);
  const existing = db
    .prepare("SELECT id FROM notes WHERE entity_type = 'operational_diary' AND entity_id = ?")
    .get(entityId);
  if (existing) {
    db.prepare("UPDATE notes SET content = ? WHERE id = ?").run(content, existing.id);
  } else {
    db.prepare(
      "INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, 'operational_diary', ?, ?, ?)",
    ).run(uuidv4(), entityId, content, now);
    stats.diaryCreated = true;
  }

  db.prepare(`UPDATE goals SET target_units = ?, updated_at = ? WHERE business_id = ? AND type = 'daily'`).run(
    entry.dailyGoalUnits,
    now,
    BUSINESS_ID,
  );

  db.prepare(`DELETE FROM operational_losses WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, entry.date);

  const purchaseId =
    db.prepare(`SELECT id FROM daily_purchases WHERE business_id = ? AND date = ?`).get(BUSINESS_ID, entry.date)
      ?.id ?? uuidv4();
  const exP = db.prepare(`SELECT id FROM daily_purchases WHERE business_id = ? AND date = ?`).get(BUSINESS_ID, entry.date);
  if (exP) {
    db.prepare(`UPDATE daily_purchases SET total_units = ?, investment = ?, updated_at = ? WHERE id = ?`).run(
      entry.purchase.totalUnits,
      entry.purchase.investment,
      now,
      exP.id,
    );
    db.prepare(`DELETE FROM daily_purchase_items WHERE purchase_id = ?`).run(exP.id);
  } else {
    db.prepare(
      `INSERT INTO daily_purchases (id, business_id, date, total_units, investment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(purchaseId, BUSINESS_ID, entry.date, entry.purchase.totalUnits, entry.purchase.investment, now, now);
  }
  for (const line of entry.purchase.products) {
    db.prepare(
      `INSERT INTO daily_purchase_items (id, purchase_id, product_id, product_name, quantity, unit_cost)
       VALUES (?, ?, NULL, ?, ?, ?)`,
    ).run(uuidv4(), exP?.id ?? purchaseId, line.name, line.quantity, INVESTMENT / 9);
  }

  db.prepare(`DELETE FROM operational_actions WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, entry.date);
  for (const a of entry.suggestedActions ?? []) {
    db.prepare(
      `INSERT INTO operational_actions (id, business_id, date, title, description, status, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'diary', ?, ?)`,
    ).run(uuidv4(), BUSINESS_ID, entry.date, a.title, a.description, a.status, now, now);
  }

  db.prepare(`DELETE FROM product_hypotheses WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, entry.date);
  for (const h of entry.productHypotheses ?? []) {
    db.prepare(
      `INSERT INTO product_hypotheses (id, business_id, date, flavor, hypothesis, confirmed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(uuidv4(), BUSINESS_ID, entry.date, h.flavor, h.hypothesis, null, now, now);
  }

  db.prepare(`DELETE FROM operational_lessons WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, entry.date);
  db.prepare(
    `INSERT INTO operational_lessons (id, business_id, date, content, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(uuidv4(), BUSINESS_ID, entry.date, entry.lessonsLearned, JSON.stringify(entry.tags ?? []), now, now);
}

function removeLegacyNotes() {
  const legacy = db
    .prepare(
      `SELECT id FROM notes WHERE entity_type IN ('operation_day', 'requirement')
       OR (entity_type = 'sale' AND entity_id IN (SELECT id FROM sales WHERE date = ?))`,
    )
    .all(OP_DATE);
  for (const n of legacy) {
    db.prepare("DELETE FROM notes WHERE id = ?").run(n.id);
    stats.legacyNotesRemoved++;
  }
  db.prepare("DELETE FROM notes WHERE entity_id = ? AND entity_type = 'operation_day'").run(OP_DATE);
}

function recalcSoldQuantities(productIds) {
  const now = new Date().toISOString();
  for (const pid of Object.values(productIds)) {
    const row = db
      .prepare(
        `SELECT COALESCE(SUM(si.quantity), 0) as qty FROM sale_items si
         JOIN sales s ON s.id = si.sale_id WHERE si.product_id = ? AND s.business_id = ?`,
      )
      .get(pid, BUSINESS_ID);
    db.prepare("UPDATE products SET sold_quantity = ?, updated_at = ? WHERE id = ?").run(row.qty, now, pid);
  }
}

function main() {
  backupDb();
  const productIds = findProducts();

  db.transaction(() => {
    const oldIds = db
      .prepare("SELECT id FROM sales WHERE date = ? AND business_id = ?")
      .all(OP_DATE, BUSINESS_ID)
      .map((r) => r.id);
    if (oldIds.length > 0) {
      const ph = oldIds.map(() => "?").join(",");
      db.prepare(`DELETE FROM payments WHERE sale_id IN (${ph})`).run(...oldIds);
      db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${ph})`).run(...oldIds);
      db.prepare(`DELETE FROM sales WHERE id IN (${ph})`).run(...oldIds);
      stats.salesReplaced = oldIds.length;
    }

    let first = true;
    for (const sale of OFFICIAL_SALES) {
      const clientId = ensureClient(sale.client);
      const totals = saleTotals(sale.items);
      const notes = first
        ? `${DIARY_16.observations.split("\n")[0]}\nVenda: ${sale.client} às ${sale.time}.`
        : (sale.notes ?? `Venda ACAL ${OP_DATE} — ${sale.client}.`);
      insertSale({
        saleId: uuidv4(),
        time: sale.time,
        clientId,
        totals,
        notes,
        items: sale.items,
        productIds,
      });
      first = false;
    }

    const inv = db.prepare(`SELECT id FROM investments WHERE business_id = ? AND date = ?`).get(BUSINESS_ID, OP_DATE);
    const invDesc =
      "Investimento pai do operador — aquisição dos produtos (R$ 31,50). Não desembolsado pela ACAL nem pelo operador. Dia 16/07/2026. Base histórica oficial homologada A.3.1.";
    if (inv) {
      db.prepare(`UPDATE investments SET amount = ?, description = ?, type = 'initial' WHERE id = ?`).run(
        INVESTMENT,
        invDesc,
        inv.id,
      );
    } else {
      db.prepare(
        `INSERT INTO investments (id, business_id, description, amount, type, date, created_at)
         VALUES (?, ?, ?, ?, 'initial', ?, ?)`,
      ).run(uuidv4(), BUSINESS_ID, invDesc, INVESTMENT, OP_DATE, new Date().toISOString());
    }
    stats.investmentUpdated = true;

    syncDiary(DIARY_16);
    removeLegacyNotes();
    recalcSoldQuantities(productIds);
  })();

  const summary = db
    .prepare(
      `SELECT COUNT(*) as tx, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get(OP_DATE, BUSINESS_ID);

  console.log("\n=== RECONSTRUÇÃO 16/07 CONCLUÍDA ===");
  const report = {
    salesReplaced: stats.salesReplaced,
    clientsCreated: stats.clientsCreatedSet.size,
    clientsUpdated: stats.clientsUpdatedSet.size,
    legacyNotesRemoved: stats.legacyNotesRemoved,
    investmentUpdated: stats.investmentUpdated,
    diaryCreated: stats.diaryCreated,
  };
  console.log("Stats:", report);
  console.log("Resumo:", summary);
  console.log(JSON.stringify(report));
  db.close();
}

main();
