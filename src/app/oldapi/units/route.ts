import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        factorToBase: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        factorToBase: Number(unit.factorToBase),
      }))
    );
  } catch (error) {
    return serverError("unit", "fetch", error);
  }
}
