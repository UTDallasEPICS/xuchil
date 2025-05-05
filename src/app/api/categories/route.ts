import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        products: true
      }
    });
    return NextResponse.json(categories, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch categories', details: error}
    }, {status: 500});
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const category = await prisma.productCategory.create({
      data: {
        name: body.name,
        imageSrc: body.imageSrc,
      },
      include: {
        products: true
      }
    });
    return NextResponse.json(category, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to create category', details: error}
    }, {status: 500});
  }
}