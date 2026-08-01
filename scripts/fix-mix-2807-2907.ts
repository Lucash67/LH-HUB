/** Corrige mix 28/07 e 29/07 conforme operação real. */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { sales, saleItems, products } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";

async function productIdByName(name: string): Promise<string> {
  const db = await getPostgresDb();
  const rows = await queryAll(db.select().from(products));
  const match = rows.find((p) => p.name === name);
  if (!match) throw new Error(`Produto não encontrado: ${name}`);
  return match.id;
}

async function updateSaleItemProduct(
  saleDate: string,
  saleTime: string,
  productName: string,
): Promise<void> {
  const db = await getPostgresDb();
  const daySales = await queryAll(
    db.select().from(sales).where(eq(sales.saleDate, saleDate)),
  );
  const sale = daySales.find((s) => s.saleTime?.startsWith(saleTime));
  if (!sale) {
    console.warn(`Venda não encontrada: ${saleDate} ${saleTime}`);
    return;
  }
  const productId = await productIdByName(productName);
  await queryRun(
    db.update(saleItems).set({ productId }).where(eq(saleItems.saleId, sale.id)),
  );
  console.log(`OK ${saleDate} ${saleTime} → ${productName}`);
}

async function main(): Promise<void> {
  const croissant = "Croissant";
  const pastel = "Pastel de Frango com Presunto";
  const misto = "Misto com Catupiry";

  // 28/07 — sabor não identificado → croissant / pastel; roubo já é pending (excluído do mix)
  await updateSaleItemProduct("2026-07-28", "10:06", croissant);
  await updateSaleItemProduct("2026-07-28", "10:34", pastel);

  // 29/07 — Jackson registrado como croissant mas era misto (5+5+5)
  await updateSaleItemProduct("2026-07-29", "16:19", misto);

  console.log("Mix corrigido.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
