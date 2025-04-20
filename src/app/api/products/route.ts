import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';


export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({data: products}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch products', details: error}
    }, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {name, category, isEndProduct} = body;


    const product = await prisma.product.create({
      data: {
        name,
        category,
        isEndProduct,
      },
    });

    return NextResponse.json({data: product}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to create product', details: error},
    }, {status: 500});
  }
}



