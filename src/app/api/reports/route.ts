import { NextRequest, NextResponse } from "next/server";
import { getDayReport } from "@/lib/analytics";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = parseBusinessIdParam(searchParams.get("businessId"));
    const type = searchParams.get("type") ?? "daily";
    const today = new Date();

    let start: string;
    let end: string;

    switch (type) {
      case "weekly":
        start = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        end = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "monthly":
        start = format(startOfMonth(today), "yyyy-MM-dd");
        end = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "yearly":
        start = format(startOfYear(today), "yyyy-MM-dd");
        end = format(endOfYear(today), "yyyy-MM-dd");
        break;
      default:
        start = format(today, "yyyy-MM-dd");
        end = start;
    }

    if (type === "daily") {
      const report = await getDayReport(start, businessId);
      return NextResponse.json({ type, period: { start, end }, ...report });
    }

    const days: Awaited<ReturnType<typeof getDayReport>>[] = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      days.push(await getDayReport(format(current, "yyyy-MM-dd"), businessId));
      current = subDays(current, -1);
    }

    const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
    const totalProfit = days.reduce((s, d) => s + d.profit, 0);
    const totalItems = days.reduce((s, d) => s + d.itemsSold, 0);

    return NextResponse.json({
      type,
      period: { start, end },
      totalRevenue,
      totalProfit,
      totalItems,
      totalSales: days.reduce((s, d) => s + d.salesCount, 0),
      days,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return apiError(MSG.LOAD_REPORTS);
  }
}
