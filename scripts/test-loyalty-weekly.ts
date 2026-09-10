/**
 * Testes obrigatórios do motor de fidelidade semanal (puro, sem DB).
 * Uso: pnpm tsx scripts/test-loyalty-weekly.ts
 */
import {
  evaluateWeeklyLoyaltyProgress,
  getLoyaltyWeekBounds,
  isLoyaltyEligibleWeekday,
} from "../src/lib/loyalty/evaluate";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function weekEntries(
  weekStart: string,
  days: Array<{ offset: number; qty: number }>,
) {
  return days.map((d) => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() + d.offset);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return {
      entryDate: `${y}-${m}-${day}`,
      quantity: d.qty,
      entryType: "purchase" as const,
    };
  });
}

function runCase(
  name: string,
  days: Array<{ offset: number; qty: number }>,
  expectGoal: boolean,
  expectTotal: number,
  todayOffset = 4,
) {
  const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-07"); // monday
  const today = weekEntries(weekStart, [{ offset: todayOffset, qty: 0 }])[0]!.entryDate;
  const progress = evaluateWeeklyLoyaltyProgress({
    weekStart,
    weekEnd,
    totalUnitsRequired: 6,
    entries: weekEntries(weekStart, days),
    rewards: expectGoal ? [{ status: "available" }] : [],
    todayIso: today,
  });
  assert(progress.goalReached === expectGoal, `${name}: goalReached expected ${expectGoal}`);
  assert(progress.historicalUnits === expectTotal, `${name}: total ${progress.historicalUnits} ≠ ${expectTotal}`);
  if (expectGoal) {
    assert(progress.unitsTowardGoal === 6, `${name}: toward goal should be 6`);
  }
  console.log(`✓ ${name}`);
}

function main() {
  assert(isLoyaltyEligibleWeekday("2026-09-07"), "Mon eligible"); // 07/09/2026 = segunda
  assert(isLoyaltyEligibleWeekday("2026-09-11"), "Fri eligible"); // 11/09/2026 = sexta
  assert(!isLoyaltyEligibleWeekday("2026-09-12"), "Sat not eligible");

  // Caso 1: 1+1+1+1+2  (semana 07–11/09)
  runCase("Caso 1 seg–sex 1+1+1+1+2", [
    { offset: 0, qty: 1 },
    { offset: 1, qty: 1 },
    { offset: 2, qty: 1 },
    { offset: 3, qty: 1 },
    { offset: 4, qty: 2 },
  ], true, 6);

  // Caso 2: 3+3
  runCase("Caso 2 seg 3 ter 3", [
    { offset: 0, qty: 3 },
    { offset: 1, qty: 3 },
  ], true, 6);

  // Caso 3: 6 numa tacada
  runCase("Caso 3 seg 6", [{ offset: 0, qty: 6 }], true, 6);

  // Caso 4: 2+1+3
  runCase("Caso 4 seg 2 qua 1 sex 3", [
    { offset: 0, qty: 2 },
    { offset: 2, qty: 1 },
    { offset: 4, qty: 3 },
  ], true, 6);

  // Caso 5: 5
  runCase("Caso 5 = 5/6", [
    { offset: 0, qty: 1 },
    { offset: 1, qty: 1 },
    { offset: 2, qty: 1 },
    { offset: 3, qty: 1 },
    { offset: 4, qty: 1 },
  ], false, 5);

  // Caso 6: semana termina 4/6 → closed incomplete
  {
    const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-07");
    const progress = evaluateWeeklyLoyaltyProgress({
      weekStart,
      weekEnd,
      totalUnitsRequired: 6,
      entries: weekEntries(weekStart, [{ offset: 0, qty: 4 }]),
      rewards: [],
      todayIso: "2026-09-14", // next monday
    });
    assert(progress.status === "week_closed_incomplete", "Caso 6 status closed");
    assert(!progress.goalReached, "Caso 6 not goal");
    console.log("✓ Caso 6 semana encerrada 4/6");
  }

  // Nova semana 0/6
  {
    const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-14");
    const progress = evaluateWeeklyLoyaltyProgress({
      weekStart,
      weekEnd,
      totalUnitsRequired: 6,
      entries: [],
      rewards: [],
      todayIso: "2026-09-14",
    });
    assert(progress.unitsTowardGoal === 0 && progress.status === "not_started", "nova semana 0/6");
    console.log("✓ Caso 6b nova semana 0/6");
  }

  // Caso 7: reversão
  {
    const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-07");
    const progress = evaluateWeeklyLoyaltyProgress({
      weekStart,
      weekEnd,
      totalUnitsRequired: 6,
      entries: [
        ...weekEntries(weekStart, [{ offset: 0, qty: 6 }]),
        {
          entryDate: weekStart,
          quantity: -2,
          entryType: "reversal",
        },
      ],
      rewards: [],
      todayIso: weekStart,
    });
    assert(progress.historicalUnits === 4 && !progress.goalReached, "Caso 7 reversão 6-2=4");
    console.log("✓ Caso 7 reversão");
  }

  // Caso 11: 8 unidades → meta ok, toward 6
  {
    const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-07");
    const progress = evaluateWeeklyLoyaltyProgress({
      weekStart,
      weekEnd,
      totalUnitsRequired: 6,
      entries: weekEntries(weekStart, [{ offset: 0, qty: 8 }]),
      rewards: [{ status: "available" }],
      todayIso: weekStart,
    });
    assert(progress.historicalUnits === 8 && progress.unitsTowardGoal === 6 && progress.goalReached, "Caso 11");
    console.log("✓ Caso 11 compra 8 → 1 meta");
  }

  // Sábado ignorado
  {
    const { weekStart, weekEnd } = getLoyaltyWeekBounds("2026-09-07");
    const progress = evaluateWeeklyLoyaltyProgress({
      weekStart,
      weekEnd,
      totalUnitsRequired: 6,
      entries: [
        { entryDate: "2026-09-12", quantity: 6, entryType: "purchase" }, // saturday
      ],
      rewards: [],
      todayIso: "2026-09-11",
    });
    assert(progress.historicalUnits === 0, "sábado não conta");
    console.log("✓ Sábado não entra no progresso");
  }

  console.log("\n✅ Todos os testes de motor passaram.");
}

main();
