import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        processSteps: {
          orderBy: {
            order: 'asc'
          }
        },
        productCategory: true
      }
    });
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      error: { 
        message: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const product = await prisma.product.create({
      data: {
        name,
        category,
        is_end_product: is_end_product || false,
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

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: { 
        message: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}