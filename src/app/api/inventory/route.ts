import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get all items in inventory
// POST - Add a new item to the inventory

// returns an array of product ids (related to the product table) and the quantity and threshold of that inventory item
export async function GET(req: NextRequest) {
  try {
    const inventory = await prisma.inventory.findMany();
    return NextResponse.json({ data: inventory }, { status: 200 } );
  }
  catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to retrieve the inventory" }, { status: 500})
  }
}

// params: product_id (in json, not URL), quantity (integer), threshold (integer)
// This could be switched take product_id in URL easily, but i'm emulating the product formatting
export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { product_id, quantity, threshold } = body;
  
      if (!product_id) {
        return NextResponse.json({ error: "Product ID is missing." }, { status: 400 });
      }
  
      const productExists = await prisma.product.findUnique({
        where: { product_id: Number(product_id) }
      });
  
      if (!productExists) {
        return NextResponse.json({ error: "Product not found. Define a product first and then add to inventory." }, { status: 404 });
      }
  
      const newInventory = await prisma.inventory.create({
        data: {
          product_id,
          quantity,
          threshold,
        },
      });
  
      return NextResponse.json(newInventory, { status: 201 });
    } catch (error) {
      console.error("Inventory POST error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to post item" },
        { status: 500 }
      );
    }
  }
  