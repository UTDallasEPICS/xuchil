import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Id not a number' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: id },
    });


    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }


    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { name, category, is_end_product } = body;

    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Id not a number' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: { name, category, is_end_product },
    });


    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}


export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Id not a number' }, { status: 400 });
    }
    await prisma.product.delete({
      where: { id: id },
    });


    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}



