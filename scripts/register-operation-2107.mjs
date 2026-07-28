/**
 * Operação 21/07/2026 — reconcilia 20/07 e registra dia 21 completo.
 * Idempotente — seguro reexecutar (remove e recria vendas do dia 21).
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const BUSINESS_ID = "salgados";
const DEPARTMENT = "ACAL";
const UNIT_PRICE = 5;
const UNIT_COST_20 = 3.75;
const UNIT_COST_21 = 44 / 12;

const DATE_20 = "2026-07-20";
const DATE_21 = "2026-07-21";

const PRODUCT_KEYS = {
  croissant: "Croissant",
  pastel: "Pastel de Frango com Presunto",
  misto: "Misto com Catupiry",
};

const IDENTITY_GROUPS = [
  { canonical: "Vanderson Dias", aliases: ["Francisco Vanderson O Dias", "Francisco Vanderson"] },
  { canonical: "Dayanna Kelly Costa Almeida", aliases: ["Dayanna Kelly Costa da Silva"] },
  { canonical: "Maria Mikelly Monteiro Coutinho", aliases: ["Mikely", "Maria Mikelly"] },
  { canonical: "Gerb da Silva Maganos", aliases: ["Gerb da Silva"] },
  { canonical: "Maria Graziele Santos Oliveira", aliases: ["Maria Graziele"] },
];

const SALES_21 = [
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

const DIARY_20_CORRECTED = {
  version: 1,
  businessId: BUSINESS_ID,
  date: DATE_20,
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
  sales: { paidCount: 11, creditCount: 0, fatherSale: { units: 3, amount: 15, buyerName: "Henrique" } },
  revenue: { received: 75, pending: 0, total: 75 },
  profit: 18.75,
  quantitySold: 15,
  quantityLost: 0,
  observations:
    "Reconciliação 21/07: Mikely quitou fiado (PIX R$ 5,00). Anselmo Gabriel Freire da Silva — unidade antes considerada perdida foi vendida; pagamento PIX recebido em 21/07. Dia encerrado: 15 comprados, 15 vendidos, 15 pagos. Taxa de venda 100%. Taxa de desperdício 0%.",
  manualInsights:
    "Pastel esgotou rapidamente. Croissant apresentou desempenho inferior ao esperado. Misto com Catupiry apresentou crescimento em relação à semana anterior. Divergência de pagamento não implica perda operacional.",
  lessonsLearned:
    "O preço não estava visível. Clientes perguntaram antes de comprar. Uma placa mais clara pode aumentar a conversão. A demanda dos sabores mudou em relação à semana passada — necessário acompanhar tendência por mais dias antes de alterar permanentemente o mix. Atraso no pagamento não deve ser registrado como perda.",
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Pessoas perguntaram o preço antes de comprar.",
      "A placa atual possui apenas o QR Code.",
      "O QR Code abre com valor zerado.",
      "Isso gera dúvida durante a compra.",
      "Unidade considerada perdida foi vendida — divergência foi apenas atraso no pagamento.",
    ],
    conclusion: "Existe atrito no processo de venda. Fiado e atraso de pagamento não equivalem a perda.",
  },
  suggestedActions: [
    {
      id: "placa-qrcode-v2",
      title: "Nova placa com QR Code e preço visível",
      description:
        "Criar placa contendo: QR Code, valor unitário, sabores disponíveis, mensagem chamativa e Pix pré-preenchido com R$ 5,00.",
      status: "planned",
    },
  ],
  productHypotheses: [
    { flavor: "Pastel", hypothesis: "Pastel tornou-se o sabor de maior saída.", confirmed: null },
    { flavor: "Croissant", hypothesis: "Croissant perdeu força.", confirmed: null },
    { flavor: "Misto com Catupiry", hypothesis: "Misto com Catupiry apresentou crescimento.", confirmed: null },
  ],
  tags: ["atrato-venda", "placa", "qrcode", "mix-produtos", "meta-atingida", "reconciliacao-pagamento"],
};

const DIARY_21 = {
  version: 1,
  businessId: BUSINESS_ID,
  date: DATE_21,
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: 12,
    investment: 44,
    products: [
      { name: "Croissant", quantity: 4 },
      { name: "Pastel", quantity: 4 },
      { name: "Misto com Catupiry", quantity: 4 },
    ],
  },
  sales: { paidCount: 10, creditCount: 0 },
  revenue: { received: 60, pending: 0, total: 60 },
  profit: 16,
  quantitySold: 12,
  quantityLost: 0,
  observations: `Segundo dia oficial de operação real — Projeto Salgados (21/07/2026).
Compra: 12 unidades · Investimento R$ 44,00 (4 Croissant, 4 Pastel, 4 Misto com Catupiry).
Meta: vender todas as unidades. Resultado: meta atingida — 12 vendidos, 12 pagos.
Recebimentos de pendências do dia 20/07: PIX R$ 5,00 Maria Mikelly Monteiro Coutinho · PIX R$ 5,00 Anselmo Gabriel Freire da Silva (referente à venda de 20/07).
Nenhum PIX pendente ao final do dia.`,
  manualInsights:
    "Demanda forte antes do horário de chegada (08h00–08h30). Terças e quintas com menos funcionários, mas demanda permaneceu alta. Estoque esgotado antes das 15h30 — clientes ainda procuraram produtos entre 15h30 e 16h00 (demanda reprimida). Boa exposição dos produtos aumenta conversão.",
  lessonsLearned: `APRENDIZADO 01 — Existe forte demanda antes do horário atual de chegada. Colaboradores procuram salgados entre 08h00 e 08h30. Como a operação inicia mais tarde, vendas estão sendo perdidas. Hipótese operacional: chegar mais cedo pode aumentar significativamente o faturamento diário.

APRENDIZADO 02 — Começar a construir relacionamento com clientes. Recomendação: coletar gradualmente contatos dos clientes. Objetivo: permitir encomendas antecipadas e criar demanda antes mesmo da compra.

APRENDIZADO 03 — O salgado considerado perdido no dia anterior foi recuperado. Não houve perda operacional. A divergência ocorreu apenas por atraso no pagamento.

APRENDIZADO 04 — Produtos precisam ficar mais visíveis. Boa exposição aumenta conversão. Clientes novos observam antes de comprar. Clientes recorrentes procuram imediatamente seus sabores favoritos.

APRENDIZADO 05 — Meta operacional: até 10h da manhã, vender entre 8 e 9 unidades. Registrar esta meta para futuras análises.

APRENDIZADO 06 — Foi identificada demanda reprimida às 15h30–16h00. Mesmo com estoque encerrado, clientes ainda procuraram produtos. Existe oportunidade de aumentar quantidade comprada, especialmente em dias de maior movimento.

APRENDIZADO 07 — Terças e quintas possuem menos funcionários presenciais. Mesmo assim a demanda permaneceu alta. Registrar para futuras previsões de demanda por dia da semana.`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "Colaboradores procuram salgados entre 08h00 e 08h30 — operação chega depois.",
      "Demanda reprimida entre 15h30 e 16h00 mesmo após esgotar estoque.",
      "Terça-feira manteve demanda alta apesar de menos funcionários.",
      "Clientes novos observam exposição antes de comprar.",
      "Clientes recorrentes vão direto ao sabor favorito.",
      "Meta matinal: 8–9 unidades até 10h.",
    ],
    conclusion: "Oportunidades claras: antecipar chegada, aumentar compra em dias fortes e melhorar visibilidade dos produtos.",
  },
  suggestedActions: [
    {
      id: "chegar-mais-cedo",
      title: "Antecipar horário de chegada",
      description:
        "Hipótese: chegar antes das 08h30 pode capturar demanda atualmente perdida. Testar por 3 dias úteis e medir impacto.",
      status: "planned",
    },
    {
      id: "coletar-contatos",
      title: "Coletar contatos gradualmente",
      description:
        "Iniciar cadastro de telefone/WhatsApp dos clientes recorrentes para encomendas antecipadas.",
      status: "planned",
    },
    {
      id: "meta-manha-8-9",
      title: "Meta matinal até 10h",
      description: "Objetivo operacional: vender entre 8 e 9 unidades até 10h da manhã.",
      status: "planned",
    },
    {
      id: "aumentar-compra-dias-fortes",
      title: "Aumentar compra em dias de maior movimento",
      description:
        "Demanda reprimida após esgotar estoque (15h30–16h00). Considerar +2 a +4 unidades em terças/quintas.",
      status: "planned",
    },
    {
      id: "melhorar-exposicao",
      title: "Melhorar exposição visual dos produtos",
      description:
        "Produtos mais visíveis aumentam conversão de clientes novos e facilitam acesso de recorrentes.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Chegar mais cedo (antes de 08h30) pode aumentar significativamente o faturamento diário.",
      confirmed: null,
    },
    {
      flavor: "Geral",
      hypothesis: "Terças e quintas mantêm demanda alta mesmo com menos funcionários — não reduzir compra nesses dias.",
      confirmed: null,
    },
    {
      flavor: "Pastel",
      hypothesis: "Pastel mantém alta demanda matinal.",
      confirmed: null,
    },
  ],
  tags: [
    "meta-atingida",
    "demanda-matinal",
    "demanda-reprimida",
    "terca-feira",
    "exposicao-produto",
    "contatos-clientes",
    "reconciliacao-2007",
  ],
};

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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
  for (const key of Object.keys(PRODUCT_KEYS)) {
    if (!map[key]) throw new Error(`Produto não encontrado: ${key}`);
  }
  return map;
}

function resolveCanonicalName(name) {
  const n = normalizeName(name);
  for (const group of IDENTITY_GROUPS) {
    if (normalizeName(group.canonical) === n) return group.canonical;
    for (const alias of group.aliases) {
      if (normalizeName(alias) === n) return group.canonical;
    }
  }
  if (n.includes("vanderson")) return "Vanderson Dias";
  if (n.includes("mikely") || n.includes("mikelly")) return "Maria Mikelly Monteiro Coutinho";
  if (n.includes("dayanna")) return "Dayanna Kelly Costa Almeida";
  if (n.includes("gerb")) return "Gerb da Silva Maganos";
  if (n.includes("graziele")) return "Maria Graziele Santos Oliveira";
  return name;
}

function ensureClient(name, notes) {
  const canonical = resolveCanonicalName(name);
  let existing = db.prepare("SELECT id FROM clients WHERE name = ?").get(canonical);
  if (!existing) {
    existing = db.prepare("SELECT id FROM clients WHERE name = ?").get(name);
  }
  if (existing) return existing.id;
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO clients (id, business_id, name, sector, company, phone, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
  ).run(id, BUSINESS_ID, canonical, DEPARTMENT, notes ?? `Cliente — operação Salgados.`, now, now);
  return id;
}

function saleTotals(items, unitCost) {
  const units = items.reduce((s, i) => s + i.qty, 0);
  const total = UNIT_PRICE * units;
  const cost = unitCost * units;
  return { units, total, cost, profit: total - cost };
}

function insertSale({ saleId, date, time, clientId, totals, notes, items, productIds, unitCost }) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO sales (id, business_id, date, time, client_id, department, payment_method, payment_status, amount_received, total_amount, total_cost, profit, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pix', 'paid', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    saleId,
    BUSINESS_ID,
    date,
    time,
    clientId,
    DEPARTMENT,
    totals.total,
    totals.total,
    totals.cost,
    totals.profit,
    notes ?? null,
    now,
    now,
  );

  for (const item of items) {
    const subtotal = UNIT_PRICE * item.qty;
    const cost = unitCost * item.qty;
    db.prepare(
      `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(uuidv4(), saleId, productIds[item.product], item.qty, UNIT_PRICE, unitCost, subtotal, subtotal - cost);
  }

  db.prepare(`INSERT INTO payments (id, sale_id, method, amount, created_at) VALUES (?, ?, 'pix', ?, ?)`).run(
    uuidv4(),
    saleId,
    totals.total,
    now,
  );
}

function recalcSoldQuantities() {
  const products = db.prepare("SELECT id FROM products WHERE business_id = ?").all(BUSINESS_ID);
  const now = new Date().toISOString();
  for (const p of products) {
    const row = db
      .prepare(
        `SELECT COALESCE(SUM(si.quantity), 0) as qty FROM sale_items si
         JOIN sales s ON s.id = si.sale_id WHERE si.product_id = ? AND s.business_id = ?`,
      )
      .get(p.id, BUSINESS_ID);
    db.prepare("UPDATE products SET sold_quantity = ?, updated_at = ? WHERE id = ?").run(row.qty, now, p.id);
  }
}

function upsertDiary(entry) {
  const entityId = `${BUSINESS_ID}:${entry.date}`;
  const content = JSON.stringify(entry);
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT id FROM notes WHERE entity_type = 'operational_diary' AND entity_id = ?")
    .get(entityId);
  if (existing) {
    db.prepare("UPDATE notes SET content = ? WHERE id = ?").run(content, existing.id);
  } else {
    db.prepare(
      "INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, 'operational_diary', ?, ?, ?)",
    ).run(uuidv4(), entityId, content, now);
  }
  syncDiaryToRelational(entry);
}

function syncDiaryToRelational(entry) {
  const now = new Date().toISOString();
  const { businessId, date } = entry;

  if (entry.dailyGoalUnits) {
    db.prepare(`UPDATE goals SET target_units = ?, updated_at = ? WHERE business_id = ? AND type = 'daily'`).run(
      entry.dailyGoalUnits,
      now,
      businessId,
    );
  }

  db.prepare(`DELETE FROM operational_losses WHERE business_id = ? AND date = ?`).run(businessId, date);
  if (entry.quantityLost > 0) {
    db.prepare(
      `INSERT INTO operational_losses (id, business_id, date, product_id, product_name, quantity, reason, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 'Não especificado', ?, ?, ?, ?)`,
    ).run(uuidv4(), businessId, date, entry.quantityLost, entry.lossReason ?? null, now, now);
  }

  const existingPurchase = db
    .prepare(`SELECT id FROM daily_purchases WHERE business_id = ? AND date = ?`)
    .get(businessId, date);

  if (entry.purchase) {
    const purchaseId = existingPurchase?.id ?? uuidv4();
    if (existingPurchase) {
      db.prepare(`UPDATE daily_purchases SET total_units = ?, investment = ?, updated_at = ? WHERE id = ?`).run(
        entry.purchase.totalUnits,
        entry.purchase.investment,
        now,
        purchaseId,
      );
      db.prepare(`DELETE FROM daily_purchase_items WHERE purchase_id = ?`).run(purchaseId);
    } else {
      db.prepare(
        `INSERT INTO daily_purchases (id, business_id, date, total_units, investment, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(purchaseId, businessId, date, entry.purchase.totalUnits, entry.purchase.investment, now, now);
    }
    for (const line of entry.purchase.products) {
      db.prepare(
        `INSERT INTO daily_purchase_items (id, purchase_id, product_id, product_name, quantity, unit_cost)
         VALUES (?, ?, NULL, ?, ?, ?)`,
      ).run(uuidv4(), purchaseId, line.name, line.quantity, entry.purchase.investment / entry.purchase.totalUnits);
    }
  }

  db.prepare(`DELETE FROM operational_actions WHERE business_id = ? AND date = ?`).run(businessId, date);
  for (const action of entry.suggestedActions ?? []) {
    db.prepare(
      `INSERT INTO operational_actions (id, business_id, date, title, description, status, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'diary', ?, ?)`,
    ).run(uuidv4(), businessId, date, action.title, action.description, action.status, now, now);
  }

  db.prepare(`DELETE FROM product_hypotheses WHERE business_id = ? AND date = ?`).run(businessId, date);
  for (const h of entry.productHypotheses ?? []) {
    db.prepare(
      `INSERT INTO product_hypotheses (id, business_id, date, flavor, hypothesis, confirmed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(uuidv4(), businessId, date, h.flavor, h.hypothesis, null, now, now);
  }

  db.prepare(`DELETE FROM operational_lessons WHERE business_id = ? AND date = ?`).run(businessId, date);
  if (entry.lessonsLearned) {
    db.prepare(
      `INSERT INTO operational_lessons (id, business_id, date, content, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(uuidv4(), businessId, date, entry.lessonsLearned, JSON.stringify(entry.tags ?? []), now, now);
  }
}

function upsertInvestment(date, amount, description) {
  const existing = db
    .prepare(`SELECT id FROM investments WHERE business_id = ? AND date = ?`)
    .get(BUSINESS_ID, date);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(`UPDATE investments SET amount = ?, description = ? WHERE id = ?`).run(amount, description, existing.id);
  } else {
    db.prepare(
      `INSERT INTO investments (id, business_id, description, amount, type, date, created_at)
       VALUES (?, ?, ?, ?, 'additional', ?, ?)`,
    ).run(uuidv4(), BUSINESS_ID, description, amount, date, now);
  }
}

function reconcileDay20(productIds) {
  console.log("\n--- Reconciliando 20/07 ---");

  const mikelySale = db
    .prepare(
      `SELECT s.id FROM sales s
       JOIN clients c ON c.id = s.client_id
       WHERE s.date = ? AND s.business_id = ? AND c.name LIKE '%Mikelly%'`,
    )
    .get(DATE_20, BUSINESS_ID);

  if (mikelySale) {
    db.prepare(
      `UPDATE sales SET payment_status = 'paid', amount_received = 5,
       notes = 'PIX recebido R$ 5,00 em 21/07/2026 — fiado encerrado.'
       WHERE id = ?`,
    ).run(mikelySale.id);
    db.prepare(`UPDATE payments SET amount = 5 WHERE sale_id = ?`).run(mikelySale.id);
    console.log("✓ Mikely: fiado encerrado (PIX R$ 5,00)");
  }

  const anselmoExists = db
    .prepare(
      `SELECT s.id FROM sales s JOIN clients c ON c.id = s.client_id
       WHERE s.date = ? AND c.name LIKE '%Anselmo%'`,
    )
    .get(DATE_20);

  if (!anselmoExists) {
    const clientId = ensureClient(
      "Anselmo Gabriel Freire da Silva",
      "Cliente — unidade 20/07 paga via PIX em 21/07.",
    );
    const items = [{ product: "croissant", qty: 1 }];
    const totals = saleTotals(items, UNIT_COST_20);
    insertSale({
      saleId: uuidv4(),
      date: DATE_20,
      time: "16:00",
      clientId,
      totals,
      notes:
        "Venda 20/07 — 1 Croissant. Pagamento PIX R$ 5,00 recebido em 21/07/2026. Unidade anteriormente registrada como perda operacional.",
      items,
      productIds,
      unitCost: UNIT_COST_20,
    });
    console.log("✓ Anselmo: venda 20/07 registrada (1 Croissant · PIX recebido 21/07)");
  }

  upsertInvestment(
    DATE_20,
    52.5,
    "Investimento R$ 52,50 — compra diária ACAL 2026-07-20. 15 unidades (6 Croissant, 5 Pastel, 4 Misto). Meta atingida — 15 vendidos, 0 perdas.",
  );

  upsertDiary(DIARY_20_CORRECTED);

  const s20 = db
    .prepare(
      `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev,
       ROUND(SUM(amount_received),2) as rec, SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) as pending
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get(DATE_20, BUSINESS_ID);
  const u20 = db
    .prepare(
      `SELECT SUM(si.quantity) as q FROM sale_items si JOIN sales s ON s.id = si.sale_id
       WHERE s.date = ? AND s.business_id = ?`,
    )
    .get(DATE_20, BUSINESS_ID).q;

  console.log(`✓ 20/07: ${s20.vendas} vendas · ${u20} un · R$ ${s20.rev} · recebido R$ ${s20.rec} · pendentes ${s20.pending}`);
}

function registerDay21(productIds) {
  console.log("\n--- Registrando 21/07 ---");

  const oldIds = db
    .prepare("SELECT id FROM sales WHERE date = ? AND business_id = ?")
    .all(DATE_21, BUSINESS_ID)
    .map((r) => r.id);
  if (oldIds.length > 0) {
    const ph = oldIds.map(() => "?").join(",");
    db.prepare(`DELETE FROM payments WHERE sale_id IN (${ph})`).run(...oldIds);
    db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${ph})`).run(...oldIds);
    db.prepare(`DELETE FROM sales WHERE id IN (${ph})`).run(...oldIds);
    console.log(`Removidas ${oldIds.length} vendas pré-existentes de 21/07.`);
  }

  let first = true;
  for (const sale of SALES_21) {
    const clientId = ensureClient(sale.client);
    const totals = saleTotals(sale.items, UNIT_COST_21);
    const notes = first
      ? `${DIARY_21.observations.split("\n")[0]}\nVenda: ${sale.client} às ${sale.time}.`
      : `Venda Salgados ${DATE_21} — ${sale.client}.`;
    insertSale({
      saleId: uuidv4(),
      date: DATE_21,
      time: sale.time,
      clientId,
      totals,
      notes,
      items: sale.items,
      productIds,
      unitCost: UNIT_COST_21,
    });
    first = false;
  }

  upsertInvestment(
    DATE_21,
    44,
    "Investimento R$ 44,00 — compra diária ACAL 2026-07-21. 12 unidades (4 Croissant, 4 Pastel, 4 Misto). Meta atingida.",
  );

  upsertDiary(DIARY_21);
  recalcSoldQuantities();

  const s21 = db
    .prepare(
      `SELECT COUNT(*) as vendas, ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit
       FROM sales WHERE date = ? AND business_id = ?`,
    )
    .get(DATE_21, BUSINESS_ID);
  const u21 = db
    .prepare(
      `SELECT SUM(si.quantity) as q FROM sale_items si JOIN sales s ON s.id = si.sale_id
       WHERE s.date = ? AND s.business_id = ?`,
    )
    .get(DATE_21, BUSINESS_ID).q;

  console.log(`✓ 21/07: ${s21.vendas} vendas · ${u21} un · R$ ${s21.rev} · lucro R$ ${s21.profit}`);
}

function validate() {
  console.log("\n--- Validação ---");
  let ok = true;

  const d20 = db.prepare(
    `SELECT COUNT(DISTINCT s.id) as c, SUM(si.quantity) as u
     FROM sales s JOIN sale_items si ON si.sale_id = s.id
     WHERE s.date = ? AND s.business_id = ?`,
  ).get(DATE_20, BUSINESS_ID);
  const d20rev = db.prepare(
    `SELECT ROUND(SUM(total_amount),2) as rev, ROUND(SUM(amount_received),2) as rec
     FROM sales WHERE date = ? AND business_id = ?`,
  ).get(DATE_20, BUSINESS_ID);
  const pending20 = db
    .prepare(`SELECT COUNT(*) as c FROM sales WHERE date = ? AND payment_status = 'pending'`)
    .get(DATE_20).c;
  const losses20 = db
    .prepare(`SELECT COALESCE(SUM(quantity),0) as q FROM operational_losses WHERE date = ?`)
    .get(DATE_20).q;

  if (d20.c !== 11 || d20.u !== 15 || d20rev.rev !== 75 || d20rev.rec !== 75 || pending20 !== 0 || losses20 !== 0) {
    console.error("✗ 20/07 inválido:", { vendas: d20.c, un: d20.u, rev: d20rev.rev, rec: d20rev.rec, pending20, losses20 });
    ok = false;
  } else {
    console.log("✓ 20/07: 11 vendas · 15 un · R$ 75 · 0 pendentes · 0 perdas");
  }

  const d21 = db.prepare(
    `SELECT COUNT(DISTINCT s.id) as c, SUM(si.quantity) as u
     FROM sales s JOIN sale_items si ON si.sale_id = s.id
     WHERE s.date = ? AND s.business_id = ?`,
  ).get(DATE_21, BUSINESS_ID);
  const d21rev = db.prepare(
    `SELECT ROUND(SUM(total_amount),2) as rev, ROUND(SUM(profit),2) as profit
     FROM sales WHERE date = ? AND business_id = ?`,
  ).get(DATE_21, BUSINESS_ID);
  const pending21 = db
    .prepare(`SELECT COUNT(*) as c FROM sales WHERE date = ? AND payment_status = 'pending'`)
    .get(DATE_21).c;

  if (d21.c !== 10 || d21.u !== 12 || d21rev.rev !== 60 || pending21 !== 0) {
    console.error("✗ 21/07 inválido:", { vendas: d21.c, un: d21.u, rev: d21rev.rev, pending21 });
    ok = false;
  } else {
    console.log("✓ 21/07: 10 vendas · 12 un · R$ 60 · meta atingida");
  }

  const detail21 = db
    .prepare(
      `SELECT s.time, c.name, GROUP_CONCAT(p.name || ' x' || si.quantity) as produtos, s.total_amount
       FROM sales s JOIN clients c ON c.id = s.client_id
       JOIN sale_items si ON si.sale_id = s.id JOIN products p ON p.id = si.product_id
       WHERE s.date = ? AND s.business_id = ? GROUP BY s.id ORDER BY s.time`,
    )
    .all(DATE_21, BUSINESS_ID);
  console.table(detail21);

  if (!ok) process.exit(1);
  console.log("\n✓ Operação 21/07 registrada com sucesso.");
}

function main() {
  const productIds = findProducts();
  db.transaction(() => {
    reconcileDay20(productIds);
    registerDay21(productIds);
  })();
  validate();
  db.close();
}

main();
