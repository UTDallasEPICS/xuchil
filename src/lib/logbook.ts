// Backed by API endpoints defined in User Stories and implemented by UTD team:
// Lightweight client for Logbook endpoints
// - GET /api/logbook/my-tasks (filters: dateFrom, dateTo, productVariantId)
// - GET /api/logbook/tasks/{id}
// - GET /api/logbook/process-runs (filters: workerId, dateFrom, dateTo, productVariantId)
// - GET /api/logbook/process-runs/{id}

type Query = Record<string, string | number | undefined>;

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
  return getJSON<any[]>(`/api/logbook/my-tasks${qs(params)}`);
}

// STAFF: step execution detail
export async function fetchStepExecutionDetail(stepExecutionId: number) {
  const data = await getJSON<{ stepExecution?: any } | any>(`/api/logbook/tasks/${stepExecutionId}`);
  // Some handlers wrap the payload ({ stepExecution, status }), normalize:
  return (data && ("stepExecution" in data)) ? (data as any).stepExecution : data;
}

// ADMIN: process runs history (completed/cancelled)
export async function fetchProcessRuns(params?: {
  workerId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  productVariantId?: number;
}) {
  return getJSON<any[]>(`/api/logbook/process-runs${qs(params)}`);
}

// ADMIN: process run detail
export async function fetchProcessRunDetail(processRunId: number) {
  const data = await getJSON<{ processRun?: any } | any>(`/api/logbook/process-runs/${processRunId}`);
  return (data && ("processRun" in data)) ? (data as any).processRun : data;
}