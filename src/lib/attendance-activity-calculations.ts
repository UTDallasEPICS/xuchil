export type ComparisonInterval = {
  id?: number;
  recordType?: 'shift' | 'activity' | 'participant';
  workerId: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
  kind?: 'production' | 'nonProduction';
};

export type ComparisonWarning = {
  code:
    | 'open_shift'
    | 'open_activity'
    | 'invalid_shift'
    | 'invalid_activity'
    | 'outside_shift'
    | 'unassociated_activity'
    | 'overlapping_shifts'
    | 'activity_exceeds_attendance'
    | 'non_production_unavailable';
  message: string;
  id?: number;
  recordType?: ComparisonInterval['recordType'];
  workerId?: number;
};

export type WorkerActivityComparison = {
  workerId: number;
  attendanceMinutes: number;
  recordedActivityMinutes: number;
  productionMinutes: number;
  nonProductionMinutes: number;
  unallocatedMinutes: number;
  excessActivityMinutes: number;
  provisional: boolean;
  warnings: ComparisonWarning[];
};

export type ActivityComparison = {
  workers: WorkerActivityComparison[];
  warnings: ComparisonWarning[];
};

type MillisecondInterval = {start: number; end: number};

const minutesBetween = (start: number, end: number) =>
  Math.max(0, Math.round((end - start) / 60000));

function mergeIntervals(intervals: MillisecondInterval[]): MillisecondInterval[] {
  const sorted = intervals
    .filter(({start, end}) => end > start)
    .sort((first, second) => first.start - second.start);
  const merged: MillisecondInterval[] = [];

  for (const interval of sorted) {
    const previous = merged.at(-1);
    if (!previous || interval.start > previous.end) {
      merged.push({...interval});
    } else {
      previous.end = Math.max(previous.end, interval.end);
    }
  }

  return merged;
}

function intervalIsContained(
  interval: MillisecondInterval,
  containers: MillisecondInterval[],
): boolean {
  return containers.some(
    (container) => interval.start >= container.start && interval.end <= container.end,
  );
}

function clippedInterval(
  startedAt: Date,
  endedAt: Date,
  rangeStart: Date,
  rangeEnd: Date,
): MillisecondInterval | null {
  const start = Math.max(startedAt.getTime(), rangeStart.getTime());
  const end = Math.min(endedAt.getTime(), rangeEnd.getTime());
  return end > start ? {start, end} : null;
}

function isValidDate(value: Date | null): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function recordLabel(recordType: ComparisonInterval['recordType'], id: number | undefined): string {
  if (id === undefined) return 'Record';
  return `${recordType === 'shift' ? 'Shift' : recordType === 'participant' ? 'Participant' : 'Activity'} #${id}`;
}

