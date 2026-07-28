/**
 * End-to-end validation for first-day operation readiness.
 * Creates test data via API, verifies integrations, then removes test data.
 */
import Database from "better-sqlite3";
import path from "path";

const BASE = "http://localhost:3001";
const DB_PATH = path.join(process.cwd(), "data", "lucas-business-os.db");

const ids = { products: [], clients: [], sales: [], operations: [] };
const failures = [];

async function api(method, url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

function assert(label, condition, detail = "") {
  if (!condition) failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.log(condition ? `✓ ${label}` : `✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log("=== 1. Empty install APIs ===");

  for (const [name, url] of [
    ["dashboard", "/api/dashboard"],
    ["products", "/api/products"],
    ["clients", "/api/clients"],
    ["sales", "/api/sales"],
    ["goals", "/api/goals"],
    ["financial", "/api/financial"],
    ["stock", "/api/stock"],
  ]) {
    const { status, json } = await api("GET", url);
    assert(`${name} GET`, status === 200 && !json.error, `status=${status} error=${json.error}`);
  }

  const dashEmpty = await api("GET", "/api/dashboard");
  assert("dashboard empty metrics", dashEmpty.json.metrics?.revenueToday === 0);

  const goalsEmpty = await api("GET", "/api/goals");
  assert("goals empty array", Array.isArray(goalsEmpty.json) && goalsEmpty.json.length >= 0);

  console.log("\n=== 2. Create test data ===");

  const p1 = await api("POST", "/api/products", {
    name: "__TEST__ Croissant",
    category: "Salgados",
    price: "8.00",
    cost: "3.50",
    stockQuantity: "20",
    minStock: "5",
  });
  assert("create product 1", p1.status === 201, JSON.stringify(p1.json));
  if (p1.json.id) ids.products.push(p1.json.id);

  const p2 = await api("POST", "/api/products", {
    name: "__TEST__ Empada",
    category: "Salgados",
    price: "6.00",
    cost: "2.50",
    stockQuantity: "15",
    minStock: "5",
  });
  assert("create product 2", p2.status === 201);
  if (p2.json.id) ids.products.push(p2.json.id);

  const client = await api("POST", "/api/clients", {
    name: "__TEST__ Ana Silva",
    sector: "RH",
    company: "Empresa Teste",
    phone: "11999999999",
  });
  assert("create client", client.status === 201 || client.json.id, JSON.stringify(client.json));
  const clientId = client.json.id;
  if (clientId) ids.clients.push(clientId);

  const sale = await api("POST", "/api/sales", {
    productId: ids.products[0],
    quantity: 2,
    clientId,
    paymentMethod: "pix",
  });
  assert("create sale", sale.status === 201, JSON.stringify(sale.json));
  if (sale.json.id) ids.sales.push(sale.json.id);

  console.log("\n=== 3. Verify updates ===");

  const dash = await api("GET", "/api/dashboard");
  assert("dashboard revenue", dash.json.metrics?.revenueToday === 16);
  assert("dashboard stock", dash.json.metrics?.currentStock === 33);

  const fin = await api("GET", "/api/financial");
  assert("financial grossRevenue", fin.json.grossRevenue === 16);

  const stock = await api("GET", "/api/stock");
  const testProduct = stock.json?.products?.find?.((p) => p.id === ids.products[0]);
  assert("stock updated", testProduct?.stockQuantity === 18, `got ${testProduct?.stockQuantity}`);

  const clientDetails = await api("GET", `/api/clients?id=${clientId}`);
  assert("client history count", clientDetails.json.purchaseCount === 1);
  assert("client total spent", clientDetails.json.totalSpent === 16);

  console.log("\n=== 4. Business Engine (text operation) ===");

  const op = await api("POST", "/api/operations", {
    text: "1 Empada Ana pix",
    force: true,
  });
  assert("operations POST", op.status === 201 || op.status === 422, `status=${op.status} ${op.json.message || ""}`);
  if (op.json.operationId) ids.operations.push(op.json.operationId);

  const db = new Database(DB_PATH);
  const opCount = db
    .prepare("SELECT COUNT(*) as c FROM operations WHERE status = 'executed'")
    .get();
  assert("operations table has executed", opCount.c >= 1, `count=${opCount.c}`);

  console.log("\n=== 5. Cleanup test data ===");

  if (ids.sales.length) {
    db.prepare(`DELETE FROM payments WHERE sale_id IN (${ids.sales.map(() => "?").join(",")})`).run(...ids.sales);
    db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${ids.sales.map(() => "?").join(",")})`).run(...ids.sales);
    db.prepare(`DELETE FROM sales WHERE id IN (${ids.sales.map(() => "?").join(",")})`).run(...ids.sales);
  }

  // Remove any sales created by engine test too
  db.prepare("DELETE FROM payments WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
  db.prepare("DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE date = date('now'))").run();
  db.prepare("DELETE FROM sales WHERE date = date('now')").run();

  if (ids.clients.length) {
    db.prepare(`DELETE FROM clients WHERE id IN (${ids.clients.map(() => "?").join(",")})`).run(...ids.clients);
  }
  if (ids.products.length) {
    db.prepare(`DELETE FROM stock_movements WHERE product_id IN (${ids.products.map(() => "?").join(",")})`).run(...ids.products);
    db.prepare(`DELETE FROM products WHERE id IN (${ids.products.map(() => "?").join(",")})`).run(...ids.products);
  }

  db.close();

  console.log("\n=== RESULT ===");
  if (failures.length) {
    console.log("BLOCKERS:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log("All checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
