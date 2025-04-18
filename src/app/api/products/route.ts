import prisma from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, is_end_product } = body;


    const product = await prisma.product.create({
      data: {
        name,
        category,
        is_end_product: is_end_product || false, // Default to false if not provided
      },
    });


    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}



