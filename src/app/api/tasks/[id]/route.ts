// app/api/tasks/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import prisma from 'src/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({
      error: {message: 'Id not a number'}
    }, {status: 400});
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: id,
      },
      include: {
        worker: {
          omit: {
            passwordHash: true
          }
        },
        product: true
      }
    });

    if (!task) {
      return NextResponse.json({error: "Task not found"}, {status: 404});
    }

    return NextResponse.json(task, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to fetch task", details: error}
    }, {status: 500});
  }
}

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
      },
      data: {
        workerId: body.workerId,
        productId: body.productId,
        activity: body.activity,
        inputWeight: body.inputWeight,
        outputWeight: body.outputWeight,
        lossWeight: body.lossWeight,
        status: body.status,
        notes: body.notes
      },
      include: {
        worker: {
          omit: {
            passwordHash: true
          }
        },
        product: true
      }
    });

    return NextResponse.json(updatedTask, {status: 200});
  } catch (error) {
    return NextResponse.json({
      error: {message: "Failed to update task", details: error}
    }, {status: 500});
  }
}