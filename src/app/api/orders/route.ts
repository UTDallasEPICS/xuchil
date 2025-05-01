import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(status && { deliveryStatus: status as any }),
        ...(since && { deliveryDate: { gte: new Date(since) } }),
        ...(until && { deliveryDate: { lte: new Date(until) } }),
      },
      include: {
        productsOrdered: {
          include: {
            product: true
          }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus = 'pending' } = body;

    const order = await prisma.order.create({
      data: {
        client,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        deliveryMethod: deliveryMethod as any,
        deliveryStatus: deliveryStatus as any,
      }
    });

    return NextResponse.json(
      { id: order.id, message: 'Order created successfully' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, client, deliveryAddress, deliveryDate, deliveryMethod, deliveryStatus } = body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        client,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        deliveryMethod: deliveryMethod as any,
        deliveryStatus: deliveryStatus as any,
      }
    });

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
} 