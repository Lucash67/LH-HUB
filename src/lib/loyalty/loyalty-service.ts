import { format, getDay, parseISO } from "date-fns";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getPostgresDb } from "@/platform/db/postgres/client";
import { toDbBusinessId } from "@/platform/db/business-id";
import { isPostgres } from "@/platform/db/config";
import { queryAll, queryRun } from "@/platform/db/query";
import { generateId } from "@/shared/ids/generate-id";
import {
  loyaltyEntries,
  loyaltyEvents,
  loyaltyParticipants,
  loyaltyPrograms,
  loyaltyRewards,
  loyaltyWeeks,
  products,
  saleItems,
  sales,
  SALGADOS_LOYALTY_PROGRAM_ID,
} from "@/lib/db/postgres/schema";
import { executeSaleRecord } from "@/platform/db/repositories/sale-repository";
import {
  evaluateWeeklyLoyaltyProgress,
  getLoyaltyWeekBounds,
  isLoyaltyEligibleWeekday,
  type LoyaltyWeekStatus,
  type WeeklyLoyaltyProgress,
} from "@/lib/loyalty/evaluate";

export interface LoyaltyApplyResult {
  applied: boolean;
  reason?: string;
  weekId?: string;
  progress?: WeeklyLoyaltyProgress;
  rewardCreated?: boolean;
  message?: string;
}

function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

async function requirePostgres(): Promise<Awaited<ReturnType<typeof getPostgresDb>>> {
  if (!isPostgres()) {
    throw new Error("Fidelidade exige Postgres.");
  }
  return getPostgresDb();
}

export async function getActiveLoyaltyProgram(businessSlug: string) {
  const db = await requirePostgres();
  const businessId = toDbBusinessId(businessSlug);
  const rows = await queryAll(
    db
      .select()
      .from(loyaltyPrograms)
      .where(and(eq(loyaltyPrograms.businessId, businessId), eq(loyaltyPrograms.active, true)))
      .limit(1),
  );
  if (rows[0]) return rows[0];

  // Fallback seed id se business for salgados
  const byId = await queryAll(
    db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, SALGADOS_LOYALTY_PROGRAM_ID)).limit(1),
  );
  return byId[0] ?? null;
}

export async function ensureLoyaltyProgram(businessSlug: string) {
  const existing = await getActiveLoyaltyProgram(businessSlug);
  if (existing) return existing;

  const db = await requirePostgres();
  const businessId = toDbBusinessId(businessSlug);
  const id = businessSlug === "salgados" ? SALGADOS_LOYALTY_PROGRAM_ID : generateId();
  await queryRun(
    db.insert(loyaltyPrograms).values({
      id,
      businessId,
      name: "Fidelidade Semanal",
      active: true,
      weekStartDay: 1,
      weekEndDay: 5,
      totalUnitsRequired: 6,
      maxRewardsPerWeek: 1,
      rewardQuantity: 1,
      rewardProductRule: "any_eligible",
      allProductsEligible: true,
    }),
  );
  const rows = await queryAll(db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, id)).limit(1));
  return rows[0]!;
}

async function logEvent(input: {
  programId: string;
  clientId?: string | null;
  loyaltyWeekId?: string | null;
  loyaltyEntryId?: string | null;
  loyaltyRewardId?: string | null;
  saleId?: string | null;
  eventType: (typeof loyaltyEvents.$inferInsert)["eventType"];
  quantity?: number | null;
  description: string;
  metadata?: Record<string, unknown>;
  createdBy?: string | null;
}) {
  const db = await requirePostgres();
  await queryRun(
    db.insert(loyaltyEvents).values({
      id: generateId(),
      programId: input.programId,
      clientId: input.clientId ?? null,
      loyaltyWeekId: input.loyaltyWeekId ?? null,
      loyaltyEntryId: input.loyaltyEntryId ?? null,
      loyaltyRewardId: input.loyaltyRewardId ?? null,
      saleId: input.saleId ?? null,
      eventType: input.eventType,
      quantity: input.quantity ?? null,
      description: input.description,
      metadata: input.metadata ?? {},
      createdBy: input.createdBy ?? null,
    }),
  );
}

