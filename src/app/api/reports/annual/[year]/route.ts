import { NextResponse } from "next/server";
import { getAnnualReportData } from "@/lib/reports/annual-report";
import { serverError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const reportYear = Number(year);
  const session = await verifySession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {status: 401}
    );
  }

  if (!session.isAdmin){
    return NextResponse.json(
      {error: "Forbidden"},
      {status: 403}
    )
  }

  const thisYear = new Date().getUTCFullYear();

  if (!Number.isInteger(reportYear)||
      reportYear < 2000 ||
      reportYear > thisYear) {
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