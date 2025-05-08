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
    return NextResponse.json({data: orders}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to fetch orders", details: error},
    }, {status: 500});
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

    return NextResponse.json({ data: order }, {status: 201})
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to create order", details: error},
    }, {status: 500})
  }
}