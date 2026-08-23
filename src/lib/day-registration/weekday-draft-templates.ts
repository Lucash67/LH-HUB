import { format, getDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Segunda=1 … Sexta=5 (date-fns getDay: Dom=0). */
export type OperationalWeekday = 1 | 2 | 3 | 4 | 5;

function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return parseISO(input);
  return new Date(input);
}

function uniforBlock(weekday: number): string {
  if (weekday === 5) {
    return `Separados para a Unifor

- Nenhum (não tenho aula nas sextas)

Vendidos: Nenhum`;
  }

  return `Separados para a Unifor

- …

Total Unifor: … unidades
Vendidos: …`;
}

/**
 * Esqueleto do rascunho diário (seg–sex) no formato atual do Lucas.
 * Só preenche a data e o bloco Unifor (sexta sem aula); o resto fica para o dia.
 */
export function buildWeekdayDraftTemplate(input: string | Date = new Date()): string {
  const d = toDate(input);
  const weekday = getDay(d) as number;
  const ddMm = format(d, "dd/MM");

  return `${ddMm}

Encomendados hoje:

- … Mistão frito
- … Carne forno
- … Croissant
- … Pão de queijo

Total: … unidades (R$…)

Separados para o trabalho do Henrique

- …

Total: … unidades
Total vendidos: …

${uniforBlock(weekday)}

Separados para a Acal

- …

Total Acal: … unidades
Total Acal vendidos: …

—— Preencher no fim do dia ——

Lista de vendas na Acal

Período da Manhã:

1 - Nome: 1 salgado | Pix | R$5

Total: … salgados | R$…

Pendentes:
- …

Vendidos em espécie:
- Nenhum

*Os que não identifiquei o sabor foram porque não estive lá para ver e registrar aqui*

Fiados quitados de hoje
- …

Perdas:
- …

OBS:

- …

Custo, Bonificação, Faturamento e Lucro

Custo total dos salgados: R$…
Meu custo total: R$…
Custo de Terceiros: R$…
Bonificação: R$0

Faturamento total esperado: R$… | ... total esperado + quitações: R$…
Faturamento total real: R$…
Faturamento total real do dia: R$…

Lucro total esperado: R$…
Lucro total real: R$…

Cofrinho dos lucros:
- Cofrinho até aqui na teoria: R$ (IA calcula)
- Cofrinho até aqui na prática: R$… (com rendimento — conferir extrato)
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
