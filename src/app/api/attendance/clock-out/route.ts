import {NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {getAuthenticatedWorkerId} from '@/lib/attendance';
import {serverError} from '@/utils/responses';

export async function POST() {
  const workerId = await getAuthenticatedWorkerId();
  if (!workerId) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const endedAt = new Date();

  try {
    const openShift = await prisma.workerShift.findFirst({
      where: {workerId, endedAt: null},
      orderBy: {startedAt: 'desc'},
      select: {id: true},
    });

    if (!openShift) {
      return NextResponse.json(
        {error: 'Worker does not have an open shift'},
        {status: 404},
      );
    }

    const result = await prisma.workerShift.updateMany({
      where: {id: openShift.id, workerId, endedAt: null},
      data: {endedAt},
    });

    if (result.count !== 1) {
      return NextResponse.json(
        {error: 'Shift was already clocked out or changed'},
        {status: 409},
      );
    }

    const shift = await prisma.workerShift.findUnique({
      where: {id: openShift.id},
    });

    return NextResponse.json(shift);
  } catch (error) {
    return serverError('shift', 'clock out', error);
  }
}