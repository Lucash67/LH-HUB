/**
 * Enriquecimento do primeiro dia operacional ACAL — 16/07/2026
 *
 * Converte 3 vendas agregadas em 8 transações reais, preservando:
 * - Receita total: R$ 45,00
 * - Investimento: R$ 31,50
 * - Estoque final: 0 (9 unidades vendidas)
 *
 * Não executa seed. Não altera valores financeiros.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const OP_DATE = "2026-07-16";
const DEPARTMENT = "ACAL";
const UNIT_PRICE = 5;
const UNIT_COST = 0;

const PRODUCT_NAMES = {
  croissant: "Croissant",
  misto: "Misto com Catupiry",
  pastel: "Pastel de Frango com Presunto",
};

const CLIENTS = [
  "Diego Martins Pinheiro",
  "Francisco Ricardo Feijão Pinho",
  "Germana Nataeli de Oliveira",
  "Daniele Gomes Silva",
  "Maria Graziele Santos Oliveira",
  "Francisco Vanderson O Dias",
  "Maria Mikelly Monteiro Coutinho",
  "Dayanna Kelly Costa da Silva",
];

const GERMANA_SALE_NOTES = `Primeira venda múltipla do dia.
Pagador: Germana Nataeli de Oliveira.
Consumidoras: Germana Nataeli de Oliveira e Consumidora ainda não identificada.
A segunda consumidora será identificada futuramente — não cadastrada como cliente definitivo.`;

const OPERATIONAL_DIARY = `DIÁRIO OPERACIONAL — Primeiro dia oficial da ACAL (16/07/2026)

Objetivo: Validar aceitação dos salgados.
Resultado: 100% do estoque vendido (9 unidades).
Tempo para esgotar estoque: 47 minutos (09:09 às 09:56).
Janela operacional: 09:09 às 09:56.
Forma de pagamento: 100% PIX.
Nenhuma sobra. Nenhum desconto solicitado.
Primeira compra múltipla registrada (Germana — 2 consumidoras).

INDICADORES OPERACIONAIS:
- Estoque inicial: 9 unidades (3 Croissant, 3 Misto com Catupiry, 3 Pastel de Frango com Presunto)
- Estoque final: 0
- Taxa de venda: 100%
- Tempo para vender todo o estoque: 47 minutos

CONTEXTO FINANCEIRO (preservado):
- Receita: R$ 45,00
- Investimento pai do operador: R$ 31,50 (terceiro — não desembolso do operador)
- Resultado financeiro pessoal do operador: R$ 45,00
- Operador não realizou desembolso financeiro nesta operação

APRENDIZADOS:
• Preço de R$ 5,00 aceito sem objeções
• Nenhum pedido de desconto
• Nenhum pedido para pagar depois
• Todos os pagamentos via PIX
• Estoque inicial adequado
• Estratégia de começar pequeno mostrou-se correta
• Ainda não existem dados suficientes para concluir qual produto possui maior demanda

DECISÃO ESTRATÉGICA (final do dia):
Aumentar gradualmente a produção para o dia seguinte (17/07/2026):
- 5 Croissants
- 4 Pastéis de Frango com Presunto
- 3 Mistos com Catupiry
Total: 12 unidades.
Decisão baseada exclusivamente nos dados do primeiro dia.

Supervisora Nay autorizou o início. Comercialização apenas salgados (doces sob responsabilidade de Ana — não vendidos).`;

const ARCHITECTURE_REQUIREMENT = `REQUISITO FUNCIONAL FUTURO — identificado em operação real ACAL 16/07/2026

Separação entre PAGADOR e CONSUMIDOR.

O sistema NÃO deve assumir que quem paga é necessariamente quem consome.

Evidência operacional: venda das 09:14 — Germana Nataeli de Oliveira pagou por duas consumidoras.

Não implementar agora. Registrar como requisito oficial para evolução da modelagem.`;

const SALES = [
  { time: "09:09", client: "Diego Martins Pinheiro", product: "croissant", qty: 1 },
  { time: "09:09", client: "Francisco Ricardo Feijão Pinho", product: "misto", qty: 1 },
  {
    time: "09:14",
    client: "Germana Nataeli de Oliveira",
    product: "pastel",
    qty: 2,
    notes: GERMANA_SALE_NOTES,
  },
  { time: "09:16", client: "Daniele Gomes Silva", product: "misto", qty: 1 },
  { time: "09:26", client: "Maria Graziele Santos Oliveira", product: "croissant", qty: 1 },
  { time: "09:29", client: "Francisco Vanderson O Dias", product: "croissant", qty: 1 },
  { time: "09:55", client: "Maria Mikelly Monteiro Coutinho", product: "pastel", qty: 1 },
  { time: "09:56", client: "Dayanna Kelly Costa da Silva", product: "misto", qty: 1 },
];

function upsertSetting(db, key, value, now) {
  const existing = db.prepare("SELECT key FROM settings WHERE key = ?").get(key);
  if (existing) {
    db.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = ?").run(value, now, key);
  } else {
    db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)").run(key, value, now);
  }
}

function main() {
  const dbPath = path.join(process.cwd(), "data", "lucas-business-os.db");
  if (!fs.existsSync(dbPath)) {
    throw new Error("Banco não encontrado. Execute o sistema antes.");
  }

  const db = new Database(dbPath);
  const now = new Date().toISOString();

  const before = {
    salesCount: db.prepare("SELECT COUNT(*) as c FROM sales WHERE date = ?").get(OP_DATE).c,
    revenue: db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM sales WHERE date = ?").get(OP_DATE).s,
    investment: db.prepare("SELECT amount FROM investments WHERE date = ?").get(OP_DATE)?.amount ?? 0,
    clients: db.prepare("SELECT COUNT(*) as c FROM clients").get().c,
  };

  if (before.salesCount !== 3 || before.revenue !== 45) {
    throw new Error(
      `Estado inesperado: ${before.salesCount} vendas, R$ ${before.revenue}. Esperado: 3 vendas, R$ 45,00.`,
    );
  }
  if (before.investment !== 31.5) {
    throw new Error(`Investimento inesperado: R$ ${before.investment}. Esperado: R$ 31,50.`);
  }

  const products = db.prepare("SELECT id, name FROM products").all();
  const productByKey = {};
  for (const p of products) {
    const lower = p.name.toLowerCase();
    if (lower.includes("croissant")) productByKey.croissant = p.id;
    else if (lower.includes("misto")) productByKey.misto = p.id;
    else if (lower.includes("pastel")) productByKey.pastel = p.id;
  }
  for (const key of Object.keys(PRODUCT_NAMES)) {
    if (!productByKey[key]) {
      throw new Error(`Produto não encontrado para chave: ${key}`);
    }
  }

  const firstSaleId = db.transaction(() => {
    for (const [key, name] of Object.entries(PRODUCT_NAMES)) {
      db.prepare("UPDATE products SET name = ?, updated_at = ? WHERE id = ?").run(
        name,
        now,
        productByKey[key],
      );
    }

    const oldSaleIds = db.prepare("SELECT id FROM sales WHERE date = ?").all(OP_DATE).map((r) => r.id);
    if (oldSaleIds.length > 0) {
      const placeholders = oldSaleIds.map(() => "?").join(",");
      db.prepare(`DELETE FROM notes WHERE entity_type = 'sale' AND entity_id IN (${placeholders})`).run(
        ...oldSaleIds,
      );
    }
    db.prepare("DELETE FROM sales WHERE date = ?").run(OP_DATE);

    const clientIds = {};
    for (const name of CLIENTS) {
      const id = uuidv4();
      db.prepare(
        `INSERT INTO clients (id, name, sector, company, phone, notes, created_at, updated_at)
         VALUES (?, ?, ?, NULL, NULL, ?, ?, ?)`,
      ).run(id, name, DEPARTMENT, `Cliente identificado — operação ACAL ${OP_DATE}.`, now, now);
      clientIds[name] = id;
    }

    let firstId = null;
    for (let i = 0; i < SALES.length; i++) {
      const sale = SALES[i];
      const saleId = uuidv4();
      const itemId = uuidv4();
      const paymentId = uuidv4();
      const productId = productByKey[sale.product];
      const subtotal = UNIT_PRICE * sale.qty;
      const cost = UNIT_COST * sale.qty;
      const profit = subtotal - cost;
      const clientId = clientIds[sale.client];
      const notes =
        i === 0
          ? `${OPERATIONAL_DIARY}\n\n---\n\nVenda: ${sale.client} — ${PRODUCT_NAMES[sale.product]} (${sale.qty} un.) às ${sale.time}.`
          : (sale.notes ??
            `Venda ACAL ${OP_DATE} — ${sale.client} — ${PRODUCT_NAMES[sale.product]} (${sale.qty} un.) às ${sale.time}.`);

      db.prepare(
        `INSERT INTO sales (id, date, time, client_id, department, payment_method, total_amount, total_cost, profit, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pix', ?, ?, ?, ?, ?, ?)`,
      ).run(
        saleId,
        OP_DATE,
        sale.time,
        clientId,
        DEPARTMENT,
        subtotal,
        cost,
        profit,
        notes,
        now,
        now,
      );

      db.prepare(
        `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(itemId, saleId, productId, sale.qty, UNIT_PRICE, UNIT_COST, subtotal, profit);

      db.prepare(
        `INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, 'pix', ?, ?)`,
      ).run(paymentId, saleId, subtotal, now);

      if (i === 0) firstId = saleId;
    }

    db.prepare(
      `UPDATE investments SET description = ?, created_at = created_at WHERE date = ? AND amount = 31.5`,
    ).run(
      "Investimento pai do operador — aquisição dos produtos (R$ 31,50). Não desembolsado pela ACAL nem pelo operador. Dia 16/07/2026. Base histórica oficial.",
      OP_DATE,
    );

    db.prepare(
      `INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(uuidv4(), "operation_day", OP_DATE, OPERATIONAL_DIARY, now);

    db.prepare(
      `INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(uuidv4(), "sale", firstId, OPERATIONAL_DIARY, now);

    db.prepare(
      `INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(uuidv4(), "requirement", "payer_consumer_separation", ARCHITECTURE_REQUIREMENT, now);

    upsertSetting(
      db,
      "acal.2026-07-16.indicators",
      JSON.stringify({
        initialStock: 9,
        finalStock: 0,
        sellThroughRate: 100,
        minutesToSellOut: 47,
        operationalWindow: "09:09-09:56",
        paymentMix: { pix: 100, card: 0, cash: 0 },
        firstMultiConsumerSale: "09:14 Germana Nataeli de Oliveira",
      }),
      now,
    );

    upsertSetting(
      db,
      "acal.2026-07-16.decision_day2_production",
      JSON.stringify({
        date: "2026-07-17",
        croissant: 5,
        pastel: 4,
        misto: 3,
        total: 12,
        basis: "Dados exclusivos do primeiro dia operacional",
      }),
      now,
    );

    upsertSetting(db, "requirement.payer_consumer_separation", ARCHITECTURE_REQUIREMENT, now);

    return firstId;
  })();

  const after = {
    salesCount: db.prepare("SELECT COUNT(*) as c FROM sales WHERE date = ?").get(OP_DATE).c,
    revenue: db.prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM sales WHERE date = ?").get(OP_DATE).s,
    investment: db.prepare("SELECT amount FROM investments WHERE date = ?").get(OP_DATE)?.amount ?? 0,
    clients: db.prepare("SELECT COUNT(*) as c FROM clients").get().c,
    pixSales: db.prepare("SELECT COUNT(*) as c FROM sales WHERE date = ? AND payment_method = 'pix'").get(OP_DATE)
      .c,
    stock: db.prepare("SELECT COALESCE(SUM(stock_quantity), 0) as s FROM products").get().s,
    soldQty: db.prepare("SELECT COALESCE(SUM(sold_quantity), 0) as s FROM products").get().s,
    notes: db.prepare("SELECT COUNT(*) as c FROM notes").get().c,
    settings: db.prepare("SELECT COUNT(*) as c FROM settings").get().c,
  };

  const times = db
    .prepare(
      `SELECT s.time, c.name, s.total_amount, p.name as product, s.payment_method
       FROM sales s
       JOIN clients c ON c.id = s.client_id
       JOIN sale_items si ON si.sale_id = s.id
       JOIN products p ON p.id = si.product_id
       WHERE s.date = ?
       ORDER BY s.time, c.name`,
    )
    .all(OP_DATE);

  db.close();

  console.log("=== ENRIQUECIMENTO ACAL 16/07/2026 ===");
  console.log("Antes:", before);
  console.log("Depois:", after);
  console.log("\n=== CRONOLOGIA ===");
  for (const row of times) {
    console.log(`${row.time} | ${row.name} | ${row.product} | R$ ${row.total_amount} | ${row.payment_method}`);
  }

  const ok =
    after.salesCount === 8 &&
    after.revenue === 45 &&
    after.investment === 31.5 &&
    after.clients === 8 &&
    after.pixSales === 8 &&
    after.stock === 0 &&
    after.soldQty === 9;

  if (!ok) {
    throw new Error("Validação pós-enriquecimento falhou.");
  }

  console.log("\n✓ ENRIQUECIMENTO_CONCLUIDO");
  console.log(`Primeira venda (diário): ${firstSaleId}`);
}

main();
