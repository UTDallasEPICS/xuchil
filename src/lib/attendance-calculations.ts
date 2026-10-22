import {
  addLocalDays,
  localMidnightUtc,
  weekStartUtc,
} from '@/lib/attendance';

export type AttendanceShiftInterval = {
  startedAt: Date;
  endedAt: Date | null;
};

export type AttendanceTotals = {
  completedMinutes: number;
  openShiftCount: number;
};

export function intervalsOverlap(
  firstStart: Date,
  firstEnd: Date | null,
  secondStart: Date,
  secondEnd: Date | null,
): boolean {
  return (
    (firstEnd === null || secondStart < firstEnd) &&
    (secondEnd === null || firstStart < secondEnd)
  );
}

function intervalMinutes(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function calculateTotals(
  shifts: AttendanceShiftInterval[],
  rangeStart: Date,
  rangeEnd: Date,
  now = new Date(),
): AttendanceTotals {
  let completedMinutes = 0;
  let openShiftCount = 0;

  for (const shift of shifts) {
    if (!shift.endedAt) {
      openShiftCount += 1;
      continue;
    }

    const start = new Date(Math.max(shift.startedAt.getTime(), rangeStart.getTime()));
    const end = new Date(Math.min(shift.endedAt.getTime(), rangeEnd.getTime(), now.getTime()));
    completedMinutes += intervalMinutes(start, end);
  }

  return {completedMinutes, openShiftCount};
}

export function calculateDailyTotals(
  shifts: AttendanceShiftInterval[],
  date: Date,
  now = new Date(),
): AttendanceTotals {
  const start = localMidnightUtc(date);
  return calculateTotals(shifts, start, addLocalDays(start, 1), now);
}

export function calculateWeeklyTotals(
  shifts: AttendanceShiftInterval[],
  date: Date,
  now = new Date(),
): AttendanceTotals {
  const start = weekStartUtc(date);
  return calculateTotals(shifts, start, addLocalDays(start, 7), now);
}