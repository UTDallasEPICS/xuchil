import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
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
      where: { id: id },
      include: {
        processSteps: {
          orderBy: {
            order: 'asc'
          }
        },
        category: true
      }
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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();

    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: {message: 'Id not a number'}
      }, {status: 400});
    }

    const updatedProduct = await prisma.product.update({
      where: {id: id},
      data: {
        name: body.name,
        categoryId: body.categoryId,
        isEndProduct: body.isEndProduct,
        imageSrc: body.imageSrc,
        processSteps: {
          create: body.processSteps.map((step: any, index: number) => ({
            title: step.title,
            description: step.description,
            estimatedTime: step.estimatedTime,
            hasInput: step.hasInput,
            unit: step.unit,
            order: index,
          }))
        }
      },
      include: {
        processSteps: true,
        category: true
      }
    });

    return NextResponse.json({data: updatedProduct}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to update product', details: error}
    }, {status: 500});
  }
}


export async function DELETE(
  _req: NextRequest,
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

    return new NextResponse(null, {status: 204})
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      error: {message: 'Failed to delete product', details: error}
    }, {status: 500});
  }
}