async function getOrCreateWeek(input: {
  programId: string;
  clientId: string;
  dateIso: string;
}) {
  const db = await requirePostgres();
  const { weekStart, weekEnd } = getLoyaltyWeekBounds(input.dateIso);
  const existing = await queryAll(
    db
      .select()
      .from(loyaltyWeeks)
      .where(
        and(
          eq(loyaltyWeeks.programId, input.programId),
          eq(loyaltyWeeks.clientId, input.clientId),
          eq(loyaltyWeeks.weekStart, weekStart),
        ),
      )
      .limit(1),
  );
  if (existing[0]) return existing[0];

  const id = generateId();
  await queryRun(
    db.insert(loyaltyWeeks).values({
      id,
      programId: input.programId,
      clientId: input.clientId,
      weekStart,
      weekEnd,
      totalUnits: 0,
      status: "not_started",
    }),
  );
  const rows = await queryAll(db.select().from(loyaltyWeeks).where(eq(loyaltyWeeks.id, id)).limit(1));
  return rows[0]!;
}

async function loadWeekProgress(weekId: string, unitsRequired: number): Promise<WeeklyLoyaltyProgress> {
  const db = await requirePostgres();
  const weekRows = await queryAll(db.select().from(loyaltyWeeks).where(eq(loyaltyWeeks.id, weekId)).limit(1));
  const week = weekRows[0];
  if (!week) throw new Error("Semana de fidelidade não encontrada.");

  const entries = await queryAll(
    db.select().from(loyaltyEntries).where(eq(loyaltyEntries.loyaltyWeekId, weekId)),
  );
  const rewards = await queryAll(
    db.select().from(loyaltyRewards).where(eq(loyaltyRewards.loyaltyWeekId, weekId)),
  );

  return evaluateWeeklyLoyaltyProgress({
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    totalUnitsRequired: unitsRequired,
    entries: entries.map((e) => ({
      entryDate: e.entryDate,
      quantity: e.quantity,
      entryType: e.entryType,
    })),
    rewards: rewards.map((r) => ({ status: r.status })),
    todayIso: todayIso(),
  });
}

async function persistWeekState(
  weekId: string,
  progress: WeeklyLoyaltyProgress,
  options?: { markCompletedAt?: boolean },
) {
  const db = await requirePostgres();
  const existing = await queryAll(
    db.select().from(loyaltyWeeks).where(eq(loyaltyWeeks.id, weekId)).limit(1),
  );
  const prev = existing[0];
  await queryRun(
    db
      .update(loyaltyWeeks)
      .set({
        totalUnits: progress.historicalUnits,
        status: progress.status,
        completedAt: progress.goalReached
          ? prev?.completedAt ?? (options?.markCompletedAt ? new Date() : new Date())
          : null,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyWeeks.id, weekId)),
  );
}

async function ensureRewardForCompletedWeek(input: {
  programId: string;
  weekId: string;
  clientId: string;
  maxRewards: number;
  createdBy?: string | null;
}): Promise<boolean> {
  const db = await requirePostgres();
  const existing = await queryAll(
    db
      .select()
      .from(loyaltyRewards)
      .where(
        and(
          eq(loyaltyRewards.loyaltyWeekId, input.weekId),
          inArray(loyaltyRewards.status, ["available", "scheduled", "delivered"]),
        ),
      ),
  );
  if (existing.length >= input.maxRewards) return false;

  const id = generateId();
  await queryRun(
    db.insert(loyaltyRewards).values({
      id,
      loyaltyWeekId: input.weekId,
      programId: input.programId,
      clientId: input.clientId,
      status: "available",
      createdBy: input.createdBy ?? null,
    }),
  );
  await logEvent({
    programId: input.programId,
    clientId: input.clientId,
    loyaltyWeekId: input.weekId,
    loyaltyRewardId: id,
    eventType: "reward_created",
    description: "Recompensa criada — 1 salgado grátis disponível.",
    createdBy: input.createdBy,
  });
  return true;
}

