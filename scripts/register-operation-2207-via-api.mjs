/**
 * Operação oficial 22/07/2026 — registro via API (ADR-002).
 * Primeiro dia pós-Consolidação Histórica (Sprint A.4).
 * Gap conhecido: investimentos (split operador/terceiro) via SQL mínimo.
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const BASE = process.env.LBO_API_BASE ?? "http://localhost:3001";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(ROOT, "data", "lucas-business-os.db");

const BUSINESS_ID = "salgados";
const OP_DATE = "2026-07-22";
const DEPT_ACAL = "ACAL";
const DEPT_HENRIQUE = "Trabalho do Henrique";

const INVESTMENT_TOTAL = 52.5;
const INVESTMENT_OWN = 22.5;
const INVESTMENT_THIRD = 30;
const UNITS_PURCHASED = 15;
const UNITS_SOLD = 14;
const REVENUE = 70;
const PROFIT = 17.5;
const UNIT_PRICE = 5;
/** Custo alocado às 14 unidades confirmadas — lucro operacional = R$ 17,50 */
const UNIT_COST = INVESTMENT_TOTAL / UNITS_SOLD;

const PRODUCT_NAMES = {
  croissant: "Croissant",
  pastel: "Pastel de Frango com Presunto",
  misto: "Misto com Catupiry",
  unknown: "Salgado (sabor não identificado)",
};

const NEW_CLIENTS = [
  { name: "Trabalho do Henrique", sector: DEPT_HENRIQUE, notes: "Vendas no período 07:09–08:54 — operação 22/07/2026." },
  { name: "Alexandre Soares de Souza", sector: DEPT_ACAL, notes: "Cliente identificado — operação ACAL 22/07/2026." },
  { name: "Francisco Anderson das Chagas", sector: DEPT_ACAL, notes: "Cliente identificado — operação ACAL 22/07/2026." },
  { name: "Ismael Silva da Paz", sector: DEPT_ACAL, notes: "Cliente identificado — operação ACAL 22/07/2026." },
  { name: "Jonas Ferreira dos Santos", sector: DEPT_ACAL, notes: "Cliente identificado — operação ACAL 22/07/2026." },
  { name: "PA", sector: DEPT_ACAL, notes: "Cliente identificado como PA — nome completo pendente. Operação ACAL 22/07/2026." },
  {
    name: "Cliente Não Identificado (22/07/2026)",
    sector: DEPT_ACAL,
    notes: "2 salgados em dinheiro às 15:55 — recebimento por Dona Raimunda. Sabores não informados. Aguardando identificação.",
  },
  { name: "Bernardo Ferreira Domingo", sector: DEPT_ACAL, notes: "Cliente identificado — sabor não informado. Operação ACAL 22/07/2026." },
];

const SALES = [
  {
    time: "07:09",
    client: "Trabalho do Henrique",
    product: "croissant",
    quantity: 3,
    department: DEPT_HENRIQUE,
    paymentMethod: "pix",
    notes: "Trabalho do Henrique — 07:09 às 08:54. 3 Croissant. Parte da operação do dia.",
  },
  { time: "08:58", client: "Jackson Mendes Pinheiro", product: "misto", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "09:36", client: "Diego Martins Pinheiro", product: "misto", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "09:44", client: "Alexandre Soares de Souza", product: "croissant", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "09:47", client: "Francisco Anderson das Chagas", product: "pastel", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "09:56", client: "Francisco Anderson das Chagas", product: "pastel", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "12:03", client: "Ismael Silva da Paz", product: "croissant", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "12:03", client: "Jonas Ferreira dos Santos", product: "misto", department: DEPT_ACAL, paymentMethod: "pix" },
  { time: "12:05", client: "PA", product: "pastel", department: DEPT_ACAL, paymentMethod: "pix" },
  {
    time: "15:55",
    client: "Cliente Não Identificado (22/07/2026)",
    product: "unknown",
    quantity: 2,
    department: DEPT_ACAL,
    paymentMethod: "cash",
    notes:
      "2 salgados em dinheiro. Sabores NÃO INFORMADOS. Recebimento por Dona Raimunda. Aguardando identificação da cliente e dos sabores.",
  },
  {
    time: "15:58",
    client: "Bernardo Ferreira Domingo",
    product: "unknown",
    department: DEPT_ACAL,
    paymentMethod: "pix",
    notes: "1 salgado vendido. Sabor NÃO INFORMADO.",
  },
];

