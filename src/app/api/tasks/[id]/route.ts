// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/lib/db';
import { UpdateTaskDto } from 'src/types/tasks';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = parseInt(params.id);
  
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        worker: true,
        product: true
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = parseInt(params.id);
  
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }
  
  try {
    const body: UpdateTaskDto = await request.json();
    
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        worker_id: body.worker_id,
        product_id: body.product_id,
        activity: body.activity,
        input_weight: body.input_weight,
        output_weight: body.output_weight,
        loss_weight: body.loss_weight,
        status: body.status,
        start_timestamp: body.start_timestamp ? new Date(body.start_timestamp) : undefined,
        end_timestamp: body.end_timestamp ? new Date(body.end_timestamp) : undefined,
        notes: body.notes
      },
      include: {
        worker: true,
        product: true
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}