import {NextResponse} from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
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
    const order = await prisma.order.findUnique({
      where: {id: id},
      include: {
        productsOrdered: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        error: {message: 'Item not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: order}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch order', details: error}
    }, {status: 500});
  }
} 