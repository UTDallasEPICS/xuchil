import {NextRequest, NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import prisma from '@/lib/db';
import {shiftCorrectionSchema} from '@/lib/schemas';
import {canManageAttendance, getAuthenticatedAttendanceContext} from '@/lib/attendance';
import {intervalsOverlap} from '@/lib/attendance-calculations';
import {idError, notFoundError, serverError, validationError} from '@/utils/responses';

type RouteContext = {params: Promise<{id: string}>};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authContext = await getAuthenticatedAttendanceContext();
  if (!authContext || !canManageAttendance(authContext)) {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  const shiftId = Number((await context.params).id);
  if (!Number.isInteger(shiftId) || shiftId < 1) {
    return idError('shift');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const parsed = shiftCorrectionSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('shift correction', parsed.error);
  }

  const updatedStartedAt = parsed.data.startedAt
    ? new Date(parsed.data.startedAt)
    : undefined;
  const updatedEndedAt = parsed.data.endedAt === undefined
    ? undefined
    : parsed.data.endedAt === null
      ? null
      : new Date(parsed.data.endedAt);

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const shift = await tx.workerShift.findUnique({
        where: {id: shiftId},
      });

      if (!shift) {
        return {kind: 'not-found' as const};
      }

      const finalStartedAt = updatedStartedAt ?? shift.startedAt;
      const finalEndedAt = updatedEndedAt === undefined
        ? shift.endedAt
        : updatedEndedAt;

      if (finalEndedAt && finalEndedAt <= finalStartedAt) {
        return {kind: 'invalid-range' as const};
      }

      const otherShifts = await tx.workerShift.findMany({
        where: {
          workerId: shift.workerId,
          id: {not: shift.id},
        },
        select: {startedAt: true, endedAt: true},
      });

      if (otherShifts.some((other) => intervalsOverlap(
        finalStartedAt,
        finalEndedAt,
        other.startedAt,
        other.endedAt,
      ))) {
        return {kind: 'overlap' as const};
      }

      const updatedShift = await tx.workerShift.update({
        where: {id: shift.id},
        data: {
          startedAt: finalStartedAt,
          endedAt: finalEndedAt,
        },
      });

      await tx.shiftCorrection.create({
        data: {
          workerShiftId: shift.id,
          editorAuthUserId: authContext.authUserId,
          reason: parsed.data.reason,
          originalStartedAt: shift.startedAt,
          originalEndedAt: shift.endedAt,
          updatedStartedAt: finalStartedAt,
          updatedEndedAt: finalEndedAt,
        },
      });

      return {kind: 'updated' as const, shift: updatedShift};
    });

    if (outcome.kind === 'not-found') {
      return notFoundError('shift');
    }
    if (outcome.kind === 'invalid-range') {
      return NextResponse.json(
        {error: 'endedAt must be later than startedAt'},
        {status: 400},
      );
    }
    if (outcome.kind === 'overlap') {
      return NextResponse.json(
        {error: 'Corrected shift overlaps another shift for this worker'},
        {status: 409},
      );
    }

    return NextResponse.json(outcome.shift);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {error: 'Correction would create a duplicate open shift'},
        {status: 409},
      );
    }
    return serverError('shift correction', 'apply', error);
  }
}