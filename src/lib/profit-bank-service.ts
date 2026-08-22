import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  buildOperationalDayMetrics,
  sortOperationalDays,
} from "@/lib/operational-day-metrics";
import { listDiaryEntries } from "@/lib/diary-service";
import { listSettingsMap, upsertSetting } from "@/platform/db/repositories/settings-repository";
import { isAllBusinesses, SALGADOS_BUSINESS_ID } from "@/lib/business-units";
import { listSalesEnriched } from "@/platform/db/repositories/sale-repository";
import { SALGADO_UNIT_PRICE } from "@/lib/day-registration/pricing";

/** Preço de venda unitário padrão (Salgados) — base para impacto de perdas no cofre. */
export const PROFIT_BANK_UNIT_SALE_PRICE = SALGADO_UNIT_PRICE;

const PRACTICAL_KEY_PREFIX = "profit_bank_practical_";

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
}

export interface ProfitBankPendingItem {
  id: string;
  date: string;
  amount: number;
  clientName: string;
  notes: string | null;
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
}

function practicalKey(businessId: string): string {
  const slug = isAllBusinesses(businessId) ? "all" : businessId;
  return `${PRACTICAL_KEY_PREFIX}${slug}`;
}

async function readPracticalBalance(businessId: string): Promise<number | null> {
  const map = await listSettingsMap();
  const raw = map[practicalKey(businessId)] ?? map[`${PRACTICAL_KEY_PREFIX}${SALGADOS_BUSINESS_ID}`];
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Atualiza o saldo prático (extrato) do cofrinho. */
export async function setPracticalProfitBankBalance(
  businessId: string,
  amount: number,
): Promise<void> {
  const key = practicalKey(isAllBusinesses(businessId) ? SALGADOS_BUSINESS_ID : businessId);
  await upsertSetting(key, String(Math.round(amount * 100) / 100));
}

export async function getProfitBankView(businessId: string): Promise<ProfitBankView> {
  const [metricsMap, diaryEntries, sales, practicalStored] = await Promise.all([
    buildOperationalDayMetrics(businessId),
    listDiaryEntries(businessId).catch(() => []),
    listSalesEnriched(businessId).catch(() => []),
    readPracticalBalance(businessId),
  ]);

  const rows = sortOperationalDays(metricsMap);
  const diaryByDate = new Map(diaryEntries.map((e) => [e.date, e]));

  let balance = 0;
  let bestDay: { date: string; profit: number } | null = null;
  let lossesUnits = 0;
  let openPendingsFromDiary = 0;

  const history: ProfitBankDay[] = rows.map((row) => {
    const diary = diaryByDate.get(row.date);
    const dayPending = Number(diary?.revenue.pending) || 0;
    const dayLost = Math.max(0, Number(diary?.quantityLost) || 0);
    const dayLossImpact = dayLost * PROFIT_BANK_UNIT_SALE_PRICE;

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
    };
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
  const totalProfit = history.reduce((s, d) => s + d.profit, 0);
  const totalCosts = history.reduce((s, d) => s + d.costs, 0);
  const theoreticalBalance = balance + openPendings + lossesImpact;
  const frictionGap = openPendings + lossesImpact;

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
  };
}
