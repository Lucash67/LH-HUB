/**
 * Alinha 20/08 à nota reorganizada (fat R$119 · lucro R$79 · perda cega R$11).
 * Uso: CONFIRM_ALIGN_2008=1 pnpm tsx scripts/align-2008-note.ts
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { stickyNotes } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";

const BODY = `Encomendados hoje:

- 12 Mistão frito
- 5 Carne forno
- 5 Croissant
- 3 Pão de queijo
- 1 Carne de Hambúguer

Total: 26 unidades (R$91)

Separados para o trabalho do Henrique

- 2 Mistão frito
- 2 Carne forno
- 2 Croissant forno  

Total: 6 unidades
Total vendidos: todos (R$30)

Separados para a Unifor

- 2 Mistão frito 
- 2 Carne forno
- 2 Croissant

Vendidos: Apenas 1, o resto sempre levo para vender na acal

Separados para a Acal

- 8 Mistão frito
- 1 Carne forno
- 1 Croissant
- 3 Pão de queijo
- 1 Carne de Hambúguer

Total Acal: 14 unidades

—— Fechamento ——

Lista de vendas na Acal

Período da Manhã:

1 - Henrique Alberto Matos Da Rocha: 6 salgados | Pix | R$30
2 - Cássio Adriel De Oliveira Silva: 1 salgado | Pix | R$5
3 - Francisco Ricardo Feijao Pinho: 1 salgado | Pix | R$5
4 - Arthur Xavier De Magalhaes: 1 salgado | Pix | R$5
5 - Vanderson Dias: 1 salgado | Pix | R$5
6 - Raimunda Raimunda Sousa: 1 salgado | Pix | R$4 (vendi a 4 pq era muito pequeno)
7 - Ana Laura Ferreira Pinto: 2 salgados | Pix | R$10 (5 de hoje e 5 de ontem)
8 - Danilo Duarte Nobre: 1 salgado | Pix | R$5
9 - Paulo Andre C Oliveira: 1 salgado | Pix | R$3,50 (salgado de ontem, consegui vender somente a 3,50 ao inves de 4)
10 - Francisco Anderson Das Chagas Xavier Rocha: 1 salgado | Pix | R$5
11 - Anselmo Gabriel Freire Da Silva: 1 salgado | Pix | R$5
12 - Cristiano Messias Lopes: 1 salgado | Pix | R$5
13 - Arthur Cavalcante Passos: 1 salgado | Pix | R$5
14 - Cristiano Messias Lopes: 1 salgado | Pix | R$5
15 - Maria Mikelly Monteiro Coutinho: 2 salgados | Pix | R$10 (5 de hoje e 5 de ontem)
16 - Henrique Alberto Matos Da Rocha: 3 salgados | Pix | R$15

Vendidos em espécie:

1 - Bernardo: 1 Salgado
2 - Lucas Moraes: 1 Mistao frito (não precisou pagar pois usou o dinheiro que já tinha dado como "crédito", isso foi explicado no dia anterior)

*Os que não identifiquei o sabor foram porque não estive lá para ver e registrar aqui*

Quitações recebidas neste dia (contam no caixa do 19/08):
- Ana Laura: R$5 (fiado do 19)
- Mikely: R$5 (fiado do 19)
- Paulo André: R$3,50 (fiado do 19)

Perdas:
- R$11 de gap vs 26 un a R$5 (2 un cegas + R$1 Raimunda). Motivo não identificado / perda cega.

OBS:

- Fazer o novo cardápio e novas estratégias para vender mais

Custo, Bonificação, Faturamento e Lucro

Custo total dos salgados: R$91
Meu custo total: R$40
Custo de Terceiros: R$51
Bonificação: R$0

Faturamento total esperado: R$143,50 (COM A QUITAÇÃO DE TODOS E QUALQUER OUTRA ENTRADA)
Faturamento total real (TODAS AS ENTRADAS): R$132,50
Faturamento total real do dia: R$119 (SOMENTE VENDAS DESSE DIA)

Lucro total esperado: R$80
Lucro total real: R$79

Cofrinho dos lucros:
- Cofrinho até aqui na teoria: R$ (IA calcula)
- Cofrinho até aqui na prática: R$1.571,95 (com rendimento — conferir extrato)

—— Sistema ——
Registrado: fat dia R$119 · lucro R$79 · 24 vendidos · 2 perdas cegas. Quitações no 19 (R$13,50).`;

async function main() {
  if (process.env.CONFIRM_ALIGN_2008 !== "1") {
    console.error("Abortado: CONFIRM_ALIGN_2008=1");
    process.exit(1);
  }

  const entry = await getDiaryEntry("salgados", "2026-08-20");
  if (!entry) throw new Error("Diário 20/08 ausente");
  if (Number(entry.revenue.received) !== 119 || Number(entry.profit) !== 79) {
    throw new Error(`Diário inesperado fat=${entry.revenue.received} lucro=${entry.profit}`);
  }

  await upsertDiaryEntry({
    ...entry,
    quantityLost: 2,
    lossReason:
      "Perda cega: gap de R$11 vs 26 un a R$5 (2 un sem identificação + R$1 desconto Raimunda). Motivo não identificado.",
    observations: [
      "FECHAMENTO 20/08 — nota reorganizada (bate com sistema).",
      "Encomenda 26 un = R$91 (próprio R$40 + terceiros R$51).",
      "Fat dia R$119 · todas entradas do dia R$132,50 (= 119 + quits 13,50 no 19).",
      "Lucro R$79 (= 119 − 40). Esperado R$80 (sem desconto Raimunda).",
      "24 vendidos · 2 perdas cegas.",
      "Henrique Alberto 6 = lote trabalho (não duplicar).",
      "Cofrinho prática: R$1.571,95.",
    ].join("\n"),
    manualInsights:
      "Nota reorganizada fecha: 119/79. R$11 = 2 un cegas (R$10) + Raimunda −R$1. Quits no 19.",
  });
  console.log("✓ Diário 20/08 lossReason/obs atualizados");

  const db = await getPostgresDb();
  const notes = await queryAll(
    db.select().from(stickyNotes).where(and(eq(stickyNotes.noteDate, "2026-08-20"), eq(stickyNotes.archived, false))),
  );

  for (const note of notes) {
    const isDraft = (note.title ?? "").toLowerCase().includes("rascunho");
    if (isDraft) {
      await queryRun(
        db
          .update(stickyNotes)
          .set({ archived: true, updatedAt: new Date(), clientUpdatedAt: new Date() })
          .where(eq(stickyNotes.id, note.id)),
      );
      console.log("✓ Rascunho 20/08 arquivado:", note.title);
    } else {
      await queryRun(
        db
          .update(stickyNotes)
          .set({
            title: "Salgados — 20/08 FECHADO ✓",
            body: BODY,
            updatedAt: new Date(),
            clientUpdatedAt: new Date(),
          })
          .where(eq(stickyNotes.id, note.id)),
      );
      console.log("✓ Nota FECHADO 20/08 sincronizada");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
