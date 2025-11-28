import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {inventoryMovementSchema} from "@/lib/schemas";
import {serverError, validationError} from "@/utils/responses";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = inventoryMovementSchema.safeParse(body);
  if (!result.success) {
    return validationError("adjustment", result.error);
  }

  try {
    const adjustment = await prisma.inventoryMovement.create({
      data: result.data
    });
    return NextResponse.json(adjustment, {status: 201});
  } catch (e) {
    return serverError('adjustment', 'create', e)
  }
}

