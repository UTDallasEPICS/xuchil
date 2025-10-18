import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;

  try {
    const itemIdParsed = parseInt(itemId);
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemIdParsed },
      include: { inventoryLots: true },
    });

    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch item details" }, { status: 500 });
  }
}
