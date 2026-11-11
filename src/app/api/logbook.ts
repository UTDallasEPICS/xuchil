// Backed by API endpoints defined in User Stories and implemented by UTD team:
// Lightweight client for Logbook endpoints
// - GET /api/logbook/my-tasks (filters: dateFrom, dateTo, productVariantId)
// - GET /api/logbook/tasks/{id}
// - GET /api/logbook/process-runs (filters: batchCode, workerId, dateFrom, dateTo, productVariantId)
// - GET /api/logbook/process-runs/{id}

type Query = Record<string, string | number | undefined>;

export interface LogbookTask {
  id: string | number;
  templateStep?: { name?: string | null; idealDurationMin?: number | null } | null;
  processRun?: {
    batchCode?: string | null;
    productVariant?: { name?: string | null } | null;
  } | null;
  startedAt?: string | null;
  actualDurationMin?: number | null;
  finishedAt?: string | null;
  worker?: { fullName?: string | null } | null;
  stepMaterialUsages?: LogbookMaterialUsage[];
  inputQty?: number | null;
  inputUnit?: { name?: string | null } | null;
  notes?: string | null;
}

export interface LogbookMaterialUsage {
  qty: number;
  rawMaterial?: { name?: string | null } | null;
  unit?: { name?: string | null } | null;
}

export interface LogbookProcessRun {
  id: string | number;
  batchCode?: string | null;
  productVariant?: { name?: string | null } | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  creator?: { fullName?: string | null } | null;
  stepExecutions?: LogbookTask[];
  goodOutputQty?: number | null;
  scrapQty?: number | null;
  outputUnit?: { name?: string | null } | null;
  notes?: string | null;
}

function qs(params?: Query) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const msg = await res.text().catch(()=>res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// STAFF: my tasks (step_executions of the authenticated worker, or where they participated)
export async function fetchMyTasks(params?: {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  productVariantId?: number;
}) {
  return getJSON<LogbookTask[]>(`/api/logbook/my-tasks${qs(params)}`);
}

// STAFF: step execution detail
export async function fetchStepExecutionDetail(stepExecutionId: number): Promise<LogbookTask> {
  const data = await getJSON<{ stepExecution?: LogbookTask } | LogbookTask>(`/api/logbook/tasks/${stepExecutionId}`);
  // Some handlers wrap the payload ({ stepExecution, status }), normalize:
  if ("stepExecution" in data && data.stepExecution) {
    return data.stepExecution;
  }
  return data as LogbookTask;
}

// ADMIN: process runs history (completed/cancelled)
export async function fetchProcessRuns(params?: {
  batchCode?: string;
  workerId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  productVariantId?: number;
}) {
  return getJSON<LogbookProcessRun[]>(`/api/logbook/process-runs${qs(params)}`);
}

// ADMIN: process run detail
export async function fetchProcessRunDetail(processRunId: number): Promise<LogbookProcessRun> {
  const data = await getJSON<{ processRun?: LogbookProcessRun } | LogbookProcessRun>(`/api/logbook/process-runs/${processRunId}`);
  if ("processRun" in data && data.processRun) {
    return data.processRun;
  }
  return data as LogbookProcessRun;
}