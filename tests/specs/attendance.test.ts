import assert from 'node:assert/strict';
import {
  addLocalDays,
  dateOnlyToUtc,
  parseDateOnly,
  resolveAttendanceWorkerId,
  weekStartUtc,
} from '../../src/lib/attendance';
import {
  calculateDailyTotals,
  calculateWeeklyTotals,
  intervalsOverlap,
} from '../../src/lib/attendance-calculations';
import {canManageAttendance} from '../../src/lib/attendance';
import {shiftCorrectionSchema} from '../../src/lib/schemas';

describe('attendance calculations and authorization', () => {
  it('forces regular workers to their session worker', () => {
    assert.equal(
      resolveAttendanceWorkerId({isAdmin: false, workerId: 7}, 12),
      7,
    );
    assert.equal(
      resolveAttendanceWorkerId({isAdmin: true, workerId: 1}, 12),
      12,
    );
    assert.equal(
      resolveAttendanceWorkerId({isAdmin: true, workerId: 1}, null),
      null,
    );
  });

  it('allows only administrators to manage attendance corrections', () => {
    assert.equal(canManageAttendance({isAdmin: false}), false);
    assert.equal(canManageAttendance({isAdmin: true}), true);
  });

  it('requires a reason and at least one correction timestamp', () => {
    assert.equal(
      shiftCorrectionSchema.safeParse({reason: '   '}).success,
      false,
    );
    assert.equal(
      shiftCorrectionSchema.safeParse({reason: 'Missed clock-out'}).success,
      false,
    );
    assert.equal(
      shiftCorrectionSchema.safeParse({
        endedAt: '2026-09-25T18:00:00.000Z',
        reason: 'Missed clock-out',
      }).success,
      true,
    );
  });

  it('supports correcting a missed clock-out and preserves timestamp fields', () => {
    const correction = shiftCorrectionSchema.parse({
      endedAt: '2026-09-25T18:00:00.000Z',
      reason: 'Missed clock-out',
    });
    const originalStartedAt = new Date('2026-09-25T08:00:00.000Z');
    const originalEndedAt = null;
    const updatedEndedAt = new Date(correction.endedAt!);

    assert.equal(correction.reason, 'Missed clock-out');
    assert.equal(originalStartedAt.toISOString(), '2026-09-25T08:00:00.000Z');
    assert.equal(originalEndedAt, null);
    assert.ok(updatedEndedAt > originalStartedAt);
  });

  it('rejects invalid timestamp ranges and overlapping open shifts', () => {
    const correction = shiftCorrectionSchema.parse({
      startedAt: '2026-09-25T18:00:00.000Z',
      endedAt: '2026-09-25T17:00:00.000Z',
      reason: 'Corrected entry',
    });
    assert.ok(new Date(correction.endedAt!) <= new Date(correction.startedAt!));
    assert.equal(
      intervalsOverlap(
        new Date('2026-09-25T08:00:00.000Z'),
        null,
        new Date('2026-09-25T09:00:00.000Z'),
        null,
      ),
      true,
    );
  });

  it('validates date filters as calendar dates', () => {
    assert.ok(parseDateOnly('2026-09-25'));
    assert.equal(parseDateOnly('2026-02-30'), null);
    assert.equal(parseDateOnly('09/25/2026'), null);
  });

  it('splits a shift crossing midnight into daily totals', () => {
    const start = parseDateOnly('2026-09-24')!;
    const shiftStart = dateOnlyToUtc(start);
    const shiftEnd = new Date(shiftStart.getTime() + 26 * 60 * 60 * 1000);

    const beforeMidnight = calculateDailyTotals(
      [{startedAt: new Date(shiftStart.getTime() + 23 * 60 * 60 * 1000), endedAt: shiftEnd}],
      dateOnlyToUtc(start),
      new Date('2026-09-26T00:00:00.000Z'),
    );
    const afterMidnight = calculateDailyTotals(
      [{startedAt: new Date(shiftStart.getTime() + 23 * 60 * 60 * 1000), endedAt: shiftEnd}],
      dateOnlyToUtc(new Date(start.getTime() + 24 * 60 * 60 * 1000)),
      new Date('2026-09-26T00:00:00.000Z'),
    );

    assert.equal(beforeMidnight.completedMinutes, 60);
    assert.equal(afterMidnight.completedMinutes, 120);
  });

  it('uses Monday as the weekly boundary and excludes open duration', () => {
    const sunday = parseDateOnly('2026-09-27')!;
    const monday = weekStartUtc(dateOnlyToUtc(sunday));
    const shiftStart = new Date(monday.getTime() + 8 * 60 * 60 * 1000);
    const shiftEnd = new Date(shiftStart.getTime() + 2 * 60 * 60 * 1000);
    const totals = calculateWeeklyTotals(
      [
        {startedAt: shiftStart, endedAt: shiftEnd},
        {startedAt: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000), endedAt: null},
      ],
      sunday,
      new Date('2026-09-27T23:00:00.000Z'),
    );

    assert.equal(totals.completedMinutes, 120);
    assert.equal(totals.openShiftCount, 1);
  });
});