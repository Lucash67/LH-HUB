/**
 * Insere as vendas do canal do pai (trabalho do Henrique) que ficaram fora
 * da tabela de vendas nos dias 23, 24 e 27/07 — o diário já contém os valores.
 * Uso: pnpm tsx scripts/add-father-sales-2307-2707.ts
 */
import "./load-env";
import { executeSaleRecord } from "@/platform/db/repositories/sale-repository";
import { listProducts } from "@/platform/db/repositories/product-repository";
import { listClientsRaw } from "@/platform/db/repositories/client-repository";
import { listSalesEnriched } from "@/platform/db/repositories/sale-repository";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";

const BUSINESS = "salgados";
const DEPT_PAI = "Clientes do trabalho do Henrique";
const UNIT_PRICE = 5;

interface FatherSale {
  date: string;
  time: string;
  clientName: string;
  productName: string;
  quantity: number;
  notes: string;
}

const SALES: FatherSale[] = [
  // 23/07 — pai levou 2 Croissant + 1 Mistao, todos vendidos no trabalho (R$15).
  {
    date: "2026-07-23",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: "Croissant",
    quantity: 2,
    notes: "Vendidos no trabalho do Henrique — faturamento repassado pelo pai (23/07).",
  },
  {
    date: "2026-07-23",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: "Misto com Catupiry",
    quantity: 1,
    notes: "Vendido no trabalho do Henrique — faturamento repassado pelo pai (23/07).",
  },
  // 24/07 — pai levou 3 Croissant + 3 Mistao + 2 Pastel, todos vendidos (R$40).
  {
    date: "2026-07-24",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: "Croissant",
    quantity: 3,
    notes: "Vendidos no trabalho do Henrique — faturamento repassado pelo pai (24/07).",
  },
  {
    date: "2026-07-24",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: "Misto com Catupiry",
    quantity: 3,
    notes: "Vendidos no trabalho do Henrique — faturamento repassado pelo pai (24/07).",
  },
  {
    date: "2026-07-24",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: "Pastel de Frango com Presunto",
    quantity: 2,
    notes: "Vendidos no trabalho do Henrique — faturamento repassado pelo pai (24/07).",
  },
  // 27/07 — cota do pai: 10 Mistao + 5 Pastel. 10 vendidos a clientes do trabalho
  // e 5 comprados pelo próprio Henrique (sabor por comprador não informado).
  {
    date: "2026-07-27",
    time: "07:30",
    clientName: "Clientes do trabalho do Henrique",
    productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
    quantity: 10,
    notes:
      "10 vendidos no trabalho do Henrique (cota do dia: 10 Mistão + 5 Pastel; sabores por venda não informados). Faturamento repassado pelo pai (27/07).",
  },
  {
    date: "2026-07-27",
    time: "07:45",
    clientName: "Henrique",
    productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
    quantity: 5,
    notes:
      "5 comprados pelo próprio Henrique para ajudar a girar a cota do dia (27/07). Sabores por unidade não informados.",
  },
];

async function main(): Promise<void> {
  const products = await listProducts(BUSINESS);
  const clients = await listClientsRaw();

  const findProduct = (name: string) => {
    const p = products.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!p) throw new Error(`Produto não encontrado: ${name}`);
    return p;
  };
  const findClient = (name: string) => {
    const c = clients.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!c) throw new Error(`Cliente não encontrado: ${name}`);
    return c;
  };

  // Idempotência: não duplicar se já existirem vendas do canal do pai nesses dias.
  const existing = await listSalesEnriched(BUSINESS);
  for (const date of ["2026-07-23", "2026-07-24", "2026-07-27"]) {
    const dupes = existing.filter(
      (s: { date: string; department?: string | null }) =>
        s.date === date && s.department === DEPT_PAI,
    );
    if (dupes.length > 0) {
      throw new Error(`Dia ${date} já tem ${dupes.length} venda(s) do canal do pai — abortando.`);
    }
  }

  for (const sale of SALES) {
    const product = findProduct(sale.productName);
    const client = findClient(sale.clientName);
    const id = await executeSaleRecord({
      productId: product.id,
      quantity: sale.quantity,
      clientId: client.id,
      paymentMethod: "pix",
      paymentStatus: "paid",
      date: sale.date,
      time: sale.time,
      department: DEPT_PAI,
      notes: sale.notes,
      unitPrice: UNIT_PRICE,
      unitCost: product.cost,
    });
    console.log(
      `+ ${sale.date} ${sale.time} | ${sale.clientName} | ${sale.quantity}x ${sale.productName} | R$${(sale.quantity * UNIT_PRICE).toFixed(2)} | ${id}`,
    );
  }

  // Conferência: soma das vendas por dia vs diário.
  const after = await listSalesEnriched(BUSINESS);
  for (const date of ["2026-07-23", "2026-07-24", "2026-07-27"]) {
    const daySales = after.filter((s: { date: string }) => s.date === date);
    const total = daySales.reduce(
      (sum: number, s: { totalAmount: number }) => sum + s.totalAmount,
      0,
    );
    console.log(`${date}: ${daySales.length} vendas | total R$${total.toFixed(2)}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
