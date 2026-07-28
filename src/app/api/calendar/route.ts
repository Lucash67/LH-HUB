import { NextRequest, NextResponse } from "next/server";
import { getCalendarData, getDayReport } from "@/lib/analytics";
import { MSG, apiError } from "@/shared/api-messages";
import { parseBusinessIdParam } from "@/lib/business-units";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = parseBusinessIdParam(searchParams.get("businessId"));
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());
    const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
    const date = searchParams.get("date");

    if (date) {
      const report = await getDayReport(date, businessId);
      return NextResponse.json(report);
    }

    const calendar = await getCalendarData(year, month, businessId);
    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Calendar GET error:", error);
    return apiError(MSG.LOAD_CALENDAR);
  }
}
