import assert from 'node:assert/strict';
import {
  addLocalDays,
  currentAttendanceDate,
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
import {calculateActivityComparison} from '../../src/lib/attendance-activity-calculations';
import {parseComparisonFilters} from '../../src/lib/attendance-comparison';

const interval = (start: string, end: string | null, kind?: 'production' | 'nonProduction') => ({
  workerId: 7,
  startedAt: new Date(start),
  endedAt: end ? new Date(end) : null,
  ...(kind ? {kind} : {}),
});

const reportStart = new Date('2026-09-25T00:00:00.000Z');
const reportEnd = new Date('2026-09-26T00:00:00.000Z');

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

  it('uses corrected attendance timestamps in the comparison', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-25T08:00:00.000Z', '2026-09-25T11:00:00.000Z')],
      [interval('2026-09-25T08:00:00.000Z', '2026-09-25T10:00:00.000Z', 'production')],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers[0].attendanceMinutes, 180);
    assert.equal(result.workers[0].unallocatedMinutes, 60);
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

  it('validates comparison API date and worker filters', () => {
    assert.equal(
      parseComparisonFilters(new URLSearchParams('dateFrom=2026-09-25&dateTo=2026-09-26&workerId=7')).ok,
      true,
    );
    assert.equal(
      parseComparisonFilters(new URLSearchParams('dateFrom=2026-09-26&dateTo=2026-09-25')).ok,
      false,
    );
    assert.equal(
      parseComparisonFilters(new URLSearchParams('dateFrom=2026-09-25&dateTo=2026-09-25&workerId=0')).ok,
      false,
    );
  });

  it('uses the Mexico City calendar date when UTC is already on the next day', () => {
    const utcAfterMexicoMidnight = new Date('2026-09-25T04:30:00.000Z');
    assert.equal(currentAttendanceDate(utcAfterMexicoMidnight).toISOString(), '2026-09-24T00:00:00.000Z');
  });

  it('keeps the final history date through the next Mexico City midnight', () => {
    const finalDate = dateOnlyToUtc(parseDateOnly('2026-09-25')!);
    const exclusiveEnd = addLocalDays(finalDate, 1);
    assert.equal(exclusiveEnd.toISOString(), '2026-09-26T06:00:00.000Z');
    assert.ok(new Date('2026-09-26T05:59:59.999Z') < exclusiveEnd);
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

  it('merges overlapping production and non-production activity without double-counting', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-25T08:00:00.000Z', '2026-09-25T12:00:00.000Z')],
      [
        interval('2026-09-25T08:00:00.000Z', '2026-09-25T10:00:00.000Z', 'production'),
        interval('2026-09-25T09:30:00.000Z', '2026-09-25T11:00:00.000Z', 'production'),
        interval('2026-09-25T11:00:00.000Z', '2026-09-25T12:00:00.000Z', 'nonProduction'),
      ],
      reportStart,
      reportEnd,
    );

    assert.deepEqual(result.workers[0], {
      workerId: 7,
      attendanceMinutes: 240,
      recordedActivityMinutes: 240,
      productionMinutes: 180,
      nonProductionMinutes: 60,
      unallocatedMinutes: 0,
      excessActivityMinutes: 0,
      provisional: false,
      warnings: [],
    });
  });


  it('excludes and flags activities outside attendance', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-25T09:00:00.000Z', '2026-09-25T10:00:00.000Z')],
      [interval('2026-09-25T08:30:00.000Z', '2026-09-25T09:30:00.000Z', 'production')],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers[0].recordedActivityMinutes, 0);
    assert.equal(result.workers[0].unallocatedMinutes, 60);
    assert.equal(result.workers[0].warnings[0].code, 'outside_shift');
  });

  it('caps open shifts and activities at report time and flags both records', () => {
    const now = new Date('2026-09-25T11:00:00.000Z');
    const result = calculateActivityComparison(
      [interval('2026-09-25T08:00:00.000Z', null)],
      [interval('2026-09-25T09:00:00.000Z', null, 'production')],
      reportStart,
      reportEnd,
      now,
    );

    assert.equal(result.workers[0].attendanceMinutes, 180);
    assert.equal(result.workers[0].recordedActivityMinutes, 120);
    assert.equal(result.workers[0].unallocatedMinutes, 60);
    assert.equal(result.workers[0].provisional, true);
    assert.deepEqual(result.workers[0].warnings.map(({code}) => code), ['open_shift', 'open_activity']);
  });

  it('accepts activities crossing either reporting boundary after full-interval validation', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-24T23:00:00.000Z', '2026-09-26T01:00:00.000Z')],
      [
        interval('2026-09-24T23:30:00.000Z', '2026-09-25T00:30:00.000Z', 'production'),
        interval('2026-09-25T23:30:00.000Z', '2026-09-26T00:30:00.000Z', 'production'),
      ],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers[0].attendanceMinutes, 1440);
    assert.equal(result.workers[0].recordedActivityMinutes, 60);
    assert.equal(result.workers[0].warnings.length, 0);
  });

  it('keeps activities spanning adjacent shifts but excludes activities spanning a gap', () => {
    const result = calculateActivityComparison(
      [
        interval('2026-09-25T08:00:00.000Z', '2026-09-25T10:00:00.000Z'),
        interval('2026-09-25T10:00:00.000Z', '2026-09-25T12:00:00.000Z'),
        interval('2026-09-25T14:00:00.000Z', '2026-09-25T15:00:00.000Z'),
      ],
      [
        interval('2026-09-25T09:30:00.000Z', '2026-09-25T10:30:00.000Z', 'production'),
        interval('2026-09-25T11:30:00.000Z', '2026-09-25T14:30:00.000Z', 'production'),
      ],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers[0].recordedActivityMinutes, 60);
    assert.equal(result.workers[0].warnings.filter(({code}) => code === 'outside_shift').length, 1);
  });

  it('flags invalid Date values and preserves workers with no records', () => {
    const result = calculateActivityComparison(
      [{workerId: 7, startedAt: new Date('invalid'), endedAt: new Date('2026-09-25T10:00:00.000Z'), id: 21}],
      [],
      reportStart,
      reportEnd,
      new Date('2026-09-25T12:00:00.000Z'),
      [8],
    );

    assert.equal(result.workers.find((worker) => worker.workerId === 8)?.attendanceMinutes, 0);
    assert.equal(result.warnings[0].code, 'invalid_shift');
  });

  it('counts participant activity for another worker without duplicating the primary worker', () => {
    const result = calculateActivityComparison(
      [
        {...interval('2026-09-25T08:00:00.000Z', '2026-09-25T12:00:00.000Z'), workerId: 7},
        {...interval('2026-09-25T08:00:00.000Z', '2026-09-25T12:00:00.000Z'), workerId: 8},
      ],
      [
        {...interval('2026-09-25T09:00:00.000Z', '2026-09-25T10:00:00.000Z', 'production'), workerId: 7, id: 1, recordType: 'activity'},
        {...interval('2026-09-25T09:00:00.000Z', '2026-09-25T10:00:00.000Z', 'production'), workerId: 8, id: 2, recordType: 'participant'},
        {...interval('2026-09-25T10:00:00.000Z', '2026-09-25T11:00:00.000Z', 'production'), workerId: 7, id: 3, recordType: 'participant'},
      ],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers.find((worker) => worker.workerId === 7)?.recordedActivityMinutes, 120);
    assert.equal(result.workers.find((worker) => worker.workerId === 8)?.recordedActivityMinutes, 60);
  });

  it('clips an overnight shift to the selected date range', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-24T23:00:00.000Z', '2026-09-25T02:00:00.000Z')],
      [interval('2026-09-25T00:00:00.000Z', '2026-09-25T01:00:00.000Z', 'production')],
      reportStart,
      reportEnd,
    );

    assert.equal(result.workers[0].attendanceMinutes, 120);
    assert.equal(result.workers[0].recordedActivityMinutes, 60);
    assert.equal(result.workers[0].unallocatedMinutes, 60);
  });

  it('flags invalid and unassociated activities instead of silently dropping them', () => {
    const result = calculateActivityComparison(
      [interval('2026-09-25T08:00:00.000Z', '2026-09-25T10:00:00.000Z')],
      [
        interval('2026-09-25T09:00:00.000Z', '2026-09-25T08:30:00.000Z', 'production'),
        {workerId: null, startedAt: new Date('2026-09-25T09:00:00.000Z'), endedAt: new Date('2026-09-25T09:30:00.000Z'), id: 99},
      ],
      reportStart,
      reportEnd,
    );

    assert.deepEqual(result.warnings.map(({code}) => code), ['invalid_activity', 'unassociated_activity']);
  });
});