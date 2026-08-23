import "./load-env";
import { getProfitBankView } from "../src/lib/profit-bank-service";
import { listDiaryEntries } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";

async function main() {
  const v = await getProfitBankView("salgados");
  const entries = await listDiaryEntries("salgados");
  const withBonus = entries.filter((e) => (e.bonusIncome ?? 0) > 0);
  const sumOpCol = entries.reduce((s, e) => s + e.profit, 0);
  const sumTotal = entries.reduce((s, e) => s + deriveDiaryTotalProfit(e), 0);
  const sumBonus = entries.reduce((s, e) => s + (e.bonusIncome ?? 0), 0);
  console.log(
    JSON.stringify(
      {
        practical: v.practicalBalance,
        operational: v.currentBalance,
        theoretical: v.theoreticalBalance,
        openPendings: v.openPendings,
        lossesImpact: v.lossesImpact,
        days: v.operationalDays,
        sumOpCol: Math.round(sumOpCol * 100) / 100,
        sumTotalWithBonus: Math.round(sumTotal * 100) / 100,
        sumBonus: Math.round(sumBonus * 100) / 100,
        bonusDays: withBonus.map((e) => ({
          date: e.date,
          profit: e.profit,
          bonus: e.bonusIncome,
          total: deriveDiaryTotalProfit(e),
        })),
        gapPracticalMinusOp: Math.round((v.practicalBalance - v.currentBalance) * 100) / 100,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
