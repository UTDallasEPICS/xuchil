import prisma from '@/lib/db'
import {NextRequest, NextResponse} from 'next/server';

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

    const step = await prisma.processStep.findUnique({
      where: {id: id},
      include: {
        product: true,
      }
    });

    if (!step) {
      return NextResponse.json({
        error: {message: 'Step not found'}
      }, {status: 404});
    }

    return NextResponse.json({data: step}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to fetch step', details: error}
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

    const updatedStep = await prisma.processStep.update({
      where: {id: id},
      data: {
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

    return NextResponse.json({data: updatedStep}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: 'Failed to update step', details: error}
    }, {status: 500});
  }
}
