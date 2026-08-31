import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  buildOperationalDayMetrics,
  sortOperationalDays,
} from "@/lib/operational-day-metrics";
import { listDiaryEntries } from "@/lib/diary-service";
import { listSettingsMap, upsertSetting } from "@/platform/db/repositories/settings-repository";
import { isAllBusinesses, SALGADOS_BUSINESS_ID } from "@/lib/business-units";
import { isOperationalDay } from "@/lib/operational-calendar";
import { listSalesEnriched } from "@/platform/db/repositories/sale-repository";
import { SALGADO_UNIT_PRICE } from "@/lib/day-registration/pricing";

/** Preço de venda unitário padrão (Salgados) — base para impacto de perdas no cofre. */
export const PROFIT_BANK_UNIT_SALE_PRICE = SALGADO_UNIT_PRICE;

const PRACTICAL_KEY_PREFIX = "profit_bank_practical_";
/** Ajuste manual do ledger (ex.: alinhar ao extrato sem reescrever diários). */
const LEDGER_ADJ_KEY_PREFIX = "profit_bank_ledger_adjustment_";

export interface ProfitBankDayCashFlow {
  /** PIX/cartão no seu extrato no próprio dia da venda. */
  pixOwnSameDay: number;
  /** Dinheiro em espécie (pode ainda não ter ido pro banco). */
  cashSpecies: number;
  /** Canal pai / Colegas do Henrique — não entra no seu PIX. */
  otherChannels: number;
  /** Fiados deste dia quitados depois (caixa noutro dia). */
  fiadoSettledLater: number;
  /** Quits recebidos neste dia de vendas anteriores. */
  quitsReceivedToday: number;
}

export interface ProfitBankDay {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  costs: number;
  saved: number;
  balance: number;
  pending: number;
  lossesUnits: number;
  lossesImpact: number;
  cashFlow: ProfitBankDayCashFlow;
}

export interface ProfitBankPendingItem {
  id: string;
  date: string;
  amount: number;
  clientName: string;
  notes: string | null;
}

export interface ProfitBankCashFlowTotals {
  pixOwnSameDay: number;
  cashSpecies: number;
  otherChannels: number;
  fiadoSettledLater: number;
  quitsReceived: number;
  /**
   * Base que costuma bater com o PIX do extrato:
   * PIX próprio no dia + quits recebidos (sem espécie / sem canal Henrique).
   */
  estimatedPixExtrato: number;
}

export interface ProfitBankView {
  /** Saldo do extrato/banco informado pelo operador (com rendimento). */
  practicalBalance: number;
  /** Lucro operacional acumulado nos diários (sistema). */
  currentBalance: number;
  totalRevenue: number;
  totalProfit: number;
  totalCosts: number;
  operationalDays: number;
  avgDailyProfit: number;
  bestDay: { date: string; profit: number } | null;
  history: ProfitBankDay[];
  /** Fiados ainda abertos — esperados de quitação. */
  openPendings: number;
  pendingCount: number;
  pendingItems: ProfitBankPendingItem[];
  /** Unidades perdidas (já perdidas de fato). */
  lossesUnits: number;
  /** Impacto em R$ das perdas (unidades × preço de venda). */
  lossesImpact: number;
  /**
   * Cofre teórico pleno: lucro do sistema + pendências recuperáveis + perdas
   * (como se tudo tivesse sido pago e nada tivesse sido perdido).
   */
  theoreticalBalance: number;
  /** Diferença teórico − sistema (pendências + perdas). */
  frictionGap: number;
  /** Quebra do dinheiro: PIX próprio × espécie × outros canais × quits. */
  cashFlow: ProfitBankCashFlowTotals;
  /**
   * Ajuste de ledger (pode ser negativo) para alinhar ao extrato
   * sem apagar dias reais — ex.: centavos / atrito residual.
   */
  ledgerAdjustment: number;
}

type EnrichedSale = Awaited<ReturnType<typeof listSalesEnriched>>[number];

function saleAmount(sale: EnrichedSale): number {
  const received = Number(sale.amountReceived);
  if (Number.isFinite(received) && received > 0) return received;
  return Number(sale.totalAmount) || 0;
}

/** Canal que não cai no PIX/extrato do operador (pai / colegas Henrique). */
export function isOtherChannelSale(sale: {
  department?: string | null;
  client?: { name?: string | null } | null;
  notes?: string | null;
}): boolean {
  const dept = (sale.department ?? "").toLowerCase();
  const client = (sale.client?.name ?? "").toLowerCase();
  const notes = (sale.notes ?? "").toLowerCase();
  return (
    dept.includes("henrique") ||
    dept.includes("colegas") ||
    client.includes("colegas do henrique") ||
    (client.includes("henrique") && notes.includes("lote")) ||
    notes.includes("colegas do henrique")
  );
}

