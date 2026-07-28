/**
 * Reconcilia 20/07/2026 — lista oficial do operador (substitui vendas sintéticas).
 *
 * Fonte: registro real horário · cliente · produto
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const OP_DATE = "2026-07-20";
const BUSINESS_ID = "salgados";
const DEPARTMENT = "ACAL";
const UNIT_PRICE = 5;
const UNIT_COST = 3.75;

const PRODUCT_KEYS = {
  croissant: "Croissant",
  pastel: "Pastel de Frango com Presunto",
  misto: "Misto com Catupiry",
};

/** Lista oficial — ordem cronológica */
const OFFICIAL_SALES = [
  { time: "09:34", client: "Raimunda Raimunda Sousa", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:40", client: "Lucas Moraes", items: [{ product: "pastel", qty: 1 }] },
  { time: "09:50", client: "Vanderson Dias", items: [{ product: "pastel", qty: 2 }] },
  { time: "10:04", client: "Dayanna Kelly Costa Almeida", items: [{ product: "pastel", qty: 1 }] },
  {
    time: "10:48",
    client: "Jackson Mendes Pinheiro",
    items: [{ product: "misto", qty: 2 }],
  },
  {
    time: "10:55",
    client: "Maria Mikelly Monteiro Coutinho",
    items: [{ product: "croissant", qty: 1 }],
    credit: true,
    notes: "Fiado — Mikely — 1 Croissant. Cobrança será realizada posteriormente.",
  },
  {
    time: "12:10",
    client: "Francisca Laize De Oliveira Ribeiro",
    items: [{ product: "croissant", qty: 1 }],
  },
  { time: "15:30", client: "Bruno Medeiros Silva", items: [{ product: "misto", qty: 1 }] },
  { time: "15:30", client: "Leonardo De Sousa Sena", items: [{ product: "misto", qty: 1 }] },
  {
    time: "20:00",
    client: "Henrique",
    items: [{ product: "croissant", qty: 3 }],
    notes: "Venda — Henrique — 3 Croissants (R$ 15,00).",
  },
];

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

function findProducts() {
  const rows = db.prepare("SELECT id, name FROM products WHERE business_id = ?").all(BUSINESS_ID);
  const map = {};
  for (const p of rows) {
    const lower = p.name.toLowerCase();
    if (lower.includes("croissant")) map.croissant = p.id;
    else if (lower.includes("misto")) map.misto = p.id;
    else if (lower.includes("pastel")) map.pastel = p.id;
  }
  for (const key of Object.keys(PRODUCT_KEYS)) {
    if (!map[key]) throw new Error(`Produto não encontrado: ${key}`);
  }
  return map;
}

function ensureClient(tx, name, notes, credit = false) {
  const groups = [
    { canonical: "Vanderson Dias", aliases: ["Francisco Vanderson O Dias"] },
    { canonical: "Dayanna Kelly Costa Almeida", aliases: ["Dayanna Kelly Costa da Silva"] },
    { canonical: "Leonardo De Sousa Sena", aliases: ["Leonardo de Sousa Sena"] },
  ];
  let lookupName = name;
  for (const g of groups) {
    if (g.aliases.includes(name) || g.canonical === name) {
      lookupName = g.canonical;
      break;
    }
  }

  let existing = tx.prepare("SELECT id FROM clients WHERE name = ?").get(lookupName);
  if (!existing) {
    existing = tx.prepare("SELECT id FROM clients WHERE name = ?").get(name);
  }
  if (existing) return existing.id;
  const id = uuidv4();
  const now = new Date().toISOString();
  tx.prepare(
    `INSERT INTO clients (id, business_id, name, sector, company, phone, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
  ).run(id, BUSINESS_ID, lookupName, DEPARTMENT, notes ?? `Cliente — operação Salgados ${OP_DATE}.`, now, now);
  return id;
}

function saleTotals(items) {
  const units = items.reduce((s, i) => s + i.qty, 0);
  const total = UNIT_PRICE * units;
  const cost = UNIT_COST * units;
  return { units, total, cost, profit: total - cost };
}

function insertSale(tx, { saleId, time, clientId, paymentMethod, totals, notes, items, productIds, credit = false }) {
  const now = new Date().toISOString();
  const paymentStatus = credit ? "pending" : "paid";
  const amountReceived = credit ? 0 : totals.total;
  tx.prepare(
    `INSERT INTO sales (id, business_id, date, time, client_id, department, payment_method, payment_status, amount_received, total_amount, total_cost, profit, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    saleId,
    BUSINESS_ID,
    OP_DATE,
    time,
    clientId,
    DEPARTMENT,
    paymentMethod,
    paymentStatus,
    amountReceived,
    totals.total,
    totals.cost,
    totals.profit,
    notes ?? null,
    now,
    now,
  );

  for (const item of items) {
    const productId = productIds[item.product];
    const subtotal = UNIT_PRICE * item.qty;
    const cost = UNIT_COST * item.qty;
    tx.prepare(
      `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      uuidv4(),
      saleId,
      productId,
      item.qty,
      UNIT_PRICE,
      UNIT_COST,
      subtotal,
      subtotal - cost,
    );
  }

  tx.prepare(`INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    uuidv4(),
    saleId,
    paymentMethod,
    amountReceived > 0 ? amountReceived : totals.total,
    now,
  );
}

function recalcSoldQuantities(tx) {
  const products = tx.prepare("SELECT id FROM products WHERE business_id = ?").all(BUSINESS_ID);
  const now = new Date().toISOString();
  for (const p of products) {
    const row = tx
      .prepare(
        `SELECT COALESCE(SUM(si.quantity), 0) as qty
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         WHERE si.product_id = ? AND s.business_id = ?`,
      )
      .get(p.id, BUSINESS_ID);
    tx.prepare("UPDATE products SET sold_quantity = ?, updated_at = ? WHERE id = ?").run(
      row.qty,
      now,
      p.id,
    );
  }
}

function updateDiary(tx) {
  const entityId = `${BUSINESS_ID}:${OP_DATE}`;
  const row = tx.prepare("SELECT id, content FROM notes WHERE entity_id = ?").get(entityId);
  if (!row) return;
  const entry = JSON.parse(row.content);
  entry.observations =
    "Cliente Mikely ficou devendo 1 Croissant. Cobrança será realizada posteriormente.";
  if (entry.sales?.fatherSale) {
    entry.sales.fatherSale.buyerName = "Henrique";
  }
  entry.sales.paidCount = 9;
  entry.sales.creditCount = 1;
  tx.prepare("UPDATE notes SET content = ? WHERE id = ?").run(JSON.stringify(entry), row.id);
}

function main() {
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
      console.log(`Removidas ${oldIds.length} vendas sintéticas.`);
    }

    for (const sale of OFFICIAL_SALES) {
      const clientId = ensureClient(db, sale.client, sale.credit ? sale.notes : undefined, sale.credit);
      const totals = saleTotals(sale.items);
      insertSale(db, {
        saleId: uuidv4(),
        time: sale.time,
        clientId,
        paymentMethod: "pix",
        totals,
        notes: sale.notes ?? `Venda Salgados ${OP_DATE} — ${sale.client}.`,
        items: sale.items,
        productIds,
        credit: sale.credit ?? false,
      });
    }

    recalcSoldQuantities(db);
    updateDiary(db);
  })();

  const summary = db
    .prepare(
      `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as receita
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get(OP_DATE, BUSINESS_ID);

  const detail = db
    .prepare(
      `SELECT s.time, c.name, GROUP_CONCAT(p.name || ' x' || si.quantity) as produtos, s.total_amount
       FROM sales s
       JOIN clients c ON c.id = s.client_id
       JOIN sale_items si ON si.sale_id = s.id
       JOIN products p ON p.id = si.product_id
       WHERE s.date = ? AND s.business_id = ?
       GROUP BY s.id ORDER BY s.time`,
    )
    .all(OP_DATE, BUSINESS_ID);

  console.log("✓ Lista oficial aplicada:", summary);
  console.table(detail);

  const expected = { vendas: 10, receita: 70, units: 14 };
  const units = db
    .prepare(
      `SELECT SUM(si.quantity) as q FROM sale_items si
       JOIN sales s ON s.id = si.sale_id WHERE s.date = ? AND s.business_id = ?`,
    )
    .get(OP_DATE, BUSINESS_ID).q;

  if (summary.vendas !== expected.vendas || summary.receita !== expected.receita || units !== expected.units) {
    console.error("✗ Validação falhou");
    process.exit(1);
  }
  console.log("✓ 10 vendas · 14 unidades · R$ 70,00");
  db.close();
}

main();