const DIARY = {
  version: 1,
  businessId: BUSINESS_ID,
  date: OP_DATE,
  dailyGoalUnits: 12,
  purchase: {
    totalUnits: UNITS_PURCHASED,
    investment: INVESTMENT_TOTAL,
    products: [
      { name: "Croissant", quantity: 5 },
      { name: "Pastel de Frango com Presunto", quantity: 5 },
      { name: "Misto com Catupiry", quantity: 5 },
    ],
  },
  sales: {
    paidCount: 11,
    creditCount: 0,
    fatherSale: { units: 3, amount: 15, buyerName: "Trabalho do Henrique" },
  },
  revenue: { received: REVENUE, pending: 0, total: REVENUE },
  profit: PROFIT,
  quantitySold: UNITS_SOLD,
  quantityLost: 0,
  observations: `Operação oficial 22/07/2026 — primeiro dia pós-Consolidação Histórica.

COMPRA: 15 unidades (5 Croissant · 5 Pastel · 5 Misto). Investimento R$ 52,50.
  · Próprio: R$ 22,50 · Terceiro (Familiar · Henrique): R$ 30,00
DISTRIBUIÇÃO: ACAL 12 un (2C·5P·5M) · Trabalho Henrique 3 Croissant.

VENDAS CONFIRMADAS: 14 unidades · R$ 70,00 · lucro operacional R$ 17,50 · margem 25%.

PENDÊNCIA — 1 pastel em investigação (NÃO contabilizar como perda):
  · Custo R$ 3,50 · potencial venda R$ 5,00 · situação: em investigação.
  · Observação: "Hoje perdi um pastel (em investigação)."

INCERTEZAS REGISTRADAS:
  · 15:55 — 2 salgados em dinheiro (Dona Raimunda recebeu). Cliente e sabores não identificados.
  · 15:58 — Bernardo Ferreira Domingo — sabor não informado.
  · Sabores dos últimos 3 salgados vendidos não puderam ser identificados.

FINANCEIRO: dinheiro em espécie convertido posteriormente em PIX via Henrique — conversão de forma de recebimento, não altera receita.

PLANEJAMENTO FUTURO (não é venda do dia):
  · Encomenda: 2 Mistos com Catupiry para sexta-feira — colega de trabalho do Henrique.

DECISÃO: continuar levando 12 unidades para a ACAL durante esta semana.`,
  manualInsights:
    "Perguntar à Dona Raimunda o nome da cliente que comprou 2 salgados em dinheiro e, se possível, os sabores. Demanda matinal mantida.",
  lessonsLearned: `APRENDIZADO 01 — Pastel em investigação: não assumir perda antes de confirmar.

APRENDIZADO 02 — Vendas em dinheiro exigem identificação posterior da cliente e dos sabores.

APRENDIZADO 03 — Manter 12 unidades na ACAL nesta semana.`,
  commercialIntelligence: {
    whatWeLearnedToday: [
      "1 pastel sem identificação — em investigação, não registrar como perda.",
      "2 salgados vendidos em dinheiro — cliente e sabores pendentes.",
      "Sabores dos últimos 3 salgados não identificados.",
    ],
    conclusion: "Preservar incertezas como eventos operacionais; regularizar quando houver evidência.",
  },
  suggestedActions: [
    {
      id: "identificar-cliente-dinheiro-2207",
      title: "Identificar cliente dos 2 salgados em dinheiro",
      description: "Perguntar à Dona Raimunda nome da cliente e sabores (15:55).",
      status: "in_progress",
    },
    {
      id: "pastel-investigacao-2207",
      title: "Pastel em investigação",
      description: "1 pastel (R$ 3,50 custo / R$ 5,00 potencial). Não contabilizar como perda.",
      status: "in_progress",
    },
    {
      id: "encomenda-misto-sexta",
      title: "Encomenda — 2 Mistos para sexta-feira",
      description: "Colega de trabalho do Henrique. Planejamento futuro — não é venda do dia.",
      status: "planned",
    },
  ],
  productHypotheses: [
    {
      flavor: "Geral",
      hypothesis: "Manter 12 unidades na ACAL nesta semana.",
      confirmed: null,
    },
  ],
  tags: [
    "pos-consolidacao",
    "investigacao-pastel",
    "sabor-nao-identificado",
    "dinheiro-especie",
    "operacao-real",
  ],
};

