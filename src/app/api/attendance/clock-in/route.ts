import {NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import prisma from '@/lib/db';
import {getAuthenticatedWorkerId} from '@/lib/attendance';
import {serverError} from '@/utils/responses';

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function POST() {
  const workerId = await getAuthenticatedWorkerId();
  if (!workerId) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const startedAt = new Date();

  try {
    const shift = await prisma.$transaction(async (transaction) => {
      const openShift = await transaction.workerShift.findFirst({
        where: {workerId, endedAt: null},
        select: {id: true},
      });

      if (openShift) {
        return null;
      }

      return transaction.workerShift.create({
        data: {workerId, startedAt},
      });
    });

    if (!shift) {
      return NextResponse.json(
        {error: 'Worker already has an open shift'},
        {status: 409},
      );
    }

    return NextResponse.json(shift, {status: 201});
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {error: 'Worker already has an open shift'},
        {status: 409},
      );
    }

    return serverError('shift', 'clock in', error);
  }
}