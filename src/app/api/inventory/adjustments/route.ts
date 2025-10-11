import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MovementDirection, MovementReason } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lotId, qty, unitId, note } = body;

    const adjustment = await prisma.inventoryMovement.create({
      data: {
        inventoryLotId: lotId,
        direction: qty >= 0 ? MovementDirection.IN : MovementDirection.OUT,
        qty: Math.abs(qty),
        unitId,
        reason: MovementReason.ADJUSTMENT,
        note,
        movedAt: new Date(),
      },
    });

    return NextResponse.json(adjustment);
  } catch (error) {
    console.error('Error creating inventory adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to create adjustment' },
      { status: 500 }
    );
  }
}
