import {NextRequest, NextResponse} from 'next/server';
import {getAuthenticatedAttendanceContext, parseDateOnly, dateOnlyToUtc, addLocalDays, weekStartUtc, ATTENDANCE_TIME_ZONE, ATTENDANCE_WEEK_START, resolveAttendanceWorkerId} from '@/lib/attendance';
import {calculateDailyTotals, calculateWeeklyTotals} from '@/lib/attendance-calculations';
import prisma from '@/lib/db';
import {serverError} from '@/utils/responses';

export async function GET(request: NextRequest) {
  const context = await getAuthenticatedAttendanceContext();
  if (!context) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  const params = request.nextUrl.searchParams;
  const requestedDateValue = params.get('date');
  const requestedDate = parseDateOnly(requestedDateValue) ?? new Date();
  if (requestedDateValue && !parseDateOnly(requestedDateValue)) {
    return NextResponse.json({error: 'date must use YYYY-MM-DD'}, {status: 400});
  }

  const dailyStart = dateOnlyToUtc(requestedDate);
  const weeklyStart = weekStartUtc(dailyStart);
  const rangeStart = weeklyStart;
  const rangeEnd = addLocalDays(weeklyStart, 7);
  const workerIdValue = params.get('workerId');
  let requestedWorkerId: number | null = null;
  if (workerIdValue) {
    requestedWorkerId = Number(workerIdValue);
    if (!Number.isInteger(requestedWorkerId) || requestedWorkerId < 1) {
      return NextResponse.json({error: 'workerId must be a positive integer'}, {status: 400});
    }
  }
  const scopedWorkerId = resolveAttendanceWorkerId(context, requestedWorkerId);
  if (!context.isAdmin && !scopedWorkerId) {
    return NextResponse.json({error: 'Authenticated account has no worker'}, {status: 403});
  }

  try {
    const shifts = await prisma.workerShift.findMany({
      where: {
        ...(scopedWorkerId ? {workerId: scopedWorkerId} : {}),
        startedAt: {lt: rangeEnd},
        OR: [{endedAt: null}, {endedAt: {gt: rangeStart}}],
      },
      select: {startedAt: true, endedAt: true},
    });

    const daily = calculateDailyTotals(shifts, dailyStart);
    const weekly = calculateWeeklyTotals(shifts, weeklyStart);

    return NextResponse.json({
      workerId: scopedWorkerId,
      date: requestedDateValue ?? undefined,
      timezone: ATTENDANCE_TIME_ZONE,
      weekStartsOn: ATTENDANCE_WEEK_START === 1 ? 'monday' : 'sunday',
      daily: {
        completedMinutes: daily.completedMinutes,
        openShiftCount: daily.openShiftCount,
      },
      weekly: {
        completedMinutes: weekly.completedMinutes,
        openShiftCount: weekly.openShiftCount,
      },
    });
  } catch (error) {
    return serverError('attendance totals', 'calculate', error);
  }
}