import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {inventoryMovementSchema} from "@/lib/schemas";
import { z } from "zod";

export async function POST(request: NextRequest) {

  let body: unknown;
  try {
    body = await request.json();
  }
  catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = inventoryMovementSchema.safeParse(body);

  if(!result.success){
    const formattedErr = z.flattenError(result.error);
    return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
  }

    // Create adjustment movement
    try{
      const adjustment = await prisma.inventoryMovement.create({
        data: result.data
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