function emptyDayCashFlow(): ProfitBankDayCashFlow {
  return {
    pixOwnSameDay: 0,
    cashSpecies: 0,
    otherChannels: 0,
    fiadoSettledLater: 0,
    quitsReceivedToday: 0,
  };
}

function buildCashFlowByDate(sales: EnrichedSale[]): Map<string, ProfitBankDayCashFlow> {
  const byDate = new Map<string, ProfitBankDayCashFlow>();

  const ensure = (date: string) => {
    let row = byDate.get(date);
    if (!row) {
      row = emptyDayCashFlow();
      byDate.set(date, row);
    }
    return row;
  };

  for (const sale of sales) {
    const status = sale.paymentStatus ?? "paid";
    if (status !== "paid" && status !== "partial") continue;

    const amount = saleAmount(sale);
    if (amount <= 0) continue;

    const saleDate = sale.date;
    const settlement = sale.settlementDate ?? sale.paymentDate ?? null;
    const day = ensure(saleDate);

    if (isOtherChannelSale(sale)) {
      day.otherChannels += amount;
      continue;
    }

    const quitLater = !!settlement && settlement > saleDate;
    if (quitLater) {
      day.fiadoSettledLater += amount;
      const receivedDay = ensure(settlement!);
      receivedDay.quitsReceivedToday += amount;
      continue;
    }

    if (sale.paymentMethod === "cash") {
      day.cashSpecies += amount;
      continue;
    }

    // PIX / cartão (e fallback) no dia — o que costuma aparecer no extrato.
    day.pixOwnSameDay += amount;
  }

  return byDate;
}

function sumCashFlows(flows: ProfitBankDayCashFlow[]): ProfitBankCashFlowTotals {
  const pixOwnSameDay = flows.reduce((s, f) => s + f.pixOwnSameDay, 0);
  const cashSpecies = flows.reduce((s, f) => s + f.cashSpecies, 0);
  const otherChannels = flows.reduce((s, f) => s + f.otherChannels, 0);
  const fiadoSettledLater = flows.reduce((s, f) => s + f.fiadoSettledLater, 0);
  const quitsReceived = flows.reduce((s, f) => s + f.quitsReceivedToday, 0);
  return {
    pixOwnSameDay,
    cashSpecies,
    otherChannels,
    fiadoSettledLater,
    quitsReceived,
    estimatedPixExtrato: pixOwnSameDay + quitsReceived,
  };
}

function scopeBusinessId(businessId: string): string {
  return isAllBusinesses(businessId) ? SALGADOS_BUSINESS_ID : businessId;
}

function practicalKey(businessId: string): string {
  const slug = isAllBusinesses(businessId) ? "all" : businessId;
  return `${PRACTICAL_KEY_PREFIX}${slug}`;
}

function ledgerAdjKey(businessId: string): string {
  return `${LEDGER_ADJ_KEY_PREFIX}${scopeBusinessId(businessId)}`;
}

function parseSettingNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(typeof raw === "string" ? raw.replace(/^"|"$/g, "") : raw);
  return Number.isFinite(n) ? n : null;
}

async function readPracticalBalance(businessId: string): Promise<number | null> {
  const map = await listSettingsMap();
  const raw = map[practicalKey(businessId)] ?? map[`${PRACTICAL_KEY_PREFIX}${SALGADOS_BUSINESS_ID}`];
  return parseSettingNumber(raw);
}

async function readLedgerAdjustment(businessId: string): Promise<number> {
  const map = await listSettingsMap();
  const raw = map[ledgerAdjKey(businessId)] ?? map[`${LEDGER_ADJ_KEY_PREFIX}${SALGADOS_BUSINESS_ID}`];
  const n = parseSettingNumber(raw);
  return n == null ? 0 : Math.round(n * 100) / 100;
}

/** Atualiza o saldo prático (extrato) do cofrinho. */
export async function setPracticalProfitBankBalance(
  businessId: string,
  amount: number,
): Promise<void> {
  const key = practicalKey(isAllBusinesses(businessId) ? SALGADOS_BUSINESS_ID : businessId);
  // Preferir chave canônica por slug do negócio (salgados), não "all".
  const canonical = `${PRACTICAL_KEY_PREFIX}${scopeBusinessId(businessId)}`;
  await upsertSetting(canonical, String(Math.round(amount * 100) / 100));
  if (key !== canonical) {
    await upsertSetting(key, String(Math.round(amount * 100) / 100));
  }
}

export async function setProfitBankLedgerAdjustment(
  businessId: string,
  amount: number,
): Promise<void> {
  await upsertSetting(ledgerAdjKey(businessId), String(Math.round(amount * 100) / 100));
}

