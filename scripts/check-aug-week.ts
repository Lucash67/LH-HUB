import "./load-env";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { getDiaryEntry } from "@/lib/diary-service";
import { deriveDiaryTotalProfit } from "@/lib/diary/types";

async function main() {
  const dates = ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07"];
  for (const d of dates) {
    const n = await countSalesForDate("salgados", d);
    const diary = await getDiaryEntry("salgados", d);
    console.log(
      d,
      "sales=",
      n,
      "diary=",
      diary
        ? {
            rev: diary.revenue,
            profit: diary.profit,
            bonus: diary.bonusIncome,
            total: deriveDiaryTotalProfit(diary),
            sold: diary.quantitySold,
            lost: diary.quantityLost,
          }
        : null,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
