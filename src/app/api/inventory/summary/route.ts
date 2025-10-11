import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('item_type') as 'RAW' | 'PRODUCT' | null;

    const where = itemType ? { itemType } : {};

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        rawMaterial: true,
        productVariant: true,
        inventoryLots: true,
      },
    });

    const summary = items.map((item) => ({
      id: item.id,
      itemType: item.itemType,
      name:
        item.itemType === 'RAW'
          ? item.rawMaterial?.name
          : item.productVariant?.name,
      totalQuantity: item.inventoryLots.reduce(
        (sum, lot) => sum + Number(lot.qtyOnHand ?? 0),
        0
      ),
    }));

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory summary' },
      { status: 500 }
    );
  }
}
