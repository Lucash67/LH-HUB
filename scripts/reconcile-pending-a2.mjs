/**
 * Sprint A.2 — Reconciliação oficial pendências 20/07 → recebimento 21/07
 * Idempotente — seguro reexecutar.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const BUSINESS_ID = "salgados";
const DATE_SALE = "2026-07-20";
const DATE_PAYMENT = "2026-07-21";
const PAYMENT_NOTE = "Pagamento recebido via PIX em 21/07.";
const PAYMENT_TS = `${DATE_PAYMENT}T12:00:00.000Z`;

const RECONCILIATIONS = [
  {
    key: "mikely",
    clientLike: "%Mikelly%",
    saleTime: "10:55",
    cashDescription: "PIX recebido — Maria Mikelly Monteiro Coutinho — venda 20/07/2026",
  },
  {
    key: "anselmo",
    clientLike: "%Anselmo%",
    saleTime: "16:00",
    cashDescription: "PIX recebido — Anselmo Gabriel Freire da Silva — venda 20/07/2026",
  },
];

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

function ensurePaymentDateColumn() {
  const cols = new Set(db.prepare("PRAGMA table_info(sales)").all().map((c) => c.name));
  if (!cols.has("payment_date")) {
    db.exec(`ALTER TABLE sales ADD COLUMN payment_date TEXT`);
    console.log("✓ Coluna payment_date adicionada");
  }
}

function findSale(clientLike, time) {
  return db
    .prepare(
      `SELECT s.id, s.total_amount, s.payment_status, s.amount_received, s.notes, c.name
       FROM sales s JOIN clients c ON c.id = s.client_id
       WHERE s.business_id = ? AND s.date = ? AND c.name LIKE ? AND s.time = ?`,
    )
    .get(BUSINESS_ID, DATE_SALE, clientLike, time);
}

function reconcileSale(config) {
  const sale = findSale(config.clientLike, config.saleTime);
  if (!sale) {
    throw new Error(`Venda não encontrada: ${config.key} (${DATE_SALE} ${config.saleTime})`);
  }

  const now = new Date().toISOString();
  const amount = sale.total_amount;

  db.prepare(
    `UPDATE sales SET
       payment_status = 'paid',
       payment_method = 'pix',
       amount_received = ?,
       payment_date = ?,
       notes = ?,
       updated_at = ?
     WHERE id = ?`,
  ).run(amount, DATE_PAYMENT, PAYMENT_NOTE, now, sale.id);

  const payment = db.prepare(`SELECT id FROM payments WHERE sale_id = ?`).get(sale.id);
  if (payment) {
    db.prepare(`UPDATE payments SET method = 'pix', amount = ?, created_at = ? WHERE sale_id = ?`).run(
      amount,
      PAYMENT_TS,
      sale.id,
    );
  } else {
    db.prepare(
      `INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, 'pix', ?, ?)`,
    ).run(uuidv4(), sale.id, amount, PAYMENT_TS);
  }

  const existingCf = db
    .prepare(`SELECT id FROM cash_flow WHERE date = ? AND description = ?`)
    .get(DATE_PAYMENT, config.cashDescription);

  if (!existingCf) {
    db.prepare(
      `INSERT INTO cash_flow (id, type, category, description, amount, date, created_at)
       VALUES (?, 'income', 'recebimento_venda_anterior', ?, ?, ?, ?)`,
    ).run(uuidv4(), config.cashDescription, amount, DATE_PAYMENT, now);
  }

  console.log(`✓ ${config.key}: venda ${DATE_SALE} · PIX R$ ${amount.toFixed(2)} recebido em ${DATE_PAYMENT}`);
  return sale;
}

function syncDiary20() {
  const entityId = `${BUSINESS_ID}:${DATE_SALE}`;
  const row = db.prepare(`SELECT id, content FROM notes WHERE entity_id = ?`).get(entityId);
  if (!row) return;

  const entry = JSON.parse(row.content);
  entry.revenue = { received: 75, pending: 0, total: 75 };
  entry.quantityLost = 0;
  entry.lossReason = undefined;
  entry.sales = { ...entry.sales, paidCount: 11, creditCount: 0 };
  entry.observations =
    "Dia homologado A.2: 15 comprados, 15 vendidos, 15 pagos. Mikely e Anselmo — PIX recebido em 21/07. Taxa de venda 100%. Taxa de desperdício 0%.";

  db.prepare(`UPDATE notes SET content = ? WHERE id = ?`).run(JSON.stringify(entry), row.id);
  db.prepare(`DELETE FROM operational_losses WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, DATE_SALE);
  console.log("✓ Diário 20/07 sincronizado (0 perdas, R$ 75 recebido)");
}

function verifyDay21Unchanged() {
  const d21 = db
    .prepare(
      `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev,
       SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get("2026-07-21", BUSINESS_ID);

  if (d21.vendas !== 10 || d21.rev !== 60 || d21.pending !== 0) {
    throw new Error(`Dia 21/07 alterado indevidamente: ${JSON.stringify(d21)}`);
  }
  console.log("✓ Dia 21/07 permanece inalterado (10 vendas · R$ 60 · 0 pendentes)");
}

function main() {
  ensurePaymentDateColumn();

  db.transaction(() => {
    for (const config of RECONCILIATIONS) {
      reconcileSale(config);
    }
    syncDiary20();
  })();

  verifyDay21Unchanged();

  const pending20 = db
    .prepare(
      `SELECT COUNT(*) as c FROM sales WHERE date = ? AND business_id = ? AND payment_status = 'pending'`,
    )
    .get(DATE_SALE, BUSINESS_ID).c;

  const cf21 = db
    .prepare(
      `SELECT COUNT(*) as c, ROUND(SUM(amount),2) as total FROM cash_flow
       WHERE date = ? AND category = 'recebimento_venda_anterior'`,
    )
    .get(DATE_PAYMENT);

  console.log(`\n--- Resumo ---`);
  console.log(`Pendentes 20/07: ${pending20}`);
  console.log(`Cash flow 21/07 (recebimentos anteriores): R$ ${cf21.total} (${cf21.c} lançamentos)`);

  if (pending20 !== 0) {
    console.error("✗ Ainda existem pendências em 20/07");
    process.exit(1);
  }
  if (cf21.c !== 2 || cf21.total !== 10) {
    console.error("✗ Cash flow 21/07 incompleto");
    process.exit(1);
  }

  console.log("\n✓ Reconciliação A.2 concluída.");
  db.close();
}

main();
