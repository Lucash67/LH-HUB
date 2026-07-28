/**
 * Hotfix homologação — Reconstrução 21/07/2026 (somente dia 21 + recebimentos)
 * Fonte: rascunho oficial ROO-0002 / register-operation-2107.mjs
 * NÃO altera dias 16, 17, 20.
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
const OP_DATE = "2026-07-21";
const UNIT_PRICE = 5;
const INVESTMENT = 44;
const UNIT_COST = INVESTMENT / 12;

const OFFICIAL_SALES = [
  { time: "09:14", client: "Ana Raquel Lima de Araújo", items: [{ product: "croissant", qty: 1 }, { product: "misto", qty: 1 }] },
  { time: "09:24", client: "Maria Clara Gomes Mororo", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:24", client: "Maria Mikelly Monteiro Coutinho", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:47", client: "Gerb da Silva Maganos", items: [{ product: "misto", qty: 1 }] },
  { time: "09:48", client: "Maria Graziele Santos Oliveira", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:48", client: "Vanderson Dias", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:49", client: "Iury Guilherme", items: [{ product: "croissant", qty: 1 }, { product: "misto", qty: 1 }] },
  { time: "10:03", client: "Dayanna Kelly Costa Almeida", items: [{ product: "misto", qty: 1 }] },
  { time: "11:28", client: "Francisco de Assis Soares Pereira", items: [{ product: "croissant", qty: 1 }] },
  { time: "15:21", client: "Anselmo Gabriel Freire da Silva", items: [{ product: "croissant", qty: 1 }] },
];

const CASH_RECEIPTS_20 = [
  {
    description: "PIX recebido — Maria Mikelly Monteiro Coutinho — venda 20/07/2026",
    amount: 5,
  },
  {
    description: "PIX recebido — Anselmo Gabriel Freire da Silva — venda 20/07/2026",
    amount: 5,
  },
];

const DIARY_21 = {
  version: 1,
  businessId: BUSINESS_ID,
  date: OP_DATE,
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 12,
    investment: INVESTMENT,
    products: [
      { name: "Croissant", quantity: 4 },
      { name: "Pastel de Frango com Presunto", quantity: 4 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: { paidCount: 10, creditCount: 0, unitsSold: 12 },
  revenue: { received: 60, pending: 0, total: 60 },
  profit: 16,
  quantitySold: 12,
  quantityLost: 0,
  observations: `Operação oficial 21/07/2026 (ROO-0002).
Compra: 12 unidades (4 Croissant · 4 Pastel · 4 Misto). Investimento R$ 44,00 (terceiro).
Vendas do dia: 10 transações · 12 unidades · R$ 60,00 receita · R$ 16,00 lucro operacional · margem 26,67%.
100% PIX · 0 pendências · meta atingida.

RECEBIMENTOS DO DIA 20 (NÃO são vendas do dia 21 — apenas liquidação):
• PIX R$ 5,00 — Maria Mikelly Monteiro Coutinho (fiado 20/07)
• PIX R$ 5,00 — Anselmo Gabriel Freire da Silva (venda 20/07)
Esses valores entram apenas como recebimentos (cash_flow), sem alterar receita/lucro/vendas do dia 21.`,
  manualInsights:
    "Demanda forte 08h00–08h30. Terça com demanda alta. Demanda reprimida 15h30–16h00. Boa exposição aumenta conversão.",
  lessonsLearned: `APRENDIZADO 01 — Forte demanda antes do horário de chegada (08h00–08h30).

APRENDIZADO 02 — Coletar contatos gradualmente para encomendas antecipadas.

APRENDIZADO 03 — Salgado considerado perdido no dia anterior foi recuperado — apenas atraso no pagamento.

APRENDIZADO 04 — Produtos precisam ficar mais visíveis para conversão.

APRENDIZADO 05 — Meta matinal: 8–9 unidades até 10h.

APRENDIZADO 06 — Demanda reprimida 15h30–16h00 após esgotar estoque.

APRENDIZADO 07 — Terças mantêm demanda alta mesmo com menos funcionários.`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Demanda matinal 08h00–08h30 não capturada.",
      "Demanda reprimida 15h30–16h00.",
      "Meta matinal: 8–9 un até 10h.",
      "Recebimentos do dia 20 separados das vendas do dia 21.",
    ],
    conclusion: "Antecipar chegada, aumentar compra em dias fortes, separar recebimentos de vendas do dia.",
  },
  suggestedActions: [
    {
      id: "chegar-mais-cedo",
      title: "Antecipar horário de chegada",
      description: "Testar chegada antes das 08h30.",
      status: "planned",
    },
    {
      id: "meta-manha-8-9",
      title: "Meta matinal até 10h",
      description: "8–9 unidades até 10h.",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Geral", hypothesis: "Chegar mais cedo pode aumentar faturamento.", confirmed: null },
  ],
  tags: ["meta-atingida", "demanda-matinal", "recebimentos-2007", "homologado-a32-hotfix"],
};

const stats = {
  salesReplaced: 0,
  clientsCreatedSet: new Set(),
  clientsUpdatedSet: new Set(),
  cashFlowEnsured: 0,
  investmentUpdated: false,
  diaryUpdated: false,
};

const db = new Database(DB_PATH);

function snapshotDays() {
  const dates = ["2026-07-16", "2026-07-17", "2026-07-20", OP_DATE];
  const out = {};
  for (const d of dates) {
    out[d] = db
      .prepare(
        `SELECT COUNT(*) tx, ROUND(SUM(total_amount),2) rev, ROUND(SUM(profit),2) profit
         FROM sales WHERE date=? AND business_id=?`,
      )
      .get(d, BUSINESS_ID);
  }
  return out;
}

function backupDb() {
  const dir = path.join(ROOT, "backups");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dest = path.join(dir, `backup-pre-hotfix-2107-${stamp}.db`);
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
    "Francisco Vanderson": "Vanderson Dias",
    "Francisco Vanderson O Dias": "Vanderson Dias",
    "Gerb da Silva": "Gerb da Silva Maganos",
    "Maria Graziele": "Maria Graziele Santos Oliveira",
    "Leonardo de Sousa Sena": "Leonardo De Sousa Sena",
  };
  const lookup = aliases[name] ?? name;
  let row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(lookup);
  if (!row) row = db.prepare("SELECT id, name FROM clients WHERE name = ?").get(name);
  if (row) {
    stats.clientsUpdatedSet.add(row.id);
    return row.id;
  }
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO clients (id, business_id, name, sector, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, BUSINESS_ID, lookup, DEPARTMENT, `Cliente — operação ${OP_DATE}.`, now, now);
  stats.clientsCreatedSet.add(id);
  return id;
}

function saleTotals(items) {
  const units = items.reduce((s, i) => s + i.qty, 0);
  const total = UNIT_PRICE * units;
  const cost = (INVESTMENT * units) / 12;
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
    const cost = (INVESTMENT * item.qty) / 12;
    db.prepare(
      `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      saleId,
      productIds[item.product],
      item.qty,
      UNIT_PRICE,
      cost / item.qty,
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
  const existing = db.prepare(`SELECT id FROM notes WHERE entity_type='operational_diary' AND entity_id=?`).get(entityId);
  if (existing) {
    db.prepare(`UPDATE notes SET content=? WHERE id=?`).run(content, existing.id);
  } else {
    db.prepare(
      `INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, 'operational_diary', ?, ?, ?)`,
    ).run(uuidv4(), entityId, content, now);
  }
  stats.diaryUpdated = true;

  const exP = db.prepare(`SELECT id FROM daily_purchases WHERE business_id=? AND date=?`).get(BUSINESS_ID, entry.date);
  const purchaseId = exP?.id ?? uuidv4();
  if (exP) {
    db.prepare(`UPDATE daily_purchases SET total_units=?, investment=?, updated_at=? WHERE id=?`).run(
      entry.purchase.totalUnits,
      entry.purchase.investment,
      now,
      exP.id,
    );
    db.prepare(`DELETE FROM daily_purchase_items WHERE purchase_id=?`).run(exP.id);
  } else {
    db.prepare(
      `INSERT INTO daily_purchases (id, business_id, date, total_units, investment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(purchaseId, BUSINESS_ID, entry.date, entry.purchase.totalUnits, entry.purchase.investment, now, now);
  }
  for (const line of entry.purchase.products) {
    db.prepare(
      `INSERT INTO daily_purchase_items (id, purchase_id, product_name, quantity, unit_cost)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(uuidv4(), exP?.id ?? purchaseId, line.name, line.quantity, UNIT_COST);
  }

  db.prepare(`DELETE FROM operational_lessons WHERE business_id=? AND date=?`).run(BUSINESS_ID, entry.date);
  db.prepare(
    `INSERT INTO operational_lessons (id, business_id, date, content, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(uuidv4(), BUSINESS_ID, entry.date, entry.lessonsLearned, JSON.stringify(entry.tags ?? []), now, now);
}

function ensureCashReceipts() {
  const now = new Date().toISOString();
  for (const r of CASH_RECEIPTS_20) {
    const exists = db.prepare(`SELECT id FROM cash_flow WHERE date=? AND description=?`).get(OP_DATE, r.description);
    if (!exists) {
      db.prepare(
        `INSERT INTO cash_flow (id, type, category, description, amount, date, created_at)
         VALUES (?, 'income', 'recebimento_venda_anterior', ?, ?, ?, ?)`,
      ).run(uuidv4(), r.description, r.amount, OP_DATE, now);
      stats.cashFlowEnsured++;
    }
  }
}

function updateInvestment() {
  const desc =
    "Investimento pai do operador — aquisição dos produtos (R$ 44,00). Não desembolsado pela ACAL nem pelo operador. Dia 21/07/2026. Homologado hotfix A.3.2.";
  const inv = db.prepare(`SELECT id FROM investments WHERE business_id=? AND date=?`).get(BUSINESS_ID, OP_DATE);
  if (inv) {
    db.prepare(
      `UPDATE investments SET amount=?, description=?, source_type='family', source_name='Henrique' WHERE id=?`,
    ).run(INVESTMENT, desc, inv.id);
  } else {
    db.prepare(
      `INSERT INTO investments (id, business_id, description, amount, type, date, source_type, source_name, created_at)
       VALUES (?, ?, ?, ?, 'additional', ?, 'family', 'Henrique', ?)`,
    ).run(uuidv4(), BUSINESS_ID, desc, INVESTMENT, OP_DATE, new Date().toISOString());
  }
  stats.investmentUpdated = true;
}

function main() {
  const before = snapshotDays();
  backupDb();
  const productIds = findProducts();

  db.transaction(() => {
    const oldIds = db
      .prepare(`SELECT id FROM sales WHERE date=? AND business_id=?`)
      .all(OP_DATE, BUSINESS_ID)
      .map((r) => r.id);
    if (oldIds.length) {
      const ph = oldIds.map(() => "?").join(",");
      db.prepare(`DELETE FROM payments WHERE sale_id IN (${ph})`).run(...oldIds);
      db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${ph})`).run(...oldIds);
      db.prepare(`DELETE FROM sales WHERE id IN (${ph})`).run(...oldIds);
      stats.salesReplaced = oldIds.length;
    }

    for (const sale of OFFICIAL_SALES) {
      const clientId = ensureClient(sale.client);
      const totals = saleTotals(sale.items);
      insertSale({
        saleId: uuidv4(),
        time: sale.time,
        clientId,
        totals,
        notes: `Venda oficial ${OP_DATE} — ${sale.client} às ${sale.time}.`,
        items: sale.items,
        productIds,
      });
    }

    ensureCashReceipts();
    updateInvestment();
    syncDiary(DIARY_21);
  })();

  const after = snapshotDays();
  console.log("\n=== HOTFIX 21/07 CONCLUÍDO ===");
  console.log("Antes:", before);
  console.log("Depois:", after);
  console.log(
    JSON.stringify({
      ...stats,
      clientsCreated: stats.clientsCreatedSet.size,
      clientsUpdated: stats.clientsUpdatedSet.size,
    }),
  );
  db.close();
}

main();
