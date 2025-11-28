import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {idError, serverError} from "@/utils/responses";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const lotId = parseInt((await context.params).id)
  if (isNaN(lotId)) {
    return idError("lot movements")
  }
  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: {inventoryLotId: lotId},
      orderBy: {movedAt: "desc"},
    });

    return NextResponse.json(movements, {status: 200});
  } catch (e) {
    return serverError('lot movements', 'fetch', e)
  }
}
