/**
 * Hotfix homologação — Reconstrução 20/07/2026 (somente dia 20)
 * Fonte: rascunho oficial operador + reconcile-salgados-clients-history.mjs
 * NÃO altera dias 16, 17, 21.
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
const OP_DATE = "2026-07-20";
const PAYMENT_DATE_21 = "2026-07-21";
const UNIT_PRICE = 5;
const INVESTMENT = 52.5;

const OFFICIAL_SALES = [
  { time: "09:34", client: "Raimunda Raimunda Sousa", items: [{ product: "pastel", qty: 1 }], paidSameDay: true },
  { time: "09:40", client: "Lucas Moraes", items: [{ product: "pastel", qty: 1 }], paidSameDay: true },
  { time: "09:50", client: "Vanderson Dias", items: [{ product: "pastel", qty: 2 }], paidSameDay: true },
  { time: "10:04", client: "Dayanna Kelly Costa Almeida", items: [{ product: "pastel", qty: 1 }], paidSameDay: true },
  { time: "10:48", client: "Jackson Mendes Pinheiro", items: [{ product: "misto", qty: 2 }], paidSameDay: true },
  {
    time: "00:00",
    client: "Maria Mikelly Monteiro Coutinho",
    items: [{ product: "croissant", qty: 1 }],
    paidSameDay: false,
    notes: "FIADO — horário não registrado oficialmente. PIX recebido em 21/07/2026.",
  },
  { time: "12:10", client: "Francisca Laize De Oliveira Ribeiro", items: [{ product: "croissant", qty: 1 }], paidSameDay: true },
  { time: "15:30", client: "Bruno Medeiros Silva", items: [{ product: "misto", qty: 1 }], paidSameDay: true },
  { time: "15:30", client: "Leonardo De Sousa Sena", items: [{ product: "misto", qty: 1 }], paidSameDay: true },
  {
    time: "00:00",
    client: "Anselmo Gabriel Freire da Silva",
    items: [{ product: "croissant", qty: 1 }],
    paidSameDay: false,
    notes: "Consumo em 20/07/2026 — salgado antes considerado perdido. PIX recebido em 21/07/2026.",
  },
  {
    time: "21:00",
    client: "Henrique",
    items: [{ product: "croissant", qty: 3 }],
    paidSameDay: true,
    notes: "Compra das sobras do dia — 3 Croissants.",
  },
];

const CASH_RECEIPTS_ON_21 = [
  {
    description: "PIX recebido — Maria Mikelly Monteiro Coutinho — venda 20/07/2026",
    amount: 5,
  },
  {
    description: "PIX recebido — Anselmo Gabriel Freire da Silva — venda 20/07/2026",
    amount: 5,
  },
];

const DIARY_20 = {
  version: 1,
  businessId: BUSINESS_ID,
  date: OP_DATE,
  dailyGoalUnits: 15,
  purchase: {
    totalUnits: 15,
    investment: INVESTMENT,
    products: [
      { name: "Croissant", quantity: 6 },
      { name: "Pastel de Frango com Presunto", quantity: 5 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: { paidCount: 11, creditCount: 0, fatherSale: { units: 3, amount: 15, buyerName: "Henrique" } },
  revenue: { received: 75, pending: 0, total: 75 },
  profit: 22.5,
  quantitySold: 15,
  quantityLost: 0,
  observations: `Operação oficial 20/07/2026.
Compra: 15 unidades (6 Croissant · 5 Pastel · 4 Misto) · Investimento R$ 52,50.
Meta: 15 unidades · Resultado: 15 unidades destinadas · 0 perdas.

Distribuição: 11 unidades vendidas no expediente + 1 fiado (Mikely) + 3 sobras (Henrique 21:00).
Restaram 3 salgados ao final — comprados por Henrique.

Mikely: fiado em 20/07 · PIX recebido 21/07 (cash_flow — não altera receita do dia 21).
Anselmo: consumo 20/07 · PIX recebido 21/07 (venda 20/07 — não altera receita do dia 21).

Receita R$ 75 · Lucro operacional R$ 22,50 · Margem 30%.`,
  manualInsights:
    "Pastel esgotou rápido. Placa/QR sem preço visível gera atrito. Atraso no pagamento ≠ perda operacional.",
  lessonsLearned: `APRENDIZADO 01 — Preço não visível na placa (só QR Code zerado).

APRENDIZADO 02 — Pastel tornou-se sabor de maior saída.

APRENDIZADO 03 — Croissant abaixo do esperado no expediente; Henrique comprou 3 sobras às 21:00.

APRENDIZADO 04 — Misto com Catupiry em crescimento.

APRENDIZADO 05 — Fiado/atraso de pagamento não equivale a perda (Mikely + Anselmo).

APRENDIZADO 06 — Mix 6+5+4 validado para meta de 15 unidades.`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "15 unidades compradas e 15 destinadas — 0 desperdício real.",
      "3 sobras vendidas a Henrique às 21:00.",
      "Mikely fiado · Anselmo pago em 21/07.",
      "Placa precisa exibir preço R$ 5,00.",
    ],
    conclusion: "Meta atingida. Pagamentos atrasados reconciliados sem perda operacional.",
  },
  suggestedActions: [
    {
      id: "placa-qrcode-v2",
      title: "Nova placa com QR Code e preço visível",
      description: "QR Code + valor R$ 5,00 + sabores + Pix pré-preenchido.",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Pastel", hypothesis: "Maior saída do dia.", confirmed: null },
    { flavor: "Croissant", hypothesis: "Desempenho inferior no expediente; sobras vendidas 21:00.", confirmed: null },
    { flavor: "Misto com Catupiry", hypothesis: "Crescimento vs semana anterior.", confirmed: null },
  ],
  tags: ["meta-atingida", "fiado-mikely", "anselmo-recuperado", "sobras-henrique", "homologado-hotfix-2007"],
};

const stats = {
  salesReplaced: 0,
  clientsCreatedSet: new Set(),
  clientsUpdatedSet: new Set(),
  investmentUpdated: false,
  diaryUpdated: false,
  cashFlowEnsured: 0,
};

const db = new Database(DB_PATH);

function snapshotDays() {
  const dates = ["2026-07-16", "2026-07-17", OP_DATE, "2026-07-21"];
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
  const dest = path.join(dir, `backup-pre-hotfix-2007-${stamp}.db`);
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
    "Dona Raimunda": "Raimunda Raimunda Sousa",
    "Lucas": "Lucas Moraes",
    "Francisco Vanderson": "Vanderson Dias",
    "Francisco Vanderson O Dias": "Vanderson Dias",
    "Dayanna Kelly": "Dayanna Kelly Costa Almeida",
    "Laize": "Francisca Laize De Oliveira Ribeiro",
    "Bruno Medeiros": "Bruno Medeiros Silva",
    "Leonardo de Sousa Sena": "Leonardo De Sousa Sena",
    Mikely: "Maria Mikelly Monteiro Coutinho",
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
  const cost = (INVESTMENT * units) / 15;
  return { units, total, cost, profit: total - cost };
}

function insertSale({ saleId, time, clientId, totals, notes, items, productIds, paidSameDay }) {
  const now = new Date().toISOString();
  const paymentDate = paidSameDay ? OP_DATE : PAYMENT_DATE_21;
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
    paymentDate,
    totals.total,
    totals.cost,
    totals.profit,
    notes ?? null,
    now,
    now,
  );
  for (const item of items) {
    const subtotal = UNIT_PRICE * item.qty;
    const cost = (INVESTMENT * item.qty) / 15;
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
    `${paymentDate}T12:00:00.000Z`,
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
    ).run(uuidv4(), exP?.id ?? purchaseId, line.name, line.quantity, INVESTMENT / 15);
  }

  db.prepare(`DELETE FROM operational_losses WHERE business_id=? AND date=?`).run(BUSINESS_ID, entry.date);
  db.prepare(`DELETE FROM operational_lessons WHERE business_id=? AND date=?`).run(BUSINESS_ID, entry.date);
  db.prepare(
    `INSERT INTO operational_lessons (id, business_id, date, content, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(uuidv4(), BUSINESS_ID, entry.date, entry.lessonsLearned, JSON.stringify(entry.tags ?? []), now, now);
}

function ensureCashReceiptsOn21() {
  const now = new Date().toISOString();
  for (const r of CASH_RECEIPTS_ON_21) {
    const exists = db.prepare(`SELECT id FROM cash_flow WHERE date=? AND description=?`).get(PAYMENT_DATE_21, r.description);
    if (!exists) {
      db.prepare(
        `INSERT INTO cash_flow (id, type, category, description, amount, date, created_at)
         VALUES (?, 'income', 'recebimento_venda_anterior', ?, ?, ?, ?)`,
      ).run(uuidv4(), r.description, r.amount, PAYMENT_DATE_21, now);
      stats.cashFlowEnsured++;
    }
  }
}

function updateInvestment() {
  const desc =
    "Investimento pai do operador — aquisição dos produtos (R$ 52,50). 15 unidades (6 Croissant · 5 Pastel · 4 Misto). Dia 20/07/2026. Homologado hotfix.";
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
        notes: sale.notes ?? `Venda oficial ${OP_DATE} — ${sale.client} às ${sale.time}.`,
        items: sale.items,
        productIds,
        paidSameDay: sale.paidSameDay,
      });
    }

    ensureCashReceiptsOn21();
    updateInvestment();
    syncDiary(DIARY_20);
  })();

  const after = snapshotDays();
  console.log("\n=== HOTFIX 20/07 CONCLUÍDO ===");
  console.log("Antes:", before);
  console.log("Depois:", after);
  console.log(
    JSON.stringify({
      salesReplaced: stats.salesReplaced,
      clientsCreated: stats.clientsCreatedSet.size,
      clientsUpdated: stats.clientsUpdatedSet.size,
      investmentUpdated: stats.investmentUpdated,
      diaryUpdated: stats.diaryUpdated,
      cashFlowEnsured: stats.cashFlowEnsured,
    }),
  );
  db.close();
}

main();