async function invalidateOpenRewards(weekId: string, programId: string, clientId: string, reason: string) {
  const db = await requirePostgres();
  const open = await queryAll(
    db
      .select()
      .from(loyaltyRewards)
      .where(
        and(
          eq(loyaltyRewards.loyaltyWeekId, weekId),
          inArray(loyaltyRewards.status, ["available", "scheduled"]),
        ),
      ),
  );
  for (const reward of open) {
    await queryRun(
      db
        .update(loyaltyRewards)
        .set({
          status: "invalidated",
          invalidatedAt: new Date(),
          invalidationReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyRewards.id, reward.id)),
    );
    await logEvent({
      programId,
      clientId,
      loyaltyWeekId: weekId,
      loyaltyRewardId: reward.id,
      eventType: "reward_invalidated",
      description: reason,
    });
  }

  const delivered = await queryAll(
    db
      .select()
      .from(loyaltyRewards)
      .where(and(eq(loyaltyRewards.loyaltyWeekId, weekId), eq(loyaltyRewards.status, "delivered"))),
  );
  for (const reward of delivered) {
    await logEvent({
      programId,
      clientId,
      loyaltyWeekId: weekId,
      loyaltyRewardId: reward.id,
      eventType: "reward_invalidated",
      description:
        "Inconsistência: progresso caiu abaixo da meta, mas a recompensa já foi entregue. Revisar administrativamente.",
      metadata: { requiresAdminReview: true, rewardId: reward.id },
    });
  }
}

export async function isActiveParticipant(programId: string, clientId: string): Promise<boolean> {
  const db = await requirePostgres();
  const rows = await queryAll(
    db
      .select()
      .from(loyaltyParticipants)
      .where(
        and(
          eq(loyaltyParticipants.programId, programId),
          eq(loyaltyParticipants.clientId, clientId),
          eq(loyaltyParticipants.active, true),
        ),
      )
      .limit(1),
  );
  return Boolean(rows[0]);
}

export async function enrollParticipant(input: {
  businessSlug: string;
  clientId: string;
  notes?: string;
  createdBy?: string | null;
}) {
  const program = await ensureLoyaltyProgram(input.businessSlug);
  const db = await requirePostgres();
  const existing = await queryAll(
    db
      .select()
      .from(loyaltyParticipants)
      .where(
        and(
          eq(loyaltyParticipants.programId, program.id),
          eq(loyaltyParticipants.clientId, input.clientId),
        ),
      )
      .limit(1),
  );

  if (existing[0]) {
    await queryRun(
      db
        .update(loyaltyParticipants)
        .set({
          active: true,
          leftAt: null,
          notes: input.notes ?? existing[0].notes,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyParticipants.id, existing[0].id)),
    );
  } else {
    await queryRun(
      db.insert(loyaltyParticipants).values({
        id: generateId(),
        programId: program.id,
        clientId: input.clientId,
        active: true,
        notes: input.notes ?? null,
      }),
    );
  }

  await logEvent({
    programId: program.id,
    clientId: input.clientId,
    eventType: "participant_joined",
    description: "Cliente entrou no programa de fidelidade.",
    createdBy: input.createdBy,
  });

  return program;
}

export async function deactivateParticipant(input: {
  businessSlug: string;
  clientId: string;
  createdBy?: string | null;
}) {
  const program = await getActiveLoyaltyProgram(input.businessSlug);
  if (!program) return;
  const db = await requirePostgres();
  await queryRun(
    db
      .update(loyaltyParticipants)
      .set({ active: false, leftAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(loyaltyParticipants.programId, program.id),
          eq(loyaltyParticipants.clientId, input.clientId),
        ),
      ),
  );
  await logEvent({
    programId: program.id,
    clientId: input.clientId,
    eventType: "participant_left",
    description: "Cliente saiu do programa de fidelidade.",
    createdBy: input.createdBy,
  });
}

/**
 * Aplica uma venda confirmada ao progresso semanal.
 * Idempotente por (program_id, sale_id) em purchases.
 */
