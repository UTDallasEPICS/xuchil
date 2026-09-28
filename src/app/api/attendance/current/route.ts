import {NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {getAuthenticatedWorkerId} from '@/lib/attendance';
import {serverError} from '@/utils/responses';

export async function GET() {
  const workerId = await getAuthenticatedWorkerId();
  if (!workerId) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const shift = await prisma.workerShift.findFirst({
      where: {workerId, endedAt: null},
      orderBy: {startedAt: 'desc'},
    });

    return NextResponse.json(shift);
  } catch (error) {
    return serverError('current shift', 'fetch', error);
  }
}