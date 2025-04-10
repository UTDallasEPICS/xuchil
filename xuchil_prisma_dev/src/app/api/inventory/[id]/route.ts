import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get a specific inventory item by id
// PUT - Update an existing inventory item
// POST - Add a product to the inventory
const findItem = async(product_id: number) => {
  const item = await prisma.inventory.findUnique({
    where: { id: Number(product_id) },
  });
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const { product_id } = body;

    if(!product_id) {
      return NextResponse.json({ error: "Product ID is missing."}, { status: 400 })
    }

    const item = await findItem(product_id)

    return NextResponse.json( item, { status: 200} )
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}



export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const { product_id, quantity, threshold } = body;

    if(!product_id) {
      return NextResponse.json({ error: "Product ID is missing."}, { status: 400 })
    }

    const additem = await prisma.inventory.create({  //This may not work as expected?
      data: {
        id: Number(product_id),
        quantity,
        threshold,
      },
    });

    await prisma.product.findUnique({   // never actually use this, just to make sure that the item exists in the first place
      where: {id: Number(product_id)}
    })

    const updatedInventory = await prisma.inventory.create({  //This may not work as expected?
      data: {
        id: Number(product_id),
        quantity,
        threshold,
      },
    });

    return NextResponse.json( updatedInventory, { status: 200} )
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to post item' }, { status: 501 })

  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const { product_id, quantity, threshold } = body;

    if(!product_id) {
      return NextResponse.json({ error: "Product ID is missing."}, { status: 400 })
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: Number(product_id) }, 
      data: {
        quantity,
        threshold,
      },
    });

    /*  THIS MAYBE PROBABLY DOESN"T HAVE TO BE IMPLEMENTED WHEN THE PRODUCT TABLE AND API IS ADDED
     *
     * const updatedProduct = await prisma.product.update({
     *   where: { id: Number(product_id) },
     *   data: {
     *     quantity: quantity,
     *   },
     * });
     */
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}