export function calculateActivityComparison(
  shifts: ComparisonInterval[],
  activities: ComparisonInterval[],
  rangeStart: Date,
  rangeEnd: Date,
  now = new Date(),
  knownWorkerIds: number[] = [],
): ActivityComparison {
  const warnings: ComparisonWarning[] = [];
  const workerIds = new Set<number>(knownWorkerIds);
  const shiftIntervals = new Map<number, MillisecondInterval[]>();
  const attendanceIntervals = new Map<number, MillisecondInterval[]>();
  const activityIntervals = new Map<number, {production: MillisecondInterval[]; nonProduction: MillisecondInterval[]}>();
  const provisionalWorkerIds = new Set<number>();

  for (const shift of shifts) {
    if (shift.workerId === null) continue;
    workerIds.add(shift.workerId);
    if (!isValidDate(shift.startedAt)) {
      warnings.push({
        code: 'invalid_shift',
        message: `${recordLabel('shift', shift.id)} has an invalid start timestamp.`,
        id: shift.id,
        recordType: shift.recordType ?? 'shift',
        workerId: shift.workerId,
      });
      continue;
    }
    const end = shift.endedAt ?? now;
    if (!shift.endedAt) {
      warnings.push({
        code: 'open_shift',
        message: `${recordLabel('shift', shift.id)} has no clock-out and was capped at the report time.`,
        id: shift.id,
        recordType: shift.recordType ?? 'shift',
        workerId: shift.workerId,
      });
      provisionalWorkerIds.add(shift.workerId);
    }
    if (!isValidDate(end)) {
      warnings.push({
        code: 'invalid_shift',
        message: `${recordLabel('shift', shift.id)} has an invalid end timestamp.`,
        id: shift.id,
        recordType: shift.recordType ?? 'shift',
        workerId: shift.workerId,
      });
      continue;
    }
    if (end.getTime() <= shift.startedAt.getTime()) {
      warnings.push({
        code: 'invalid_shift',
        message: `${recordLabel('shift', shift.id)} end must be later than its start.`,
        id: shift.id,
        recordType: shift.recordType ?? 'shift',
        workerId: shift.workerId,
      });
      continue;
    }
    const fullInterval = {start: shift.startedAt.getTime(), end: end.getTime()};
    const existing = shiftIntervals.get(shift.workerId) ?? [];
    if (existing.some((other) => fullInterval.start < other.end && other.start < fullInterval.end)) {
      warnings.push({
        code: 'overlapping_shifts',
        message: `Overlapping shifts were detected for worker ${shift.workerId}.`,
        id: shift.id,
        recordType: shift.recordType ?? 'shift',
        workerId: shift.workerId,
      });
    }
    existing.push(fullInterval);
    shiftIntervals.set(shift.workerId, existing);
    const interval = clippedInterval(shift.startedAt, end, rangeStart, rangeEnd);
    if (interval) {
      const attendance = attendanceIntervals.get(shift.workerId) ?? [];
      attendance.push(interval);
      attendanceIntervals.set(shift.workerId, attendance);
    }
  }

  for (const activity of activities) {
    if (activity.workerId === null) {
      warnings.push({
        code: 'unassociated_activity',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} cannot be associated with a worker.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
      });
      continue;
    }
    workerIds.add(activity.workerId);
    if (!isValidDate(activity.startedAt)) {
      warnings.push({
        code: 'invalid_activity',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} has an invalid start timestamp.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
        workerId: activity.workerId,
      });
      continue;
    }
    const end = activity.endedAt ?? now;
    if (!activity.endedAt) {
      warnings.push({
        code: 'open_activity',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} has no end timestamp and was capped at the report time.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
        workerId: activity.workerId,
      });
    }
    if (!isValidDate(end)) {
      warnings.push({
        code: 'invalid_activity',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} has an invalid end timestamp.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
        workerId: activity.workerId,
      });
      continue;
    }
    if (end.getTime() <= activity.startedAt.getTime()) {
      warnings.push({
        code: 'invalid_activity',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} end must be later than its start.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
        workerId: activity.workerId,
      });
      continue;
    }

    const workerShifts = mergeIntervals(shiftIntervals.get(activity.workerId) ?? []);
    const fullActivity = {start: activity.startedAt.getTime(), end: end.getTime()};
    if (!intervalIsContained(fullActivity, workerShifts)) {
      warnings.push({
        code: 'outside_shift',
        message: `${recordLabel(activity.recordType ?? 'activity', activity.id)} falls outside a recorded shift and was excluded from totals.`,
        id: activity.id,
        recordType: activity.recordType ?? 'activity',
        workerId: activity.workerId,
      });
      continue;
    }

    const interval = clippedInterval(activity.startedAt, end, rangeStart, rangeEnd);
    if (!interval) continue;
    if (!activity.endedAt) provisionalWorkerIds.add(activity.workerId);
    const kind = activity.kind ?? 'production';
    const existing = activityIntervals.get(activity.workerId) ?? {production: [], nonProduction: []};
    existing[kind].push(interval);
    activityIntervals.set(activity.workerId, existing);
  }

  const workers = [...workerIds].sort((first, second) => first - second).map((workerId) => {
    const attendance = mergeIntervals(attendanceIntervals.get(workerId) ?? []);
    const recorded = activityIntervals.get(workerId) ?? {production: [], nonProduction: []};
    const production = mergeIntervals(recorded.production);
    const nonProduction = mergeIntervals(recorded.nonProduction);
    const allActivity = mergeIntervals([...production, ...nonProduction]);
    const attendanceMinutes = attendance.reduce((total, interval) => total + minutesBetween(interval.start, interval.end), 0);
    const recordedActivityMinutes = allActivity.reduce((total, interval) => total + minutesBetween(interval.start, interval.end), 0);
    const excessActivityMinutes = Math.max(0, recordedActivityMinutes - attendanceMinutes);
    const workerWarnings = warnings.filter((warning) => {
      return warning.workerId === workerId;
    });

    if (excessActivityMinutes > 0) {
      workerWarnings.push({
        code: 'activity_exceeds_attendance',
        message: `Recorded activity exceeds attendance for worker ${workerId}; unallocated time was kept at zero.`,
        workerId,
      });
    }

    return {
      workerId,
      attendanceMinutes,
      recordedActivityMinutes,
      productionMinutes: production.reduce((total, interval) => total + minutesBetween(interval.start, interval.end), 0),
      nonProductionMinutes: nonProduction.reduce((total, interval) => total + minutesBetween(interval.start, interval.end), 0),
      unallocatedMinutes: Math.max(0, attendanceMinutes - recordedActivityMinutes),
      excessActivityMinutes,
      provisional: provisionalWorkerIds.has(workerId),
      warnings: workerWarnings,
    };
  });

  return {workers, warnings};
}
