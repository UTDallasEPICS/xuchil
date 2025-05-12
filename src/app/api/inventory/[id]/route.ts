import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';

// GET - Get a specific inventory item by id
// PUT - Update an existing inventory item
// POST - Add a product to the inventory

// params: product_id 
// returns: a single product item
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    const product = await prisma.inventory.findUnique({
      where: {id: id},
    });

    if (!product) {
      return NextResponse.json({
        error: {message: 'Item not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: product}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch inventory item', details: error}
    }, {status: 500});
  }
}

// params: either quantity or threshold or both in integer format
// returns: the updated inventory item
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    const body = await req.json();

    const updatedInventoryItem = await prisma.inventory.update({
      where: {id: id},
      data: {
        quantity: body.quantity,
        threshold: body.threshold,
      },
    });


    return NextResponse.json({data: updatedInventoryItem}, {status: 200})
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to update inventory', details: error}
    }, {status: 500})
  }
}

// params: product_id as an int
// returns: string
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    return new NextResponse(null, {status: 204})
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to delete inventory item', details: error}
    }, {status: 500});
  }
}

