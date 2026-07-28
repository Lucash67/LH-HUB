const BASE = "http://localhost:3001";

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

const salgados = await get("/api/sales?businessId=salgados");
const brig = await get("/api/sales?businessId=brigadeiros");
const all = await get("/api/sales");
const stock = await get("/api/stock?businessId=brigadeiros");
const clients = await get("/api/clients");
const goals = await get("/api/goals?businessId=brigadeiros");

const sum = (arr) => arr.reduce((s, x) => s + x.totalAmount, 0);
const units = (arr) =>
  arr.reduce((s, sale) => s + sale.items.reduce((si, it) => si + it.quantity, 0), 0);

console.log(
  JSON.stringify(
    {
      salgados: { sales: salgados.length, revenue: sum(salgados) },
      brigadeiros: {
        sales: brig.length,
        units: units(brig),
        revenue: sum(brig),
        stock: stock.products[0]?.stockQuantity,
        soldQty: stock.products[0]?.soldQuantity,
      },
      todos: { sales: all.length, revenue: sum(all) },
      clients: clients.length,
      leviSales: brig.filter((s) => s.client?.name === "Levi").length,
      brigadeirosClients: [...new Set(brig.map((s) => s.client?.name).filter(Boolean))].sort(),
      goals: goals.map((g) => ({ type: g.type, target: g.targetAmount, current: g.current })),
    },
    null,
    2,
  ),
);
