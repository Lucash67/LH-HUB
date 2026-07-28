/**
 * Registro da primeira operação real ACAL — 16/07/2026
 * Usa APIs existentes + insert direto apenas onde não há API (investments, notes).
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const BASE = "http://localhost:3001";
const OP_DATE = "2026-07-16";
const UNIT_PRICE = 5; // R$ 45,00 ÷ 9 unidades (totais informados)
const PRODUCT_COST = 0; // Custo não desembolsado pelo operador; investimento de terceiro registrado à parte

const OPERATIONAL_NOTES = `Primeiro dia oficial de operação ACAL (16/07/2026).
Supervisora Nay autorizou o início. Comercialização apenas salgados (doces sob responsabilidade de Ana — não vendidos).
Todos os 9 produtos vendidos antes das 10h. Sem sobras. Demanda superou expectativa.
Estratégia: aumentar produção gradualmente nos próximos dias.
Contexto financeiro: receita R$ 45,00; desembolso operador R$ 0,00; resultado pessoal operador R$ 45,00;
investimento de R$ 31,50 realizado pelo pai do operador (terceiro), não pela ACAL.
Forma de pagamento: não informada neste registro — complementar posteriormente.
Horário exato das vendas: não informado — vendas antes das 10h.`;

async function postJson(url, body) {
  const r = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (!r.ok || json.error) {
    throw new Error(json.error || `HTTP ${r.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const productNames = ["Croissant", "Misto", "Pastel"];
  const productIds = {};

  console.log("=== PRODUTOS ===");
  for (const name of productNames) {
    const res = await postJson("/api/products", {
      name,
      category: "Salgados",
      price: String(UNIT_PRICE),
      cost: String(PRODUCT_COST),
      stockQuantity: "3",
      minStock: "0",
    });
    productIds[name] = res.id;
    console.log(`OK ${name} → ${res.id}`);
  }

  console.log("\n=== VENDAS (16/07/2026) ===");
  const saleIds = [];
  for (let i = 0; i < productNames.length; i++) {
    const name = productNames[i];
    const res = await postJson("/api/sales", {
      productId: productIds[name],
      quantity: 3,
      date: OP_DATE,
      time: "09:00",
      paymentMethod: "nao_informado",
      department: "ACAL",
      notes: i === 0 ? OPERATIONAL_NOTES : `Venda ACAL 16/07/2026 — ${name} (3 un). Ver observações na primeira venda do dia.`,
    });
    saleIds.push(res.id);
    console.log(`OK ${name} x3 → venda ${res.id}`);
  }

  console.log("\n=== INVESTIMENTO TERCEIRO (insert direto — sem API) ===");
  const dbPath = path.join(process.cwd(), "data", "lucas-business-os.db");
  const db = new Database(dbPath);
  const now = new Date().toISOString();
  const investmentId = uuidv4();

  db.prepare(
    `INSERT INTO investments (id, description, amount, type, date, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    investmentId,
    "Investimento pai do operador — aquisição dos produtos. Não desembolsado pela ACAL nem pelo operador. Dia 16/07/2026.",
    31.5,
    "initial",
    OP_DATE,
    now,
  );
  console.log(`OK investment ${investmentId} — R$ 31,50`);

  const noteId = uuidv4();
  db.prepare(
    `INSERT INTO notes (id, entity_type, entity_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(noteId, "sale", saleIds[0], OPERATIONAL_NOTES, now);
  console.log(`OK note ${noteId} → venda ${saleIds[0]}`);

  db.close();

  console.log("\n=== VALIDAÇÃO ===");
  const dash = await fetch(`${BASE}/api/dashboard`).then((r) => r.json());
  const products = await fetch(`${BASE}/api/products`).then((r) => r.json());
  const sales = await fetch(`${BASE}/api/sales`).then((r) => r.json());

  console.log("Dashboard revenueMonth:", dash.metrics?.revenueMonth);
  console.log("Dashboard revenueWeek:", dash.metrics?.revenueWeek);
  console.log("Dashboard currentStock:", dash.metrics?.currentStock);
  console.log("Dashboard itemsSoldToday:", dash.metrics?.itemsSoldToday);
  console.log("Products:", products.length);
  console.log("Sales:", sales.length);
  console.log("Total revenue sales:", sales.reduce((s, v) => s + v.totalAmount, 0));

  console.log("\nREGISTRO_CONCLUIDO");
}

main().catch((e) => {
  console.error("FALHA:", e.message);
  process.exit(1);
});
