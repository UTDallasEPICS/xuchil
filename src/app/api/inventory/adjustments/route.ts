import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { lotId, qty, unitId, note } = data;

    // ✅ Validate required fields
    if (!lotId || !qty || !unitId) {
      return NextResponse.json(
        { error: "Missing required fields: lotId, qty, or unitId" },
        { status: 400 }
      );
    }

    // ✅ Create adjustment movement
    const adjustment = await prisma.inventoryMovement.create({
      data: {
        inventoryLotId: Number(lotId),
        direction: qty >= 0 ? "IN" : "OUT", // assuming your schema has "direction"
        qty: Math.abs(qty),
        unitId: Number(unitId),
        reason: "ADJUSTMENT",
        note: note ?? null,
        movedAt: new Date(),
      },
    });

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating adjustment:", error);

    if (error.code === "P2003") {
      // Prisma foreign key violation (lotId or unitId doesn’t exist)
      return NextResponse.json(
        { error: "Invalid lotId or unitId — foreign key not found" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}