export async function getProfitBankView(businessId: string): Promise<ProfitBankView> {
  const calId = scopeBusinessId(businessId);
  const [metricsMap, diaryEntries, sales, practicalStored, ledgerAdjustment] = await Promise.all([
    buildOperationalDayMetrics(businessId),
    listDiaryEntries(businessId).catch(() => []),
    listSalesEnriched(businessId).catch(() => []),
    readPracticalBalance(businessId),
    readLedgerAdjustment(businessId),
  ]);

  // Cofrinho Salgados: só dias operacionais (seg–sex). Sábado/domingo (ex.: 08/08 só pai) ficam fora.
  const rows = sortOperationalDays(metricsMap).filter((row) => isOperationalDay(row.date, calId));
  const diaryByDate = new Map(diaryEntries.map((e) => [e.date, e]));
  const cashFlowByDate = buildCashFlowByDate(sales);

  let balance = 0;
  let bestDay: { date: string; profit: number } | null = null;
  let lossesUnits = 0;
  let openPendingsFromDiary = 0;

  const history: ProfitBankDay[] = rows.map((row) => {
    const diary = diaryByDate.get(row.date);
    const dayPending = Number(diary?.revenue.pending) || 0;
    const dayLost = Math.max(0, Number(diary?.quantityLost) || 0);
    const dayLossImpact = dayLost * PROFIT_BANK_UNIT_SALE_PRICE;
    const cashFlow = cashFlowByDate.get(row.date) ?? emptyDayCashFlow();

    openPendingsFromDiary += dayPending;
    lossesUnits += dayLost;
    balance += row.profit;

    if (!bestDay || row.profit > bestDay.profit) {
      bestDay = { date: row.date, profit: row.profit };
    }

    return {
      date: row.date,
      label: format(parseISO(row.date), "dd/MM", { locale: ptBR }),
      revenue: row.revenue,
      profit: row.profit,
      costs: row.costs,
      saved: row.profit,
      balance,
      pending: dayPending,
      lossesUnits: dayLost,
      lossesImpact: dayLossImpact,
      cashFlow,
    };
  });

  // Aplica ajuste de ledger no saldo acumulado (último ponto + totais).
  if (ledgerAdjustment !== 0 && history.length > 0) {
    const last = history[history.length - 1]!;
    last.balance = Math.round((last.balance + ledgerAdjustment) * 100) / 100;
  }
  balance = Math.round((balance + ledgerAdjustment) * 100) / 100;

  // Dias só com quitação (sem operação no diário) ainda entram no total de quits.
  const historyDates = new Set(history.map((d) => d.date));
  const orphanFlows: ProfitBankDayCashFlow[] = [];
  cashFlowByDate.forEach((flow, date) => {
    if (!historyDates.has(date)) orphanFlows.push(flow);
  });

  const pendingItems: ProfitBankPendingItem[] = sales
    .filter((s) => s.paymentStatus === "pending")
    .map((s) => ({
      id: s.id,
      date: s.date,
      amount: Number(s.totalAmount) || 0,
      clientName: s.client?.name ?? "Cliente",
      notes: s.notes ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Preferência: diário homologado; se zerado, cai para vendas pending abertas.
  const salesPendingTotal = pendingItems.reduce((s, p) => s + p.amount, 0);
  const openPendings =
    openPendingsFromDiary > 0 ? openPendingsFromDiary : salesPendingTotal;

  const lossesImpact = lossesUnits * PROFIT_BANK_UNIT_SALE_PRICE;
  const totalRevenue = history.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = Math.round((history.reduce((s, d) => s + d.profit, 0) + ledgerAdjustment) * 100) / 100;
  const totalCosts = history.reduce((s, d) => s + d.costs, 0);
  const theoreticalBalance = balance + openPendings + lossesImpact;
  const frictionGap = openPendings + lossesImpact;
  const cashFlow = sumCashFlows([...history.map((d) => d.cashFlow), ...orphanFlows]);

  // Se ainda não há saldo prático salvo, usa o do sistema (não inventa rendimento).
  const practicalBalance = practicalStored ?? balance;

  return {
    practicalBalance,
    currentBalance: balance,
    totalRevenue,
    totalProfit,
    totalCosts,
    operationalDays: history.length,
    avgDailyProfit: history.length > 0 ? totalProfit / history.length : 0,
    bestDay,
    history,
    openPendings,
    pendingCount: pendingItems.length,
    pendingItems,
    lossesUnits,
    lossesImpact,
    theoreticalBalance,
    frictionGap,
    cashFlow,
    ledgerAdjustment,
  };
}
