import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import {serverError} from "@/utils/responses";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filter: any = {}
  const item_type = searchParams.get("item_type");
  if (item_type != null) {
    filter.itemType = item_type
  }

  try {
    const results = await prisma.inventoryItem.findMany({
      where: filter,
      include: {
        rawMaterial: {
          include: {
            defaultUnit: true,
          },
        },
        productVariant: {
          include: {
            product: true,
            defaultUnit: true,
          },
        },
        inventoryLots: {
          include: {
            unit: true,
          },
        }
      }
    })
    return NextResponse.json(results);
  } catch (e) {
    return serverError('summary', 'fetch', e)
  }
}
