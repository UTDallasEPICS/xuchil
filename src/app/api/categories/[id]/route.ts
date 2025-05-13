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

    const category = await prisma.productCategory.findUnique({
      where: {id: id},
      include: {
        products: true
      }
    });

    if (!category) {
      return NextResponse.json({error: {message: 'Category not found'}}, {status: 404});
    }

    return NextResponse.json({data: category}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch category', details: error}
    }, {status: 500});
  }
}

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

    const updatedCategory = await prisma.productCategory.update({
      where: {id},
      data: {
        name: body.name,
        imageSrc: body.imageSrc,
      },
      include: {
        products: true
      }
    });

    return NextResponse.json({data: updatedCategory}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to update category', details: error},
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

    // Then delete the category
    await prisma.productCategory.delete({
      where: {id}
    });

    return new NextResponse(null, {status: 204})
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to delete category', details: error}
    }, {status: 500});
  }
}