import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get a specific inventory item by id
// PUT - Update an existing inventory item
// POST - Add a product to the inventory

// params: product_id 
// returns: a single product item
export async function GET(
  _req: Request,
  { params }: { params: { id: string } } ) {
  try {
    const product = await prisma.inventory.findUnique({
      where: { product_id: parseInt(params.id) },
    });


    if (!product) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }


    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
  }
}

// params: either quantity or threshold or both in integer format
// returns: the updated inventory item
export async function PUT(
  req: Request,
  { params }: { params: { id: string } } ) {
  try {
    const body = await req.json();
    const { quantity, threshold } = body;

    // Allows the user to enter only quantity, or only threshold, or both
    const dataToUpdate: any = {};
    if (quantity !== undefined) {
      dataToUpdate.quantity = quantity;
    }   
    if (threshold !== undefined) {
      dataToUpdate.threshold = threshold;
    }
    
    const updatedInventoryItem = await prisma.inventory.update({
      where: { product_id: parseInt(params.id) },
      data: dataToUpdate,
    });


    return NextResponse.json(updatedInventoryItem, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}

// params: product_id as an int
// returns: string
export async function DELETE(
  req: Request,
  { params }: {params: {id: string}} ) {
  try {
    await prisma.inventory.delete({
      where: { product_id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Inventory Item deleted (NOT item itself)' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}