export async function applySaleToLoyalty(input: {
  businessSlug: string;
  saleId: string;
  createdBy?: string | null;
}): Promise<LoyaltyApplyResult> {
  const program = await getActiveLoyaltyProgram(input.businessSlug);
  if (!program || !program.active) {
    return { applied: false, reason: "Programa de fidelidade inativo." };
  }

  const db = await requirePostgres();
  const saleRows = await queryAll(db.select().from(sales).where(eq(sales.id, input.saleId)).limit(1));
  const sale = saleRows[0];
  if (!sale) return { applied: false, reason: "Venda não encontrada." };
  if (!sale.clientId) return { applied: false, reason: "Venda sem cliente." };
  if (!sale.loyaltyConfirmed) {
    return {
      applied: false,
      reason: "Venda registrada, mas não entrou na fidelidade porque o comprovante ainda não foi confirmado.",
    };
  }

  // Recompensa fidelidade (R$0) nunca conta
  if ((sale.notes ?? "").toLowerCase().includes("recompensa fidelidade")) {
    return { applied: false, reason: "Salgado grátis de recompensa não conta para nova fidelidade." };
  }

  if (!isLoyaltyEligibleWeekday(sale.saleDate)) {
    return {
      applied: false,
      reason: "Venda registrada fora do período válido da fidelidade (segunda a sexta).",
    };
  }

  const participant = await isActiveParticipant(program.id, sale.clientId);
  if (!participant) {
    return { applied: false, reason: "Cliente não participa do programa de fidelidade." };
  }

  const dup = await queryAll(
    db
      .select()
      .from(loyaltyEntries)
      .where(
        and(
          eq(loyaltyEntries.programId, program.id),
          eq(loyaltyEntries.saleId, input.saleId),
          eq(loyaltyEntries.entryType, "purchase"),
        ),
      )
      .limit(1),
  );
  if (dup[0]) {
    const progress = await loadWeekProgress(dup[0].loyaltyWeekId, program.totalUnitsRequired);
    return {
      applied: false,
      reason: "Esta venda já contou para a fidelidade.",
      weekId: dup[0].loyaltyWeekId,
      progress,
    };
  }

  const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, input.saleId)));
  const quantity = items.reduce((n, i) => n + i.quantity, 0);
  if (quantity <= 0) return { applied: false, reason: "Venda sem quantidade." };

  const week = await getOrCreateWeek({
    programId: program.id,
    clientId: sale.clientId,
    dateIso: sale.saleDate,
  });

  const entryId = generateId();
  const weekday = getDay(parseISO(sale.saleDate));
  try {
    await queryRun(
      db.insert(loyaltyEntries).values({
        id: entryId,
        loyaltyWeekId: week.id,
        programId: program.id,
        clientId: sale.clientId,
        saleId: input.saleId,
        entryDate: sale.saleDate,
        weekday,
        quantity,
        entryType: "purchase",
        description: `+${quantity} unidade(s) — Venda ${input.saleId.slice(0, 8)}`,
        createdBy: input.createdBy ?? null,
      }),
    );
  } catch (err) {
    // Unique violation = already applied
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("idx_loyalty_entries_purchase_sale_unique") || msg.includes("duplicate")) {
      return { applied: false, reason: "Esta venda já contou para a fidelidade." };
    }
    throw err;
  }

  await logEvent({
    programId: program.id,
    clientId: sale.clientId,
    loyaltyWeekId: week.id,
    loyaltyEntryId: entryId,
    saleId: input.saleId,
    eventType: "purchase_confirmed",
    quantity,
    description: `+${quantity} unidade(s) confirmadas na fidelidade.`,
    createdBy: input.createdBy,
  });

  const progressBeforeGoal = await loadWeekProgress(week.id, program.totalUnitsRequired);
  let rewardCreated = false;

  if (progressBeforeGoal.goalReached) {
    rewardCreated = await ensureRewardForCompletedWeek({
      programId: program.id,
      weekId: week.id,
      clientId: sale.clientId,
      maxRewards: program.maxRewardsPerWeek,
      createdBy: input.createdBy,
    });
    if (rewardCreated) {
      await logEvent({
        programId: program.id,
        clientId: sale.clientId,
        loyaltyWeekId: week.id,
        eventType: "goal_completed",
        description: "Meta semanal concluída.",
        createdBy: input.createdBy,
      });
    }
  }

  const progress = await loadWeekProgress(week.id, program.totalUnitsRequired);
  await persistWeekState(week.id, progress, { markCompletedAt: progress.goalReached });

  const message = progress.goalReached
    ? `🎁 Fidelidade concluída! 1 salgado grátis disponível. Progresso: ${progress.unitsTowardGoal}/${progress.unitsRequired}.`
    : `+${quantity} registrados na fidelidade. Novo progresso: ${progress.unitsTowardGoal}/${progress.unitsRequired}.`;

  return {
    applied: true,
    weekId: week.id,
    progress,
    rewardCreated,
    message,
  };
}

