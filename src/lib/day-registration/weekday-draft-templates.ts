import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return parseISO(input);
  return new Date(input);
}

/**
 * Modelo único do rascunho diário (operação Salgados).
 * Só preenche a data; o resto fica para o dia.
 */
export function buildWeekdayDraftTemplate(input: string | Date = new Date()): string {
  const d = toDate(input);
  const ddMm = format(d, "dd/MM");

  return `${ddMm}

Encomendados hoje:

-  Mistão frito
-  Carne forno
-  Croissant
-  Mistão forno
-  Pão de Queijo

Total: unidades (R$)

Separados para o trabalho do Henrique

-  Mistão frito
-  Mistão forno
-  Carne forno
- Croissant

Total: unidades
Total vendidos: Todos (R$)

Separados para a Unifor & Acal:

-  Mistão frito
-  Carne forno
-  Croissant
-  Mistão forno
-  Pão de Queijo

Total: 17 unidades

—— Preencher no fim do dia ——

Lista de vendas na Unifor & Acal:

1 - 
2 - 
3 - 
4 - 
...

Total: … salgados | R$…

Pendências para quitar em aberto:
- Nome da pessoa (data em que pegou fiado): 

Perdas:
- 

Pegos fiados:
- 

Vendidos em espécie:
- 

OBS:

- 

Custo, Bonificação, Faturamento e Lucro

Custo total dos salgados: R$
Meu custo total: R$
Custo de Terceiros: R$
Bonificação: R$

Faturamento total esperado: R$110 | ... total esperado + quitações: R$
Faturamento total real (do dia + quitação): R$
Faturamento total real do dia (somente desse dia): R$

Lucro total esperado: R$
Lucro total real: R$

Cofrinho dos lucros:
- Cofrinho até aqui na teoria: R$ (IA calcula)
- Cofrinho até aqui na prática: R$ (com rendimento — conferir extrato)
`;
}

/** Título padrão das notas de rascunho diário em /notas. */
export function officialDraftNoteTitle(date: string | Date): string {
  const d = toDate(date);
  return `Rascunho oficial ${format(d, "dd/MM/yyyy")} — Salgados`;
}

/** Detecta se a nota já é o rascunho oficial daquele dia (idempotência). */
export function isOfficialDraftNote(
  note: { title?: string | null; noteDate?: string | null },
  date: string,
): boolean {
  if (note.noteDate !== date) return false;
  const title = (note.title ?? "").toLowerCase();
  return title.includes("rascunho oficial") || title.startsWith("rascunho ");
}

/** Datas seg–sex da semana cuja segunda-feira é `weekStart` (yyyy-MM-dd). */
export function operationalWeekDates(weekStart: string): string[] {
  const start = parseISO(weekStart);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}

export function weekdayShortLabel(date: string | Date): string {
  const d = toDate(date);
  const raw = format(d, "EEEE", { locale: ptBR }).replace("-feira", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
