/**
 * Sprint A.3.2 — Reconstrução histórica oficial 17/07/2026
 * Fonte: ROO-0002 (register-acal-day2-via-api.mjs + reconcile-salgados-clients-history.mjs)
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
const OP_DATE = "2026-07-17";
const UNIT_PRICE = 5;
const INVESTMENT = 42;
const UNIT_COST = INVESTMENT / 12;

const OFFICIAL_SALES = [
  { time: "08:52", client: "Paulo André Cavalcante Oliveira", items: [{ product: "croissant", qty: 1 }] },
  { time: "08:54", client: "Raimunda Raimunda Sousa", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:02", client: "Dayanna Kelly Costa Almeida", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:10", client: "Jackson Mendes Pinheiro", items: [{ product: "croissant", qty: 1 }] },
  { time: "09:10", client: "Gerb da Silva Maganos", items: [{ product: "croissant", qty: 1 }] },
  { time: "09:25", client: "Maria Clara Gomes Mororo", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:47", client: "Ana Letícia Ferreira dos Santos", items: [{ product: "misto", qty: 1 }] },
  { time: "09:55", client: "Maurício de Sá Machado Júnior", items: [{ product: "misto", qty: 1 }] },
  { time: "09:59", client: "Lucas Moraes", items: [{ product: "misto", qty: 1 }] },
  {
    time: "14:58",
    client: "Raimunda Raimunda Sousa",
    items: [{ product: "croissant", qty: 1 }],
    notes: "Segunda compra realizada pelo mesmo cliente no mesmo dia.",
  },
  { time: "15:35", client: "José Inácio Silva da Cruz", items: [{ product: "croissant", qty: 1 }] },
  { time: "15:37", client: "Leonardo De Sousa Sena", items: [{ product: "pastel", qty: 1 }] },
];

const DIARY_17 = {
  version: 1,
  businessId: BUSINESS_ID,
  date: OP_DATE,
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 12,
    investment: INVESTMENT,
    products: [
      { name: "Croissant", quantity: 5 },
      { name: "Pastel de Frango com Presunto", quantity: 4 },
      { name: "Misto com Catupiry", quantity: 3 },
    ],
  },
  sales: { paidCount: 12, creditCount: 0 },
  revenue: { received: 60, pending: 0, total: 60 },
  profit: 18,
  quantitySold: 12,
  quantityLost: 0,
  observations: `ROO-0002 — Segundo dia oficial de operação ACAL (17/07/2026).
Sexta-feira. Primeiro aumento de produção (12 unidades — decisão baseada no dia 16).
Todo estoque vendido novamente. Estoque final: 0 em todos os produtos.
Maior concentração de vendas entre 08:50 e 10:00. Vendas também durante a tarde (14:58–15:37).
Cliente recorrente do dia: Raimunda Raimunda Sousa (2 compras).
Forma de pagamento: 100% PIX.

CONTEXTO FINANCEIRO:
- Receita operacional: R$ 60,00
- Investimento (terceiro — pai do operador): R$ 42,00
- Lucro operacional: R$ 18,00
- Custo unitário: R$ 3,50 · Preço: R$ 5,00 · Margem: 30%
- Operador não realizou desembolso financeiro nesta operação

MOVIMENTAÇÃO EXTRAORDINÁRIA (NÃO pertence ao negócio):
- 13:06 — PIX R$ 2,50 de Fernando Martins Cruz
- Destinado ao negócio de outra colaboradora — não é venda, receita ou lucro ACAL`,
  manualInsights:
    "Manter preço de R$ 5,00. Continuar crescimento gradual da produção. Continuar registrando clientes. Não alterar estratégia com apenas dois dias de histórico.",
  lessonsLearned: `APRENDIZADO 01 — Primeiro aumento de produção (9→12 un) validado — 100% vendido.

APRENDIZADO 02 — Concentração matinal (08:50–10:00) confirmada; vendas vespertinas também ocorrem.

APRENDIZADO 03 — Primeira recorrência intradiária identificada (Raimunda Raimunda Sousa).

APRENDIZADO 04 — Preço R$ 5,00 mantido sem objeções.

APRENDIZADO 05 — 100% PIX mantido.

APRENDIZADO 06 — Dados insuficientes para alterar mix de produção — manter crescimento gradual.

DECISÕES:
- Manter preço R$ 5,00
- Continuar crescimento gradual da produção
- Continuar registrando clientes
- Não alterar estratégia com apenas dois dias de histórico`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "100% do estoque vendido (12 unidades).",
      "Janela principal: 08:52–09:59; vendas vespertinas 14:58–15:37.",
      "Raimunda Raimunda Sousa — primeira recorrência no mesmo dia.",
      "Mix produzido: 5 Croissant, 4 Pastel, 3 Misto.",
    ],
    conclusion:
      "Segundo dia validado. Estratégia de crescimento gradual confirmada. Histórico ainda insuficiente para mudança de mix.",
  },
  suggestedActions: [
    {
      id: "crescimento-gradual",
      title: "Continuar crescimento gradual da produção",
      description: "Manter preço R$ 5,00 e registrar clientes — decisão com base em 2 dias de histórico.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Mix 5+4+3 executado conforme plano do dia 16 — dados insuficientes para favorito.",
      confirmed: null,
    },
  ],
  tags: ["segundo-dia", "roo-0002", "pix-100", "estoque-zerado", "raimunda-recorrente"],
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
  const dest = path.join(dir, `backup-pre-reconstruct-1707-${stamp}.db`);
  fs.copyFileSync(DB_PATH, dest);
  console.log(`✓ Backup: ${dest}`);
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
  const aliases = {
    "Dayanna Kelly Costa da Silva": "Dayanna Kelly Costa Almeida",
    "Leonardo de Sousa Sena": "Leonardo De Sousa Sena",
    "Gerb da Silva": "Gerb da Silva Maganos",
  };
  const lookup = aliases[name] ?? name;

  let row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(lookup);
  if (!row) row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(name);
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

  const exP = db.prepare(`SELECT id FROM daily_purchases WHERE business_id = ? AND date = ?`).get(BUSINESS_ID, entry.date);
  const purchaseId = exP?.id ?? uuidv4();
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
    ).run(uuidv4(), exP?.id ?? purchaseId, line.name, line.quantity, UNIT_COST);
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
       OR (entity_type = 'sale' AND entity_id IN (SELECT id FROM sales WHERE date = ? AND business_id = ?))`,
    )
    .all(OP_DATE, BUSINESS_ID);
  for (const n of legacy) {
    db.prepare("DELETE FROM notes WHERE id = ?").run(n.id);
    stats.legacyNotesRemoved++;
  }
  db.prepare("DELETE FROM notes WHERE entity_id = ? AND entity_type = 'operation_day'").run(OP_DATE);
}

function updateInvestment() {
  const invDesc =
    "Investimento pai do operador — aquisição dos produtos (R$ 42,00). Não desembolsado pela ACAL nem pelo operador. Dia 17/07/2026. Base histórica oficial homologada A.3.2.";
  const inv = db.prepare(`SELECT id FROM investments WHERE business_id = ? AND date = ?`).get(BUSINESS_ID, OP_DATE);
  if (inv) {
    db.prepare(
      `UPDATE investments SET amount = ?, description = ?, type = 'additional', source_type = 'family', source_name = 'Henrique' WHERE id = ?`,
    ).run(INVESTMENT, invDesc, inv.id);
  } else {
    db.prepare(
      `INSERT INTO investments (id, business_id, description, amount, type, date, source_type, source_name, created_at)
       VALUES (?, ?, ?, ?, 'additional', ?, 'family', 'Henrique', ?)`,
    ).run(
      "acal-inv-2026-07-17-42",
      BUSINESS_ID,
      invDesc,
      INVESTMENT,
      OP_DATE,
      new Date().toISOString(),
    );
  }
  stats.investmentUpdated = true;
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

    for (const sale of OFFICIAL_SALES) {
      const clientId = ensureClient(sale.client);
      const totals = saleTotals(sale.items);
      const notes = sale.notes ?? `Venda ACAL ${OP_DATE} — ${sale.client}.`;
      insertSale({
        saleId: uuidv4(),
        time: sale.time,
        clientId,
        totals,
        notes,
        items: sale.items,
        productIds,
      });
    }

    updateInvestment();
    syncDiary(DIARY_17);
    removeLegacyNotes();
  })();

  const summary = db
    .prepare(
      `SELECT COUNT(*) as tx, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit,
       SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get(OP_DATE, BUSINESS_ID);

  console.log("\n=== RECONSTRUÇÃO 17/07 CONCLUÍDA ===");
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
