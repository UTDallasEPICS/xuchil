import prisma from '@/lib/db';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters for filtering
  const productId = searchParams.get('product') ? parseInt(searchParams.get('product')!) : null;
  const workerId = searchParams.get('worker') ? parseInt(searchParams.get('worker')!) : null;
  const status = searchParams.get('status') as 'PROGRESSING' | 'PAUSED' | 'DONE';
  const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : null;
  const until = searchParams.get('until') ? new Date(searchParams.get('until')!) : null;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        processStep: {
          ...(productId !== null && {productId}),
        },
        ...(workerId !== null && {workerId}),
        ...(status !== null && {status}),
        ...(since !== null && {startTimestamp: {gte: since}}),
        ...(until !== null && {endTimestamp: {lte: until}}),
      },
      include: {
        worker: {
          omit: {
            passwordHash: true
          }
        },
        processStep: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        startTimestamp: 'desc'
      }
    });

    return NextResponse.json({data: tasks}, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to fetch tasks", details: error},
    }, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        workerId: body.workerId,
        processStepId: body.processStepId,
        inputWeight: body.inputWeight,
        outputWeight: body.outputWeight,
        lossWeight: body.lossWeight,
        status: body.status,
        notes: body.notes,
      },
      include: {
        worker: {
          omit: {
            passwordHash: true
          }
        },
        processStep: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({data: task}, {status: 201});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to create task", details: error},
    }, {status: 500});
  }
}