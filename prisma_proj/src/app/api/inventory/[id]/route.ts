import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

// GET - Get a specific inventory item by id
// PUT - Update an existing inventory item
export async function handler(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id'); 
  
  if (req.method === 'GET') {
    try {
      const item = await prisma.inventory.findUnique({
        where: { id: Number(id) },
      });

      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json(item, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
    }
  }

  if (req.method === 'PUT') {
    const { quantity, threshold } = await req.json();
    try {
      const updatedItem = await prisma.inventory.update({
        where: { id: Number(id) },
        data: { quantity, threshold },
      });

      return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
    }
  }

  // if user tries to do an unsupported SQL command
  return NextResponse.json({ error: "Method Not Allowed. Use 'PUT' or 'GET'" }, { status: 405 });
}
