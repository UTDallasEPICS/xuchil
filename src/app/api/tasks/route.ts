import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
        ...(productId !== null && { productId }),
        ...(workerId !==null && { workerId }),
        ...(status !== null && { status }),
        ...(since !== null && { startTimestamp: { gte: since } }),
        ...(until !== null && { endTimestamp: { lte: until} }),
      },
      include: {
        worker: {
          omit: {
            passwordHash: true
          }
        },
        product: true
      },
      orderBy: {
        startTimestamp: 'desc'
      }
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body= await request.json();

    const task = await prisma.task.create({
      data: {
        workerId: body.workerId,
        productId: body.productId,
        activity: body.activity,
        inputWeight: body.inputWeight,
        outputWeight: body.outputWeight,
        lossWeight: body.lossWeight,
        status: body.status,
        notes: body.notes,
      },
      include: {
        worker: true,
        product: true
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}