export async function reverseSaleFromLoyalty(input: {
  businessSlug: string;
  saleId: string;
  createdBy?: string | null;
}): Promise<LoyaltyApplyResult> {
  const program = await getActiveLoyaltyProgram(input.businessSlug);
  if (!program) return { applied: false, reason: "Programa inexistente." };

  const db = await requirePostgres();
  const purchases = await queryAll(
    db
      .select()
      .from(loyaltyEntries)
      .where(
        and(
          eq(loyaltyEntries.programId, program.id),
          eq(loyaltyEntries.saleId, input.saleId),
          eq(loyaltyEntries.entryType, "purchase"),
        ),
      ),
  );
  if (purchases.length === 0) {
    return { applied: false, reason: "Venda não tinha lançamento de fidelidade." };
  }

  const purchase = purchases[0]!;
  const reversalId = generateId();
  await queryRun(
    db.insert(loyaltyEntries).values({
      id: reversalId,
      loyaltyWeekId: purchase.loyaltyWeekId,
      programId: program.id,
      clientId: purchase.clientId,
      saleId: input.saleId,
      entryDate: purchase.entryDate,
      weekday: purchase.weekday,
      quantity: -Math.abs(purchase.quantity),
      entryType: "reversal",
      description: `Reversão da venda ${input.saleId.slice(0, 8)} (−${purchase.quantity})`,
      createdBy: input.createdBy ?? null,
    }),
  );

  await logEvent({
    programId: program.id,
    clientId: purchase.clientId,
    loyaltyWeekId: purchase.loyaltyWeekId,
    loyaltyEntryId: reversalId,
    saleId: input.saleId,
    eventType: "sale_cancelled",
    quantity: -Math.abs(purchase.quantity),
    description: `Venda cancelada — progresso revertido (−${purchase.quantity}).`,
    createdBy: input.createdBy,
  });

  const progress = await loadWeekProgress(purchase.loyaltyWeekId, program.totalUnitsRequired);
  if (!progress.goalReached) {
    await invalidateOpenRewards(
      purchase.loyaltyWeekId,
      program.id,
      purchase.clientId,
      "Meta semanal deixou de ser atingida após cancelamento/reversão.",
    );
  }
  const progressAfter = await loadWeekProgress(purchase.loyaltyWeekId, program.totalUnitsRequired);
  await persistWeekState(purchase.loyaltyWeekId, progressAfter);

  return {
    applied: true,
    weekId: purchase.loyaltyWeekId,
    progress: progressAfter,
    message: `Progresso revertido. Agora: ${progressAfter.unitsTowardGoal}/${progressAfter.unitsRequired}.`,
  };
}

