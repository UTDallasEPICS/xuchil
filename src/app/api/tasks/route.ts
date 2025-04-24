// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/lib/db';
import { CreateTaskDto, TaskStatus } from 'src/types/tasks';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse query parameters for filtering
  const productId = searchParams.get('product') ? parseInt(searchParams.get('product')!) : undefined;
  const workerId = searchParams.get('worker') ? parseInt(searchParams.get('worker')!) : undefined;
  const status = searchParams.get('status') as TaskStatus | undefined;
  const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : undefined;
  const until = searchParams.get('until') ? new Date(searchParams.get('until')!) : undefined;
  
  // Build where clause based on filters
  const where: any = {};
  
  if (productId) where.product_id = productId;
  if (workerId) where.worker_id = workerId;
  if (status) where.status = status;
  
  // Date range filter for start_timestamp
  if (since) {
    where.start_timestamp = {
      ...(where.start_timestamp || {}),
      gte: since
    };
  }
  
  // Date range filter for end_timestamp
  if (until) {
    where.end_timestamp = {
      ...(where.end_timestamp || {}),
      lte: until
    };
  }
  
  try {
    const tasks = await prisma.task.findMany({
      where,
      include: {
        worker: true,
        product: true
      },
      orderBy: {
        start_timestamp: 'desc'
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
    const body: CreateTaskDto = await request.json();
    
    const { 
      worker_id, 
      product_id, 
      activity, 
      input_weight, 
      output_weight, 
      loss_weight, 
      status, 
      start_timestamp, 
      end_timestamp, 
      notes 
    } = body;

    const task = await prisma.task.create({
      data: {
        worker_id,
        product_id,
        activity,
        input_weight,
        output_weight,
        loss_weight,
        status,
        start_timestamp: start_timestamp ? new Date(start_timestamp) : new Date(),
        end_timestamp: end_timestamp ? new Date(end_timestamp) : null,
        notes
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