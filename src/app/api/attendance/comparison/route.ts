import {NextRequest, NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import prisma from '@/lib/db';
import {
  addLocalDays,
  dateOnlyToUtc,
  getAuthenticatedAttendanceContext,
  resolveAttendanceWorkerId,
} from '@/lib/attendance';
import {parseComparisonFilters} from '@/lib/attendance-comparison';
import {
  calculateActivityComparison,
  type ComparisonInterval,
} from '@/lib/attendance-activity-calculations';
import {serverError} from '@/utils/responses';

export async function GET(request: NextRequest) {
  const context = await getAuthenticatedAttendanceContext();
  if (!context) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

  const params = request.nextUrl.searchParams;
  const filters = parseComparisonFilters(params);
  if (!filters.ok) return NextResponse.json({error: filters.error}, {status: 400});
  const {dateFromValue, dateToValue, dateFrom, dateTo, requestedWorkerId} = filters;
  const workerId = resolveAttendanceWorkerId(context, requestedWorkerId);
  if (!context.isAdmin && !workerId) {
    return NextResponse.json({error: 'Authenticated account has no worker'}, {status: 403});
  }

  const rangeStart = dateOnlyToUtc(dateFrom);
  const rangeEnd = addLocalDays(dateOnlyToUtc(dateTo), 1);
  const activityOverlap: Prisma.StepExecutionWhereInput = {
    OR: [
      {
        startedAt: {not: null, lt: rangeEnd},
        OR: [
          {finishedAt: null},
          {finishedAt: {gt: rangeStart}},
          {startedAt: {gte: rangeStart}},
        ],
      },
      {startedAt: null, finishedAt: {gte: rangeStart, lt: rangeEnd}},
    ],
  };
  const participantOverlap: Prisma.StepParticipantWhereInput = {
    OR: [
      {
        startedAt: {not: null, lt: rangeEnd},
        OR: [
          {finishedAt: null},
          {finishedAt: {gt: rangeStart}},
          {startedAt: {gte: rangeStart}},
        ],
      },
      {startedAt: null, finishedAt: {gte: rangeStart, lt: rangeEnd}},
    ],
  };
  try {
    const [shifts, activityExecutions, workers] = await prisma.$transaction([
      prisma.workerShift.findMany({
        where: {
          ...(workerId ? {workerId} : {}),
          startedAt: {lt: rangeEnd},
          OR: [{endedAt: null}, {endedAt: {gt: rangeStart}}],
        },
        select: {id: true, workerId: true, startedAt: true, endedAt: true},
      }),
      prisma.stepExecution.findMany({
        where: {
          AND: [
            {
              OR: [
                activityOverlap,
                {stepParticipants: {some: participantOverlap}},
              ],
            },
            ...(workerId
              ? [{
                  OR: [
                    {workerId},
                    {stepParticipants: {some: {workerId}}},
                  ],
                }]
              : []),
          ],
        },
        select: {
          id: true,
          workerId: true,
          startedAt: true,
          finishedAt: true,
          stepParticipants: {
            select: {id: true, workerId: true, startedAt: true, finishedAt: true},
          },
        },
      }),
      prisma.worker.findMany({
        where: workerId ? {id: workerId} : {},
        select: {id: true, fullName: true},
      }),
    ]);

    const activities: ComparisonInterval[] = [];
    for (const execution of activityExecutions) {
      if (
        (!workerId || execution.workerId === workerId) &&
        (execution.startedAt !== null || execution.finishedAt !== null)
      ) {
        activities.push({
          id: execution.id,
          recordType: 'activity',
          workerId: execution.workerId,
          startedAt: execution.startedAt,
          endedAt: execution.finishedAt,
          kind: 'production',
        });
      }

      for (const participant of execution.stepParticipants) {
        if (participant.workerId === execution.workerId) continue;
        if (workerId && participant.workerId !== workerId) continue;
        if (participant.startedAt === null && participant.finishedAt === null) continue;
        activities.push({
          id: participant.id,
          recordType: 'participant',
          workerId: participant.workerId,
          startedAt: participant.startedAt,
          endedAt: participant.finishedAt,
          kind: 'production',
        });
      }
    }

    const comparison = calculateActivityComparison(
      shifts as ComparisonInterval[],
      activities,
      rangeStart,
      rangeEnd,
      new Date(),
      workers.map(({id}) => id),
    );

    const names = new Map(workers.map((worker) => [worker.id, worker.fullName]));

    return NextResponse.json({
      dateFrom: dateFromValue,
      dateTo: dateToValue,
      timezone: process.env.ATTENDANCE_TIME_ZONE ?? 'America/Mexico_City',
      policies: {
        breaks: 'none',
        outsideShiftActivities: 'exclude_and_flag',
        incompleteRecords: 'cap_now',
        nonProductionActivities: 'not_available_in_existing_model',
      },
      workers: comparison.workers.map((worker) => ({
        ...worker,
        nonProductionMinutes: null,
        nonProductionAvailable: false,
        workerName: names.get(worker.workerId) ?? `Worker ${worker.workerId}`,
      })),
      warnings: [
        ...comparison.warnings,
        {
          code: 'non_production_unavailable',
          message: 'No non-production activity records exist in the current data model; non-production total is zero.',
        },
      ],
    });
  } catch (error) {
    return serverError('attendance comparison', 'calculate', error);
  }
}
