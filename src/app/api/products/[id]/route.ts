import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: { 
          message: 'Invalid ID',
          details: null
        }
      }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        processSteps: {
          orderBy: {
            order: 'asc'
          }
        },
        productCategory: true
      }
    });

    if (!product) {
      return NextResponse.json({ 
        error: { 
          message: 'Product not found',
          details: null
        }
      }, { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ 
      error: { 
        message: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, category, is_end_product, imageSrc, processSteps, productCategoryId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: { 
          message: 'Product name is required',
          details: null
        }
      }, { status: 400 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: { 
          message: 'Invalid ID',
          details: null
        }
      }, { status: 400 });
    }

    // Validate productCategoryId if provided
    if (productCategoryId) {
      const parsedId = parseInt(productCategoryId);
      if (isNaN(parsedId)) {
        return NextResponse.json({ 
          error: { 
            message: 'Invalid product category ID',
            details: null
          }
        }, { status: 400 });
      }
      
      // Check if category exists
      const categoryExists = await prisma.productCategory.findUnique({
        where: { id: parsedId }
      });
      
      if (!categoryExists) {
        return NextResponse.json({ 
          error: { 
            message: 'Product category not found',
            details: null
          }
        }, { status: 404 });
      }
    }

    // First, delete existing process steps
    await prisma.processStep.deleteMany({
      where: { productId: id }
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { 
        name, 
        category, 
        is_end_product,
        imageSrc,
        productCategoryId: productCategoryId ? parseInt(productCategoryId) : undefined,
        processSteps: processSteps ? {
          create: processSteps.map((step: any, index: number) => ({
            name: step.name,
            description: step.description,
            order: index
          }))
        } : undefined
      },
      include: {
        processSteps: true,
        productCategory: true
      }
    });

    return NextResponse.json({ data: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: { 
        message: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: { 
          message: 'Invalid ID',
          details: null
        }
      }, { status: 400 });
    }
    
    // Check if product exists before deleting
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ 
        error: { 
          message: 'Product not found',
          details: null
        }
      }, { status: 404 });
    }
    
    // First delete process steps
    await prisma.processStep.deleteMany({
      where: { productId: id }
    });
    
    // Then delete the product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ data: { message: 'Product deleted' } }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: { 
        message: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}