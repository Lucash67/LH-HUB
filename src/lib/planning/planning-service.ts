import { listDiaryEntries } from "@/lib/diary-service";
import { deriveDiaryTotalProfit } from "@/lib/diary/types";
import { getProfitBankView } from "@/lib/profit-bank-service";
import { MONTH_PLANS, getMonthPlan, type MonthIndicator } from "./month-plans";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export interface PlanningDay {
  date: string;
  weekday: string;
  planned: number;
  profit: number | null;
  received: number | null;
  pending: number | null;
  own: number | null;
  sold: number | null;
  lost: number | null;
  holiday: boolean;
}

export interface PlanningWeek {
  label: string;
  days: number;
  planned: number;
  actual: number;
  registered: number;
}

export interface PlanningScenario {
  id: "conservative" | "realistic" | "ambitious";
  label: string;
  perDay: number;
  monthTotal: number;
  vsGoal: number;
}

export interface PlanningView {
  month: string;
  label: string;
  goal: number;
  dailyTarget: number;
  availableMonths: Array<{ month: string; label: string }>;
  sellingDays: number;
  registeredDays: number;
  remainingDays: number;
  profitDone: number;
  plannedDone: number;
  bank: number | null;
  bankSource: "extrato" | "cofrinho" | null;
  bankNote: string | null;
  practicalBalance: number;
  /** Quanto precisa por dia restante para bater a meta (pelo banco, ou pelo lucro se não houver banco). */
  neededPerRemainingDay: number | null;
  projection: number;
  recentAverage: number;
  days: PlanningDay[];
  extraDays: PlanningDay[];
  weeks: PlanningWeek[];
  scenarios: PlanningScenario[];
  indicators: MonthIndicator[];
  notes: string[];
  summary: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

function monthDates(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  return Array.from({ length: last }, (_, i) => isoDate(y!, m!, i + 1));
}

function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getPlanningView(businessId: string, month: string): Promise<PlanningView> {
  const plan = getMonthPlan(month);
  if (!plan) throw new Error(`Sem plano para ${month}`);

  const dates = monthDates(month);
  const prevDates = monthDates(previousMonth(month));
  const [entries, prevEntries, bankView] = await Promise.all([
    listDiaryEntries(businessId, dates[0], dates[dates.length - 1]),
    listDiaryEntries(businessId, prevDates[0], prevDates[prevDates.length - 1]),
    getProfitBankView(businessId),
  ]);
  const byDate = new Map(entries.map((e) => [e.date, e]));

  const toDay = (date: string, planned: number, holiday: boolean): PlanningDay => {
    const entry = byDate.get(date);
    const profit = entry ? deriveDiaryTotalProfit(entry) : null;
    const received = entry ? entry.revenue.received : null;
    const own = entry && received && received > 0 ? Math.max(0, round2(received - entry.profit)) : null;
    return {
      date,
      weekday: WEEKDAYS[weekdayOf(date)]!,
      planned,
      profit,
      received,
      pending: entry ? entry.revenue.pending : null,
      own,
      sold: entry ? entry.quantitySold : null,
      lost: entry ? entry.quantityLost : null,
      holiday,
    };
  };

  const days: PlanningDay[] = [];
  const extraDays: PlanningDay[] = [];
  for (const date of dates) {
    const wd = weekdayOf(date);
    const weekend = wd === 0 || wd === 6;
    const holiday = plan.holidays.includes(date);
    if (weekend || holiday) {
      if (byDate.has(date)) extraDays.push(toDay(date, 0, holiday));
      continue;
    }
    days.push(toDay(date, plan.dailyTarget, false));
  }

  const registered = days.filter((d) => d.profit != null);
  const lastRegistered = registered.length ? registered[registered.length - 1]!.date : null;
  const remaining = days.filter((d) => d.profit == null && (!lastRegistered || d.date > lastRegistered));
  const profitDone = round2(
    [...registered, ...extraDays].reduce((s, d) => s + (d.profit ?? 0), 0),
  );
  const plannedDone = registered.length * plan.dailyTarget;

  const recentPool = [
    ...prevEntries.map((e) => ({ date: e.date, profit: deriveDiaryTotalProfit(e), wd: weekdayOf(e.date) })),
    ...registered.map((d) => ({ date: d.date, profit: d.profit ?? 0, wd: weekdayOf(d.date) })),
  ]
    .filter((d) => d.wd !== 0 && d.wd !== 6)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);
  const recentAverage = recentPool.length
    ? Math.round(recentPool.reduce((s, d) => s + d.profit, 0) / recentPool.length)
    : plan.dailyTarget;

