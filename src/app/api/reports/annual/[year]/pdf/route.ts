import { getAnnualReportData } from "@/lib/reports/annual-report";
import { generateAnnualReportPdf } from "@/lib/reports/annual-report-pdf";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
    const payload = await verifySession();

    
    if (!payload) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    // verify if admin if not send 403 error
    if (!payload.isAdmin) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

  //make sure the year entered is valid.
  const { year } = await params;
  const reportYear = Number(year);
  const thisYear = new Date().getUTCFullYear();

  if (!Number.isInteger(reportYear) ||
      reportYear < 2000 ||
      reportYear > thisYear) {
    return Response.json(
      { error: "Invalid year" },
      { status: 400 }
    );
  }

  try {
    const reportData =
      await getAnnualReportData(reportYear);

    const pdf =
      await generateAnnualReportPdf(reportData);

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition":
          `attachment; filename="annual-report-${reportYear}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "Failed to generate annual report:",
      error
    );

    return Response.json(
      { error: "Failed to generate annual report" },
      { status: 500 }
    );
  }
}