//this endpoint will return inventory lot information

import { NextResponse} from "next/server";
import prisma from "@/lib/db";
import {serverError} from "@/utils/responses";

export async function GET() {
  
 
  try {
    const movements = await prisma.inventoryLot.findMany({

      orderBy: {qtyOnHand: "desc"},
    });

    return NextResponse.json(movements, {status: 200});
  } catch (e) {
    return serverError('error', 'fetch', e)
  }
}