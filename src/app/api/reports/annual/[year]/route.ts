import { NextResponse } from "next/server";
import { getAnnualReportData } from "@/lib/reports/annual-report";
import { serverError } from "@/utils/responses";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const reportYear = Number(year);

  if (!Number.isInteger(reportYear)) {
    return NextResponse.json(
      { error: "Invalid year" },
      { status: 400 }
    );
  }

  try {
    const report = await getAnnualReportData(reportYear);

    return NextResponse.json(report);
  } catch (error) {
    return serverError("annual report", "fetch", error);
  }
}