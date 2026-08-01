/**
 * Registra 30/07/2026 — Salgados (ACAL + cota do pai + bonificação).
 * Uso: pnpm tsx scripts/register-day-3007.ts
 */
import "./load-env";
import { parseDayDraft } from "../src/lib/day-registration/draft-parser";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { DRAFT_2026_07_30 } from "./drafts/3007";

const BUSINESS = "salgados";
const DATE = "2026-07-30";
const DEPT_PAI = "Clientes do trabalho do Henrique";

/** Cota do pai (6): 2 clientes sem detalhe + 4 compra própria do Henrique. */
function fatherChannelSales(): DraftSale[] {
  const workplace: DraftSale[] = [
    {
      time: "07:30",
      clientName: "Clientes do trabalho do Henrique",
      productName: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
      quantity: 2,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: DEPT_PAI,
      notes:
        "2 vendidos no trabalho do Henrique — sem horário/nome/sabor/pagamento detalhados; faturamento repassado pelo pai.",
    },
  ];

  // 4 comprados pelo Henrique (sabores da cota: 2 Pastel + 1 Mistao + 1 Croissant;
  // os outros 2 da cota 2M/2P/2C ficam nos clientes sem sabor identificado).
  const henriqueBuy: DraftSale[] = [
    {
      time: "07:45",
      clientName: "Henrique",
      productName: "Pastel de Frango com Presunto",
      quantity: 2,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: DEPT_PAI,
      notes: "Compra própria do Henrique para ajudar a vender os 20 do dia.",
    },
    {
      time: "07:45",
      clientName: "Henrique",
      productName: "Misto com Catupiry",
      quantity: 1,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: DEPT_PAI,
      notes: "Compra própria do Henrique para ajudar a vender os 20 do dia.",
    },
    {
      time: "07:45",
      clientName: "Henrique",
      productName: "Croissant",
      quantity: 1,
      paymentMethod: "pix",
      paymentStatus: "paid",
      department: DEPT_PAI,
      notes: "Compra própria do Henrique para ajudar a vender os 20 do dia.",
    },
  ];

  return [...workplace, ...henriqueBuy];
}

async function applyBonusAndNarrative(plan: DayRegistrationPlan): Promise<void> {
  const entry = await getDiaryEntry(BUSINESS, DATE);
  if (!entry) throw new Error("Diário 30/07 não encontrado após commit.");

  const bonusIncome = 14;
  const bonusIncomeDescription =
    "Bonificação do Henrique: R$14,00 (R$1,00 por salgado vendido por mim na ACAL, conforme fechamento do dia).";
  const profitSalgados = 55;
  const totalProfit = deriveDiaryTotalProfit({ profit: profitSalgados, bonusIncome });

  await upsertDiaryEntry({
    ...entry,
    profit: profitSalgados,
    bonusIncome,
    bonusIncomeDescription,
    quantitySold: 19,
    quantityLost: 1,
    lossReason: "1 salgado sumiu na ACAL (sabor e autor desconhecidos).",
    sales: {
      paidCount: 19,
      creditCount: 1,
      fatherSale: {
        units: 2,
        amount: 10,
        buyerName: "Clientes do trabalho do Henrique",
      },
    },
    observations: plan.observations,
    manualInsights: [
      plan.manualInsights,
      bonusIncomeDescription,
      `Lucro operacional salgados: R$${profitSalgados.toFixed(2)} (faturamento R$95 − investimento próprio R$40).`,
      `Lucro total do dia: R$${totalProfit.toFixed(2)} (salgados + bonificação).`,
      "Sabor novo Frango com Catupiry: Anderson preferiu o Mistão (mais recheio). Avaliar trazer só sob encomenda / pouca quantidade.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    commercialIntelligence: {
      whatWeLearnedToday: [
        "Novo sabor Frango com Catupiry: feedback de menos recheio vs Mistão — risco de não sustentar venda diária.",
        "Cota do pai: 2 vendas a clientes dele (sem detalhe) + 4 compra própria do Henrique.",
        bonusIncomeDescription,
      ],
      conclusion: `Lucro total R$${totalProfit.toFixed(2)} = R$${profitSalgados.toFixed(2)} salgados + R$${bonusIncome} bonificação.`,
    },
    lessonsLearned:
      "Frango só com catupiry pode não render todos os dias; priorizar Mistão ou trazer o novo sabor sob demanda.",
  });

  console.log(
    `Bonificação aplicada: lucro salgados R$${profitSalgados} + bônus R$${bonusIncome} = R$${totalProfit.toFixed(2)}`,
  );
}

