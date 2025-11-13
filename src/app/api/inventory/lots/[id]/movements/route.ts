import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {checkId} from "@/utils/responses";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const [lotId, lotIdError] = checkId('lot', (await context.params).id);
  if (lotIdError !== null) {
    return lotIdError;
  }
  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: {inventoryLotId: lotId},
      orderBy: {movedAt: "desc"},
    });

    return NextResponse.json(movements, {status: 200});
  } catch (error) {
    console.error("Error fetching movements:", error);
    return NextResponse.json(
      {error: "Failed to fetch lot movements"},
      {status: 500}
    );
  }
}