export async function adjustLoyaltyProgress(input: {
  businessSlug: string;
  clientId: string;
  dateIso: string;
  quantity: number;
  reason: string;
  createdBy?: string | null;
}): Promise<LoyaltyApplyResult> {
  if (!input.quantity || input.quantity === 0) {
    return { applied: false, reason: "Quantidade inválida." };
  }
  if (!input.reason.trim()) {
    return { applied: false, reason: "Motivo obrigatório." };
  }
  if (!isLoyaltyEligibleWeekday(input.dateIso)) {
    return { applied: false, reason: "Ajuste só em dias de segunda a sexta." };
  }

  const program = await ensureLoyaltyProgram(input.businessSlug);
  const week = await getOrCreateWeek({
    programId: program.id,
    clientId: input.clientId,
    dateIso: input.dateIso,
  });

  const db = await requirePostgres();
  const entryId = generateId();
  await queryRun(
    db.insert(loyaltyEntries).values({
      id: entryId,
      loyaltyWeekId: week.id,
      programId: program.id,
      clientId: input.clientId,
      saleId: null,
      entryDate: input.dateIso,
      weekday: getDay(parseISO(input.dateIso)),
      quantity: input.quantity,
      entryType: "adjustment",
      description: input.reason.trim(),
      createdBy: input.createdBy ?? null,
    }),
  );

  await logEvent({
    programId: program.id,
    clientId: input.clientId,
    loyaltyWeekId: week.id,
    loyaltyEntryId: entryId,
    eventType: "manual_adjustment",
    quantity: input.quantity,
    description: `Ajuste manual: ${input.quantity > 0 ? "+" : ""}${input.quantity} — ${input.reason.trim()}`,
    createdBy: input.createdBy,
  });

  let progress = await loadWeekProgress(week.id, program.totalUnitsRequired);
  let rewardCreated = false;
  if (progress.goalReached) {
    rewardCreated = await ensureRewardForCompletedWeek({
      programId: program.id,
      weekId: week.id,
      clientId: input.clientId,
      maxRewards: program.maxRewardsPerWeek,
      createdBy: input.createdBy,
    });
  } else {
    await invalidateOpenRewards(
      week.id,
      program.id,
      input.clientId,
      "Meta semanal deixou de ser atingida após ajuste manual.",
    );
  }
  progress = await loadWeekProgress(week.id, program.totalUnitsRequired);
  await persistWeekState(week.id, progress, { markCompletedAt: progress.goalReached });

  return {
    applied: true,
    weekId: week.id,
    progress,
    rewardCreated,
    message: `Ajuste aplicado. Progresso: ${progress.unitsTowardGoal}/${progress.unitsRequired}.`,
  };
}

export async function setSaleLoyaltyConfirmed(input: {
  businessSlug: string;
  saleId: string;
  confirmed: boolean;
  createdBy?: string | null;
}): Promise<LoyaltyApplyResult> {
  const db = await requirePostgres();
  await queryRun(
    db
      .update(sales)
      .set({ loyaltyConfirmed: input.confirmed, updatedAt: new Date() })
      .where(eq(sales.id, input.saleId)),
  );

  if (input.confirmed) {
    return applySaleToLoyalty({
      businessSlug: input.businessSlug,
      saleId: input.saleId,
      createdBy: input.createdBy,
    });
  }
  return reverseSaleFromLoyalty({
    businessSlug: input.businessSlug,
    saleId: input.saleId,
    createdBy: input.createdBy,
  });
}

export async function scheduleLoyaltyReward(input: {
  rewardId: string;
  productId: string;
  scheduledFor: string;
  observation?: string;
  createdBy?: string | null;
}) {
  const db = await requirePostgres();
  const rows = await queryAll(
    db.select().from(loyaltyRewards).where(eq(loyaltyRewards.id, input.rewardId)).limit(1),
  );
  const reward = rows[0];
  if (!reward) throw new Error("Recompensa não encontrada.");
  if (reward.status !== "available" && reward.status !== "scheduled") {
    throw new Error("Recompensa não pode ser agendada neste status.");
  }

  await queryRun(
    db
      .update(loyaltyRewards)
      .set({
        status: "scheduled",
        productId: input.productId,
        scheduledFor: input.scheduledFor,
        observation: input.observation ?? null,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyRewards.id, input.rewardId)),
  );

  await logEvent({
    programId: reward.programId,
    clientId: reward.clientId,
    loyaltyWeekId: reward.loyaltyWeekId,
    loyaltyRewardId: reward.id,
    eventType: "reward_scheduled",
    description: `Recompensa agendada para ${input.scheduledFor}.`,
    createdBy: input.createdBy,
  });

  const progress = await loadWeekProgress(
    reward.loyaltyWeekId,
    (await queryAll(db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, reward.programId)).limit(1)))[0]
      ?.totalUnitsRequired ?? 6,
  );
  await persistWeekState(reward.loyaltyWeekId, progress);
}