async function api(method, route, body) {
  const res = await fetch(`${BASE}${route}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`${method} ${route} → ${json.error || res.status}`);
  }
  return json;
}

function assertDayNotRegistered() {
  const db = new Database(DB_PATH, { readonly: true });
  const existing = db
    .prepare(`SELECT COUNT(*) as c FROM sales WHERE business_id = ? AND date = ?`)
    .get(BUSINESS_ID, OP_DATE);
  db.close();
  if (existing.c > 0) {
    throw new Error(`Dia ${OP_DATE} já possui ${existing.c} venda(s). Abortando para preservar integridade.`);
  }
}

function registerInvestments() {
  const db = new Database(DB_PATH);
  const now = new Date().toISOString();

  db.prepare(`DELETE FROM investments WHERE business_id = ? AND date = ?`).run(BUSINESS_ID, OP_DATE);

  db.prepare(
    `INSERT INTO investments (id, business_id, description, amount, type, date, source_type, source_name, created_at)
     VALUES (?, ?, ?, ?, 'additional', ?, 'own_capital', NULL, ?)`,
  ).run(
    uuidv4(),
    BUSINESS_ID,
    `Investimento próprio do operador — compra diária ${OP_DATE}. R$ 22,50 (3 unidades alocadas ao operador).`,
    INVESTMENT_OWN,
    OP_DATE,
    now,
  );

  db.prepare(
    `INSERT INTO investments (id, business_id, description, amount, type, date, source_type, source_name, created_at)
     VALUES (?, ?, ?, ?, 'additional', ?, 'family', 'Henrique', ?)`,
  ).run(
    uuidv4(),
    BUSINESS_ID,
    `Investimento Familiar · Henrique — compra diária ${OP_DATE}. R$ 30,00.`,
    INVESTMENT_THIRD,
    OP_DATE,
    now,
  );

  db.close();
  console.log("✓ Investimentos registrados (próprio R$ 22,50 + Henrique R$ 30,00)");
}

async function resolveProducts() {
  const products = await api("GET", `/api/products?businessId=${BUSINESS_ID}`);
  const byKey = {};

  for (const [key, name] of Object.entries(PRODUCT_NAMES)) {
    if (key === "unknown") continue;
    const match = products.find((p) => p.name.toLowerCase().includes(name.toLowerCase().slice(0, 6)));
    if (!match) throw new Error(`Produto não encontrado: ${name}`);
    byKey[key] = match.id;
  }

  let unknown = products.find((p) => p.name === PRODUCT_NAMES.unknown);
  if (!unknown) {
    unknown = await api("POST", "/api/products", {
      businessId: BUSINESS_ID,
      name: PRODUCT_NAMES.unknown,
      category: "Salgados",
      price: UNIT_PRICE,
      cost: UNIT_COST,
      stockQuantity: 0,
      minStock: 0,
      status: "active",
    });
  }
  byKey.unknown = unknown.id;

  for (const p of products) {
    await api("PUT", "/api/products", {
      id: p.id,
      name: p.name,
      category: p.category,
      price: UNIT_PRICE,
      cost: UNIT_COST,
      stockQuantity: p.stockQuantity,
      minStock: p.minStock,
      status: p.status,
    });
  }

  await api("PUT", "/api/products", {
    id: byKey.unknown,
    name: PRODUCT_NAMES.unknown,
    category: "Salgados",
    price: UNIT_PRICE,
    cost: UNIT_COST,
    stockQuantity: 0,
    minStock: 0,
    status: "active",
  });

  return byKey;
}

async function registerStock(productIds) {
  const plan = [
    { id: productIds.croissant, qty: 5 },
    { id: productIds.pastel, qty: 5 },
    { id: productIds.misto, qty: 5 },
  ];
  for (const s of plan) {
    await api("POST", `/api/stock?businessId=${BUSINESS_ID}`, {
      productId: s.id,
      type: "entry",
      quantity: s.qty,
      reason: `Compra diária ${OP_DATE} — 15 unidades (5+5+5)`,
    });
  }
  console.log("✓ Estoque registrado — 15 unidades");
}

async function resolveClients(existingClients) {
  const byName = new Map(existingClients.map((c) => [c.name, c.id]));

  for (const spec of NEW_CLIENTS) {
    if (byName.has(spec.name)) continue;
    const created = await api("POST", "/api/clients", {
      name: spec.name,
      sector: spec.sector,
      notes: spec.notes,
      businessId: BUSINESS_ID,
    });
    byName.set(spec.name, created.id);
  }

  const jackson = existingClients.find((c) => c.name.includes("Jackson Mendes"));
  const diego = existingClients.find((c) => c.name.includes("Diego Martins"));
  if (jackson) byName.set("Jackson Mendes Pinheiro", jackson.id);
  if (diego) byName.set("Diego Martins Pinheiro", diego.id);

  return byName;
}

async function registerSales(productIds, clientIds) {
  const saleIds = [];
  for (const s of SALES) {
    const clientId = clientIds.get(s.client);
    if (!clientId) throw new Error(`Cliente não resolvido: ${s.client}`);

    const r = await api("POST", "/api/sales", {
      businessId: BUSINESS_ID,
      productId: productIds[s.product],
      quantity: s.quantity ?? 1,
      clientId,
      paymentMethod: s.paymentMethod,
      paymentStatus: "paid",
      date: OP_DATE,
      time: s.time,
      department: s.department,
      notes: s.notes ?? null,
    });
    saleIds.push(r.id);
  }
  console.log(`✓ ${saleIds.length} vendas registradas · ${UNITS_SOLD} unidades`);
  return saleIds;
}

async function registerDiary() {
  await api("PUT", "/api/diary", DIARY);
  console.log("✓ Diário operacional registrado");
}

async function main() {
  assertDayNotRegistered();

  const existingClients = await api("GET", `/api/clients?businessId=${BUSINESS_ID}`);
  const productIds = await resolveProducts();
  await registerStock(productIds);
  const clientIds = await resolveClients(existingClients);
  await registerSales(productIds, clientIds);
  await registerDiary();
  registerInvestments();

  console.log("\n=== Operação 22/07/2026 registrada ===");
  console.log(`Receita: R$ ${REVENUE} · Lucro: R$ ${PROFIT} · Investimento: R$ ${INVESTMENT_TOTAL}`);
}

main().catch((e) => {
  console.error("FALHA:", e.message);
  process.exit(1);
});