  let bank: number | null = null;
  let bankSource: PlanningView["bankSource"] = null;
  if (plan.bankDeposited != null) {
    bank = plan.bankDeposited;
    bankSource = "extrato";
  } else if (plan.practicalAtStart != null) {
    bank = round2(Math.max(0, bankView.practicalBalance - plan.practicalAtStart));
    bankSource = "cofrinho";
  }

  const achieved = bank ?? profitDone;
  const gap = round2(plan.goal - achieved);
  const neededPerRemainingDay = remaining.length > 0 && gap > 0 ? Math.ceil(gap / remaining.length) : null;
  const projection = round2(achieved + recentAverage * remaining.length);

  const weekMap = new Map<string, PlanningWeek & { first: string; last: string }>();
  for (const d of days) {
    const [y, m, dd] = d.date.split("-").map(Number);
    const monday = new Date(Date.UTC(y!, m! - 1, dd!));
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const week = weekMap.get(key) ?? {
      label: "",
      first: d.date,
      last: d.date,
      days: 0,
      planned: 0,
      actual: 0,
      registered: 0,
    };
    week.last = d.date;
    week.days += 1;
    week.planned += d.planned;
    week.actual = round2(week.actual + (d.profit ?? 0));
    if (d.profit != null) week.registered += 1;
    weekMap.set(key, week);
  }
  const weeks: PlanningWeek[] = Array.from(weekMap.values()).map(({ first, last, ...w }) => ({
    ...w,
    label: first === last ? `${first.slice(8, 10)}/${first.slice(5, 7)}` : `${first.slice(8, 10)}–${last.slice(8, 10)}/${last.slice(5, 7)}`,
  }));

  const sellingDays = days.length;
  const scenarioDefs: Array<[PlanningScenario["id"], string, number]> = [
    ["conservative", "Conservador", plan.scenarios.conservative],
    ["realistic", "Ritmo recente", recentAverage],
    ["ambitious", "Ambicioso", plan.scenarios.ambitious],
  ];
  const scenarios: PlanningScenario[] = scenarioDefs.map(([id, label, perDay]) => {
    const monthTotal = registered.length
      ? round2(achieved + perDay * remaining.length)
      : perDay * sellingDays;
    return { id, label, perDay, monthTotal, vsGoal: round2(monthTotal - plan.goal) };
  });

  const summary: string[] = [];
  if (remaining.length === 0 && registered.length > 0) {
    const onPlan = registered.filter((d) => (d.profit ?? 0) >= plan.dailyTarget).length;
    summary.push(
      gap <= 0
        ? `Meta de ${brl(plan.goal)} batida: ${brl(achieved)}${bankSource ? " no banco" : " de lucro"}, ${brl(-gap)} acima.`
        : `Meta de ${brl(plan.goal)} não fechou: ${brl(achieved)}, faltaram ${brl(gap)}.`,
    );
    summary.push(`${onPlan} de ${registered.length} dias de venda ficaram em ${brl(plan.dailyTarget)} ou mais.`);
    summary.push(`Lucro no diário: ${brl(profitDone)} (plano dos dias registrados: ${brl(plannedDone)}).`);
  } else {
    summary.push(
      `${registered.length} de ${sellingDays} dias de venda registrados. ${brl(achieved)} ${bankSource ? "no banco" : "de lucro"} até agora.`,
    );
    if (neededPerRemainingDay != null) {
      summary.push(
        `Para ${brl(plan.goal)}: ${brl(neededPerRemainingDay)} por dia nos ${remaining.length} dias que faltam.`,
      );
    } else if (gap <= 0) {
      summary.push(`Meta já batida — ${brl(-gap)} acima.`);
    }
    summary.push(
      `No ritmo recente (${brl(recentAverage)}/dia), o mês fecha em ${brl(projection)}${projection >= plan.goal ? ", acima da meta." : `, ${brl(plan.goal - projection)} abaixo.`}`,
    );
  }

  return {
    month,
    label: plan.label,
    goal: plan.goal,
    dailyTarget: plan.dailyTarget,
    availableMonths: MONTH_PLANS.map((p) => ({ month: p.month, label: p.label })),
    sellingDays,
    registeredDays: registered.length,
    remainingDays: remaining.length,
    profitDone,
    plannedDone,
    bank,
    bankSource,
    bankNote: plan.bankNote ?? (bankSource === "cofrinho" ? "Cofrinho prático atual − saldo no início do mês." : null),
    practicalBalance: bankView.practicalBalance,
    neededPerRemainingDay,
    projection,
    recentAverage,
    days,
    extraDays,
    weeks,
    scenarios,
    indicators: plan.indicators,
    notes: plan.notes,
    summary,
  };
}
