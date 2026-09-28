import prisma from '@/lib/db';
import {verifySession} from '@/lib/session';

export const ATTENDANCE_TIME_ZONE = process.env.ATTENDANCE_TIME_ZONE ?? 'America/Mexico_City';
export const ATTENDANCE_WEEK_START = 1;

export type AttendanceAuthContext = {
  authUserId: number;
  workerId: number | null;
  isAdmin: boolean;
};

export function resolveAttendanceWorkerId(
  context: Pick<AttendanceAuthContext, 'isAdmin' | 'workerId'>,
  requestedWorkerId: number | null,
): number | null {
  return context.isAdmin ? requestedWorkerId : context.workerId;
}

export function canManageAttendance(
  context: Pick<AttendanceAuthContext, 'isAdmin'>,
): boolean {
  return context.isAdmin;
}

export async function getAuthenticatedAttendanceContext(): Promise<AttendanceAuthContext | null> {
  const payload = await verifySession();
  if (!payload) {
    return null;
  }

  const authUser = await prisma.authUser.findUnique({
    where: {id: payload.authUserId},
    select: {
      isActive: true,
      workerId: true,
      isAdmin: true,
      worker: {
        select: {
          id: true,
          isActive: true,
          expiresAt: true,
        },
      },
    },
  });

  const worker = authUser?.worker;
  const workerExpired = worker?.expiresAt
    ? worker.expiresAt < new Date()
    : false;

  if (
    !authUser?.isActive ||
    authUser.workerId !== payload.workerId ||
    (worker && !worker.isActive) ||
    workerExpired
  ) {
    return null;
  }

  return {
    authUserId: payload.authUserId,
    workerId: worker?.id ?? null,
    isAdmin: authUser.isAdmin,
  };
}

export async function getAuthenticatedWorkerId(): Promise<number | null> {
  const context = await getAuthenticatedAttendanceContext();
  return context?.workerId ?? null;
}

export function parseDateOnly(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

function localDateParts(date: Date): {year: number; month: number; day: number} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ATTENDANCE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

function timeZoneOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ATTENDANCE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
  return asUtc - date.getTime();
}

function calendarMidnightUtc(year: number, month: number, day: number): Date {
  const localAsUtc = new Date(Date.UTC(year, month - 1, day));
  const firstGuess = new Date(localAsUtc.getTime() - timeZoneOffsetMs(localAsUtc));
  return new Date(localAsUtc.getTime() - timeZoneOffsetMs(firstGuess));
}

export function localMidnightUtc(date: Date): Date {
  const parts = localDateParts(date);
  return calendarMidnightUtc(parts.year, parts.month, parts.day);
}

export function dateOnlyToUtc(value: Date): Date {
  return calendarMidnightUtc(
    value.getUTCFullYear(),
    value.getUTCMonth() + 1,
    value.getUTCDate(),
  );
}

export function addLocalDays(date: Date, days: number): Date {
  const local = localDateParts(date);
  return calendarMidnightUtc(local.year, local.month, local.day + days);
}

export function weekStartUtc(date: Date): Date {
  const local = localDateParts(date);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const day = localDate.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return localMidnightUtc(new Date(Date.UTC(local.year, local.month - 1, local.day - daysSinceMonday)));
}