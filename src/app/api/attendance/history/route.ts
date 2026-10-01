import {NextRequest, NextResponse} from 'next/server';
import {getAuthenticatedAttendanceContext, parseDateOnly, dateOnlyToUtc, addLocalDays, resolveAttendanceWorkerId} from '@/lib/attendance';
import prisma from '@/lib/db';
import {serverError} from '@/utils/responses';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  const context = await getAuthenticatedAttendanceContext();
  if (!context) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const params = request.nextUrl.searchParams;
  const dateFromValue = params.get('dateFrom');
  const dateToValue = params.get('dateTo');
  const dateFrom = parseDateOnly(dateFromValue);
  const dateTo = parseDateOnly(dateToValue);

  if ((dateFromValue && !dateFrom) || (dateToValue && !dateTo)) {
    return NextResponse.json({error: 'dateFrom and dateTo must use YYYY-MM-DD'}, {status: 400});
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({error: 'dateFrom must be before or equal to dateTo'}, {status: 400});
  }

  const page = Number(params.get('page') ?? '1');
  const requestedPageSize = Number(params.get('pageSize') ?? DEFAULT_PAGE_SIZE);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(requestedPageSize) || requestedPageSize < 1) {
    return NextResponse.json({error: 'page and pageSize must be positive integers'}, {status: 400});
  }
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  const where: {
    workerId?: number;
    startedAt?: {lt?: Date; gte?: Date};
    OR?: Array<{endedAt: null} | {endedAt: {gt: Date}}>;
  } = {};

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
  if (scopedWorkerId) {
    where.workerId = scopedWorkerId;
  }

  if (dateFrom || dateTo) {
    const rangeStart = dateFrom ? dateOnlyToUtc(dateFrom) : undefined;
    const rangeEnd = dateTo ? dateOnlyToUtc(addLocalDays(dateTo, 1)) : undefined;
    where.startedAt = {};
    if (rangeEnd) {
      where.startedAt.lt = rangeEnd;
    }
    if (rangeStart) {
      where.OR = [{endedAt: null}, {endedAt: {gt: rangeStart}}];
    }
  }

  try {
    const [total, shifts] = await prisma.$transaction([
      prisma.workerShift.count({where}),
      prisma.workerShift.findMany({
        where,
        orderBy: [{startedAt: 'desc'}, {id: 'desc'}],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          worker: {select: {id: true, fullName: true}},
        },
      }),
    ]);

    return NextResponse.json({
      data: shifts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return serverError('attendance history', 'fetch', error);
  }
}