export async function deliverLoyaltyReward(input: {
  businessSlug: string;
  rewardId: string;
  productId?: string;
  deliveredBy?: string | null;
}): Promise<{ saleId: string }> {
  const db = await requirePostgres();
  const rows = await queryAll(
    db.select().from(loyaltyRewards).where(eq(loyaltyRewards.id, input.rewardId)).limit(1),
  );
  const reward = rows[0];
  if (!reward) throw new Error("Recompensa não encontrada.");
  if (reward.status !== "available" && reward.status !== "scheduled") {
    throw new Error("Recompensa não está disponível para entrega.");
  }

  const productId = input.productId ?? reward.productId;
  if (!productId) throw new Error("Informe o sabor (produto) da recompensa.");

  const productRows = await queryAll(db.select().from(products).where(eq(products.id, productId)).limit(1));
  if (!productRows[0]) throw new Error("Produto não encontrado.");

  const saleId = await executeSaleRecord({
    productId,
    quantity: 1,
    clientId: reward.clientId,
    paymentMethod: "pix",
    paymentStatus: "paid",
    date: todayIso(),
    unitPrice: 0,
    unitCost: 0,
    notes: "Recompensa fidelidade — salgado grátis (R$0). Não conta para nova fidelidade.",
    department: "Fidelidade",
  });

  // Garante que não conta
  await queryRun(
    db
      .update(sales)
      .set({ loyaltyConfirmed: false, amountReceived: "0", totalAmount: "0", profit: "0", updatedAt: new Date() })
      .where(eq(sales.id, saleId)),
  );

  await queryRun(
    db
      .update(loyaltyRewards)
      .set({
        status: "delivered",
        productId,
        deliverySaleId: saleId,
        deliveredBy: input.deliveredBy ?? null,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loyaltyRewards.id, input.rewardId)),
  );

  await logEvent({
    programId: reward.programId,
    clientId: reward.clientId,
    loyaltyWeekId: reward.loyaltyWeekId,
    loyaltyRewardId: reward.id,
    saleId,
    eventType: "reward_delivered",
    quantity: 1,
    description: "Recompensa entregue — 1 salgado grátis.",
    createdBy: input.deliveredBy,
  });

  const program = (
    await queryAll(db.select().from(loyaltyPrograms).where(eq(loyaltyPrograms.id, reward.programId)).limit(1))
  )[0];
  const progress = await loadWeekProgress(reward.loyaltyWeekId, program?.totalUnitsRequired ?? 6);
  await persistWeekState(reward.loyaltyWeekId, progress);

  return { saleId };
}

export async function getClientWeekSnapshot(input: {
  businessSlug: string;
  clientId: string;
  dateIso?: string;
}): Promise<{
  participant: boolean;
  progress: WeeklyLoyaltyProgress | null;
  weekLabel: string | null;
}> {
  const program = await getActiveLoyaltyProgram(input.businessSlug);
  if (!program) return { participant: false, progress: null, weekLabel: null };

  const active = await isActiveParticipant(program.id, input.clientId);
  if (!active) return { participant: false, progress: null, weekLabel: null };

  const dateIso = input.dateIso ?? todayIso();
  const week = await getOrCreateWeek({
    programId: program.id,
    clientId: input.clientId,
    dateIso,
  });
  const progress = await loadWeekProgress(week.id, program.totalUnitsRequired);
  await persistWeekState(week.id, progress);

  return {
    participant: true,
    progress,
    weekLabel: `${progress.weekStart}–${progress.weekEnd}`,
  };
}

export type { WeeklyLoyaltyProgress, LoyaltyWeekStatus };
