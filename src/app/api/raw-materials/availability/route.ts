import { NextRequest, NextResponse } from "next/server";
import { getRawMaterialAvailability } from "@/lib/availability";
import { serverError } from "@/utils/responses";

export async function GET(request: NextRequest) {
  try {
    const idsRaw = request.nextUrl.searchParams.get("ids");
    let ids: number[] | undefined;
    if (idsRaw) {
      ids = idsRaw
        .split(",")
        .map((value) => parseInt(value.trim(), 10))
        .filter((value) => !Number.isNaN(value));
    }

    const availability = await getRawMaterialAvailability(ids);
    return NextResponse.json(Array.from(availability.values()));
  } catch (error) {
    return serverError("raw material availability", "fetch", error);
  }
}
