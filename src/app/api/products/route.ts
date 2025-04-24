import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: { message: "Failed to fetch products", details: error }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, name, isEndProduct, imageSrc } = body;

    const newProduct = await prisma.product.create({
      data: {
        category,
        name,
        isEndProduct,
        imageSrc: imageSrc || null
      }
    });

    return NextResponse.json({ data: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: { message: "Failed to create product", details: error }
    }, { status: 500 });
  }
}



