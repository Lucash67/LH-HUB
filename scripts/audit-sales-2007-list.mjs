/**
 * Compara vendas 20/07 no banco vs lista oficial do operador
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const OFFICIAL_LIST = [
  { time: "09:34", client: "Raimunda Raimunda Sousa", product: "Pastel", qty: 1 },
  { time: "09:50", client: "Vanderson Dias", product: "Pastel", qty: 2 },
  { time: "09:40", client: "Lucas Moraes", product: "Pastel", qty: 1 },
  { time: "10:04", client: "Dayanna Kelly Costa Almeida", product: "Pastel", qty: 1 },
  { time: "10:48", client: "Jackson Mendes Pinheiro", product: "Misto com Catupiry", qty: 2 },
  { time: null, client: "Mikely (fiado)", product: "Croissant", qty: 1 },
  { time: "12:10", client: "Francisca Laize De Oliveira Ribeiro", product: "Croissant", qty: 1 },
  { time: "15:30", client: "Bruno Medeiros Silva", product: "Misto com Catupiry", qty: 1 },
  { time: "15:30", client: "Leonardo De Sousa Sena", product: "Misto com Catupiry", qty: 1 },
  { time: "20:00", client: "Henrique", product: "Croissant", qty: 3 },
];

const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

const rows = db
  .prepare(
    `SELECT s.time, s.total_amount, s.notes, c.name as client_name,
            GROUP_CONCAT(p.name || ' x' || si.quantity) as products
     FROM sales s
     LEFT JOIN clients c ON c.id = s.client_id
     LEFT JOIN sale_items si ON si.sale_id = s.id
     LEFT JOIN products p ON p.id = si.product_id
     WHERE s.date = '2026-07-20' AND s.business_id = 'salgados'
     GROUP BY s.id
     ORDER BY s.time`,
  )
  .all();

console.log("=== VENDAS NO BANCO (20/07/2026) ===");
console.table(rows);

const officialTotals = { Pastel: 0, "Misto com Catupiry": 0, Croissant: 0 };
for (const row of OFFICIAL_LIST) {
  const key = row.product.includes("Pastel")
    ? "Pastel"
    : row.product.includes("Misto")
      ? "Misto com Catupiry"
      : "Croissant";
  officialTotals[key] += row.qty;
}

const dbItems = db
  .prepare(
    `SELECT p.name, SUM(si.quantity) as qty
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE s.date = '2026-07-20' AND s.business_id = 'salgados'
     GROUP BY p.name`,
  )
  .all();

console.log("\n=== TOTAIS OFICIAIS (lista operador) ===");
console.log(officialTotals);
console.log("\n=== TOTAIS NO BANCO ===");
console.table(dbItems);

const clientsInDb = new Set(rows.map((r) => r.client_name).filter(Boolean));
const clientsOfficial = new Set(
  OFFICIAL_LIST.map((r) => r.client.split(" ")[0].replace("(fiado)", "").trim()),
);

console.log("\n=== CLIENTES OFICIAIS vs BANCO ===");
console.log("Na lista:", OFFICIAL_LIST.length, "transações");
console.log("No banco:", rows.length, "transações");
console.log("Clientes identificados no banco:", [...clientsInDb]);
console.log("Clientes na lista oficial:", OFFICIAL_LIST.map((r) => r.client));

db.close();
