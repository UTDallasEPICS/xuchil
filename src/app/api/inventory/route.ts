import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get all items in inventory
// POST - Add a new item to the inventory

export async function GET(req: NextRequest) {
  try {
    const inventory = await prisma.user.findMany();
    return NextResponse.json({ message: "Inventory fetched: ", data: inventory }, { status: 200 } );
  }
  catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to retrieve the inventory" }, { status: 500})
  }
}

