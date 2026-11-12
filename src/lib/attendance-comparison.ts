import {parseDateOnly} from '@/lib/attendance';

export type ComparisonFilters =
  | {ok: true; dateFromValue: string; dateToValue: string; dateFrom: Date; dateTo: Date; requestedWorkerId: number | null}
  | {ok: false; error: string};

export function parseComparisonFilters(params: URLSearchParams): ComparisonFilters {
  const dateFromValue = params.get('dateFrom');
  const dateToValue = params.get('dateTo');
  const dateFrom = parseDateOnly(dateFromValue);
  const dateTo = parseDateOnly(dateToValue);
  if (!dateFromValue || !dateToValue || !dateFrom || !dateTo) {
    return {ok: false, error: 'dateFrom and dateTo must use YYYY-MM-DD'};
  }
  if (dateFrom > dateTo) {
    return {ok: false, error: 'dateFrom must be before or equal to dateTo'};
  }

  const workerIdValue = params.get('workerId');
  const requestedWorkerId = workerIdValue ? Number(workerIdValue) : null;
  if (workerIdValue && (!Number.isInteger(requestedWorkerId) || requestedWorkerId! < 1)) {
    return {ok: false, error: 'workerId must be a positive integer'};
  }

  return {ok: true, dateFromValue, dateToValue, dateFrom, dateTo, requestedWorkerId};
}
