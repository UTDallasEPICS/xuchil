import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';

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

    const product = await prisma.product.findUnique({
      where: {id: id},
    });

    if (!product) {
      return NextResponse.json({
        error: {message: 'Product not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: product}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch product', details: error}
    }, {status: 500});
  }
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const {name, category, isEndProduct} = body;

    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    const updatedProduct = await prisma.product.update({
      where: {id: id},
      data: {name, category, isEndProduct},
    });


    return NextResponse.json({data: updatedProduct}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to update product', details: error}
    }, {status: 500});
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
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    await prisma.product.delete({
      where: {id: id},
    });

    return new NextResponse(null, {status:204})
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      error: {message: 'Failed to delete product', details: error}
    }, {status: 500});
  }
}



