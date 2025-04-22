import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';


export async function GET() {
  try {
    const steps = await prisma.processStep.findMany({
      include: {
        product: true,
      }
    });
    return NextResponse.json({data: steps}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch steps', details: error}
    }, {status: 500});
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const step = await prisma.processStep.create({
      data: {
        productId: body.productId,
        title: body.title,
        description: body.description,
        estimatedTime: body.estimatedTime,
        hasInput: body.hasInput,
        unit: body.unit,
      },
      include: {
        product: true,
      }
    });

    return NextResponse.json({data: step}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to create step', details: error},
    }, {status: 500});
  }
}



