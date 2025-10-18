import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { lotId: string } }
) {
  try {
    const lotId = Number(params.lotId);

    if (isNaN(lotId)) {
      return NextResponse.json({ error: "Invalid lot ID" }, { status: 400 });
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: { inventoryLotId: lotId },
      orderBy: { movedAt: "desc" },
    });

    return NextResponse.json(movements, { status: 200 });
  } catch (error) {
    console.error("Error fetching movements:", error);
    return NextResponse.json(
      { error: "Failed to fetch lot movements" },
      { status: 500 }
    );
  }
}
