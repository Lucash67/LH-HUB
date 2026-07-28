/**
 * Sprint 1.2 — Registro dia 17/07/2026 via API oficial (ADR-002).
 * Apenas fetch HTTP — sem SQL direto.
 */
const BASE = "http://localhost:3001";
const OP_DATE = "2026-07-17";
const DEPT = "ACAL";

const PRODUCTS = {
  croissant: "5e4599bd-bf1a-45b8-90ef-29b7b1845a13",
  pastel: "dc23feda-ff94-42b6-9889-aa6ea351a846",
  misto: "b02d3653-0a5a-49ba-9ba0-2effb2f96f94",
};

const DAYANNA_ID = "6e6ef27c-cd75-41d5-8d72-085d53533b3e";

const OBSERVATIONS = `ROO-0002 — Segundo dia oficial de operação ACAL (17/07/2026).
Primeiro aumento de produção. Todo estoque vendido novamente.
Maior concentração de vendas entre 08:50 e 10:00. Vendas também durante a tarde.
Decisões: manter preço R$5,00; crescimento gradual da produção; continuar registrando clientes.
Investimento R$42,00 (pai do operador) — pendente de endpoint oficial.
PIX R$2,50 Fernando Martins Cruz às 13:06 — movimentação extraordinária, não pertence ao negócio — pendente de endpoint oficial.`;

const NEW_CLIENTS = [
  "Paulo André Cavalcante Oliveira",
  "Raimunda Raimunda Sousa",
  "Jackson Mendes Pinheiro",
  "Gerb da Silva Maganos",
  "Maria Clara Gomes Mororo",
  "Ana Letícia Ferreira dos Santos",
  "Maurício de Sá Machado Júnior",
  "Lucas Moraes",
  "José Inácio Silva da Cruz",
  "Leonardo de Sousa Sena",
];

const SALES = [
  { time: "08:52", client: "Paulo André Cavalcante Oliveira", product: "croissant" },
  { time: "08:54", client: "Raimunda Raimunda Sousa", product: "pastel" },
  { time: "09:02", client: "Dayanna Kelly Costa da Silva", product: "pastel", existingId: DAYANNA_ID },
  { time: "09:10", client: "Jackson Mendes Pinheiro", product: "croissant" },
  { time: "09:10", client: "Gerb da Silva Maganos", product: "croissant" },
  { time: "09:25", client: "Maria Clara Gomes Mororo", product: "pastel" },
  { time: "09:47", client: "Ana Letícia Ferreira dos Santos", product: "misto" },
  { time: "09:55", client: "Maurício de Sá Machado Júnior", product: "misto" },
  { time: "09:59", client: "Lucas Moraes", product: "misto" },
  {
    time: "14:58",
    client: "Raimunda Raimunda Sousa",
    product: "croissant",
    notes: "Segunda compra realizada pelo mesmo cliente no mesmo dia.",
  },
  { time: "15:35", client: "José Inácio Silva da Cruz", product: "croissant" },
  { time: "15:37", client: "Leonardo de Sousa Sena", product: "pastel" },
];

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`${method} ${path} → ${json.error || res.status}`);
  }
  return json;
}

async function main() {
  const products = await api("GET", "/api/products");

  for (const p of products) {
    await api("PUT", "/api/products", {
      id: p.id,
      name: p.name,
      category: p.category,
      price: 5,
      cost: 3.5,
      stockQuantity: p.stockQuantity,
      minStock: p.minStock,
      status: p.status,
    });
  }

  const stockPlan = [
    { id: PRODUCTS.croissant, qty: 5 },
    { id: PRODUCTS.pastel, qty: 4 },
    { id: PRODUCTS.misto, qty: 3 },
  ];
  for (const s of stockPlan) {
    await api("POST", "/api/stock", {
      productId: s.id,
      type: "entry",
      quantity: s.qty,
      reason: `Produção ACAL ${OP_DATE} — ROO-0002`,
    });
  }

  const clientIds = { "Dayanna Kelly Costa da Silva": DAYANNA_ID };
  for (const name of NEW_CLIENTS) {
    const r = await api("POST", "/api/clients", {
      name,
      sector: DEPT,
      notes: `Cliente identificado — operação ACAL ${OP_DATE}.`,
    });
    clientIds[name] = r.id;
  }

  const saleIds = [];
  for (let i = 0; i < SALES.length; i++) {
    const s = SALES[i];
    const clientId = s.existingId ?? clientIds[s.client];
    const notes =
      i === 0
        ? `${OBSERVATIONS}\n\n---\nVenda: ${s.client} às ${s.time}.`
        : s.notes ?? null;

    const r = await api("POST", "/api/sales", {
      productId: PRODUCTS[s.product],
      quantity: 1,
      clientId,
      paymentMethod: "pix",
      date: OP_DATE,
      time: s.time,
      department: DEPT,
      notes,
    });
    saleIds.push(r.id);
  }

  console.log(JSON.stringify({ ok: true, saleIds: saleIds.length, clientIds: Object.keys(clientIds).length }, null, 2));
}

main().catch((e) => {
  console.error("FALHA:", e.message);
  process.exit(1);
});