async function main(): Promise<void> {
  const { plan, errors, warnings } = parseDayDraft(DRAFT_2026_07_30);
  if (!plan || errors.length > 0) {
    console.error("Erros de parse:", errors);
    throw new Error("Parse falhou em 30/07");
  }

  plan.summary = {
    ...plan.summary,
    revenue: 95,
    profit: 55,
    quantitySold: 19,
    quantityLost: 1,
    lossReason: "1 salgado sumiu na ACAL (sabor e autor desconhecidos).",
  };

  plan.sales = [...plan.sales, ...fatherChannelSales()];

  // Garante clientes do canal do pai no preview/commit.
  const names = new Set(plan.newClients.map((c) => c.name.toLowerCase()));
  for (const sale of fatherChannelSales()) {
    if (!names.has(sale.clientName.toLowerCase())) {
      plan.newClients.push({
        name: sale.clientName,
        sector: DEPT_PAI,
        notes: "Canal trabalho do Henrique — 30/07/2026.",
      });
      names.add(sale.clientName.toLowerCase());
    }
  }

  const paidUnits = plan.sales
    .filter((s) => s.paymentStatus === "paid")
    .reduce((sum, s) => sum + s.quantity, 0);
  const pendingUnits = plan.sales
    .filter((s) => s.paymentStatus !== "paid")
    .reduce((sum, s) => sum + s.quantity, 0);
  const frango = plan.sales
    .filter((s) => s.productName.includes("Frango com Catupiry"))
    .reduce((sum, s) => sum + s.quantity, 0);

  console.log("--- 2026-07-30 preview ---");
  console.log(`Linhas de venda: ${plan.sales.length}`);
  console.log(`Pagas: ${paidUnits} un · Pendentes/perda: ${pendingUnits} un`);
  console.log(`Frango com Catupiry: ${frango} un`);
  console.log(`Faturamento: R$${plan.summary.revenue} · Lucro salgados: R$${plan.summary.profit}`);
  console.log(`Compra: ${plan.purchase?.totalUnits} un · próprio R$${plan.purchase?.ownInvestment} · pai R$${plan.purchase?.thirdParty?.amount}`);
  if (warnings.length) console.log("Avisos:", warnings.slice(0, 6).join(" | "));

  if (paidUnits !== 19 || pendingUnits !== 1) {
    throw new Error(`Contagem inesperada: paid=${paidUnits} pending=${pendingUnits}`);
  }
  if (frango !== 3) {
    throw new Error(`Esperava 3 Frango com Catupiry, veio ${frango}`);
  }

  await cleanupOperationDay(BUSINESS, DATE);
  const existing = await countSalesForDate(BUSINESS, DATE);
  if (existing > 0) {
    throw new Error(`Dia ainda tem ${existing} venda(s) após limpeza.`);
  }

  const sanitized = sanitizeRegistrationPlan(plan);
  const result = await commitDayRegistration(sanitized);
  console.log(`✅ Commit: ${result.saleIds.length} vendas, diário ${result.diaryId}`);

  await applyBonusAndNarrative(plan);

  const { execSync } = await import("child_process");
  execSync(`pnpm tsx scripts/sync-all-operational-profits.ts ${BUSINESS}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  const finalEntry = await getDiaryEntry(BUSINESS, DATE);
  console.log("\n=== 30/07 conferência ===");
  console.log({
    revenue: finalEntry?.revenue,
    profit: finalEntry?.profit,
    bonusIncome: finalEntry?.bonusIncome,
    totalProfit: deriveDiaryTotalProfit({
      profit: finalEntry?.profit ?? 0,
      bonusIncome: finalEntry?.bonusIncome,
    }),
    quantitySold: finalEntry?.quantitySold,
    quantityLost: finalEntry?.quantityLost,
  });
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
