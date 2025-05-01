import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';

// GET - Get all items in inventory
// POST - Add a new item to the inventory

// returns an array of product ids (related to the product table) and the quantity and threshold of that inventory item
export async function GET(req: NextRequest) {
  try {
    const inventory = await prisma.inventory.findMany();
    return NextResponse.json({data: inventory}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch inventory', details: error},
    }, {status: 500})
  }
}

// params: product_id (in json, not URL), quantity (integer), threshold (integer)
// This could be switched take product_id in URL easily, but i'm emulating the product formatting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newInventory = await prisma.inventory.create({
      data: {
        productId: body.productId,
        quantity: body.quantity,
        threshold: body.threshold,
      },
    });

    return NextResponse.json({data: newInventory}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to create inventory', details: error},
    }, {status: 500});
  }
}
  
