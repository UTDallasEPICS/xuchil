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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        isEndProduct: body.isEndProduct,
        imageSrc: body.imageSrc,
      },
    });

    return NextResponse.json({data: product}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to create product', details: error},
    }, {status: 500});
  }
}



