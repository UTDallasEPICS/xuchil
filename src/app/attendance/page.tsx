"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock3, LogIn, LogOut, RefreshCw } from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import TextField from "@/components/TextField";
import styles from "./Attendance.module.css";

interface WorkerShift {
  id: number;
  startedAt: string;
  endedAt: string | null;
  worker?: { id: number; fullName: string };
}

interface Totals {
  completedMinutes: number;
  openShiftCount: number;
}

interface AttendanceTotals {
  daily: Totals;
  weekly: Totals;
}

interface HistoryResponse {
  data: WorkerShift[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface WorkerOption {
  id: number;
  fullName: string;
}

interface CorrectionShift extends WorkerShift {
  worker: { id: number; fullName: string };
}

class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatDuration = (shift: WorkerShift) => {
  if (!shift.endedAt) return "Turno en curso";
  const minutes = Math.max(
    0,
    Math.round(
      (new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime()) /
        60000,
    ),
  );
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  return `${hours} h ${remainingMinutes} min`;
};

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  return `${hours} h ${remainingMinutes} min`;
};

const messageForError = (status: number, fallback: string) => {
  if (status === 401) return "Tu sesión ha terminado. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes un trabajador activo asociado a tu cuenta.";
  if (status === 404) return "No hay un turno activo para registrar la salida.";
  if (status === 409) return "Ya existe un turno activo para este trabajador.";
  return fallback;
};

const AttendancePage = () => {
  const router = useRouter();
  const [currentShift, setCurrentShift] = useState<WorkerShift | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [hasWorker, setHasWorker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workerOptions, setWorkerOptions] = useState<WorkerOption[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [history, setHistory] = useState<WorkerShift[]>([]);
  const [totals, setTotals] = useState<AttendanceTotals | null>(null);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [correctionShift, setCorrectionShift] = useState<CorrectionShift | null>(null);
  const [correctionStartedAt, setCorrectionStartedAt] = useState("");
  const [correctionEndedAt, setCorrectionEndedAt] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionSaving, setCorrectionSaving] = useState(false);

  const requestJson = useCallback(async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });
    if (!response.ok) {
      let apiMessage = "";
      try {
        const body = await response.json() as { error?: string };
        apiMessage = body.error ?? "";
      } catch {
        // Use the status-specific message when the response is not JSON.
      }
      throw new ApiError(
        response.status,
        apiMessage || messageForError(response.status, "No se pudo cargar la información."),
      );
    }
    return response.json();
  }, []);

  const loadHistoryPage = useCallback(async (page: number, workerId = selectedWorkerId) => {
    const workerQuery = workerId ? `&workerId=${encodeURIComponent(workerId)}` : "";
    const response = await requestJson(`/api/attendance/history?page=${page}&pageSize=20${workerQuery}`) as HistoryResponse;
    setHistory(response.data);
    setNextPage(page + 1);
    setHasMore(response.pagination.page < response.pagination.totalPages);
  }, [requestJson, selectedWorkerId]);

  const loadAttendance = useCallback(async (preserveMessages = false) => {
    setLoading(true);
    if (!preserveMessages) setError(null);
    try {
      const date = formatDateInput(new Date());
      const profile = await requestJson("/api/users/me");
      const profileIsAdmin = Boolean(profile.isAdmin);
      const profileHasWorker = Boolean(profile.worker?.id);
      const workerQuery = profileIsAdmin && selectedWorkerId
        ? `&workerId=${encodeURIComponent(selectedWorkerId)}`
        : "";
      const [historyResult, workersResult, currentResult, totalsResult] = await Promise.allSettled([
        requestJson(`/api/attendance/history?page=1&pageSize=20${workerQuery}`),
        profileIsAdmin ? requestJson("/api/users") : Promise.resolve(null),
        profileHasWorker ? requestJson("/api/attendance/current") : Promise.resolve(null),
        profileHasWorker ? requestJson(`/api/attendance/totals?date=${date}`) : Promise.resolve(null),
      ]);

      setWorkerName(profile.worker?.fullName ?? "");
      setHasWorker(profileHasWorker);
      setIsAdmin(profileIsAdmin);
      if (!profileIsAdmin) {
        setWorkerOptions([]);
        setSelectedWorkerId("");
      }
      if (historyResult.status === "fulfilled") {
        const historyResponse = historyResult.value as HistoryResponse;
        setHistory(historyResponse.data);
        setNextPage(2);
        setHasMore(historyResponse.pagination.page < historyResponse.pagination.totalPages);
      }
      if (workersResult.status === "fulfilled" && workersResult.value) {
        const users = workersResult.value as Array<{ worker?: { id: number; fullName: string } | null }>;
        setWorkerOptions(
          users
            .filter((user): user is { worker: { id: number; fullName: string } } => Boolean(user.worker))
            .map((user) => user.worker),
        );
      }
      setCurrentShift(currentResult.status === "fulfilled" ? currentResult.value : null);
      setTotals(totalsResult.status === "fulfilled" ? totalsResult.value : null);

      const failedRequests = [
        historyResult,
        workersResult,
        currentResult,
        totalsResult,
      ].filter((result): result is PromiseRejectedResult => result.status === "rejected");
      if (failedRequests.length) {
        const firstError = failedRequests[0].reason;
        if (firstError instanceof ApiError && firstError.status === 401) {
          router.push("/login");
        }
        throw firstError instanceof Error ? firstError : new Error("No se pudo cargar la asistencia.");
      }
    } catch (requestError) {
      const errorMessage = requestError instanceof Error
        ? requestError.message
        : "No se pudo cargar la asistencia.";
      setError(errorMessage);
      if (requestError instanceof ApiError && requestError.status === 401) router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [requestJson, router, selectedWorkerId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleShiftAction = async () => {
    if (!hasWorker) return;
    setProcessing(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = currentShift
        ? "/api/attendance/clock-out"
        : "/api/attendance/clock-in";
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(messageForError(response.status, "No se pudo registrar el movimiento."));
      }
      setMessage(currentShift ? "Salida registrada correctamente." : "Entrada registrada correctamente.");
      await loadAttendance(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo registrar el movimiento.");
      await loadAttendance(true);
    } finally {
      setProcessing(false);
    }
  };

  const openShiftNeedsAttention = currentShift
    ? Date.now() - new Date(currentShift.startedAt).getTime() >= 24 * 60 * 60 * 1000 ||
      formatDate(currentShift.startedAt) !== formatDate(new Date().toISOString())
    : false;

  const loadMoreHistory = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const workerQuery = selectedWorkerId ? `&workerId=${encodeURIComponent(selectedWorkerId)}` : "";
      const response = await requestJson(`/api/attendance/history?page=${nextPage}&pageSize=20${workerQuery}`) as HistoryResponse;
      setHistory((previous) => [...previous, ...response.data]);
      setNextPage((page) => page + 1);
      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar más historial.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleWorkerFilterChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const workerId = event.target.value;
    setSelectedWorkerId(workerId);
    setLoading(true);
    setError(null);
    try {
      await loadHistoryPage(1, workerId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  const openCorrection = (shift: WorkerShift) => {
    if (!isAdmin || !shift.worker) return;
    setCorrectionShift({...shift, worker: shift.worker});
    setCorrectionStartedAt(toDateTimeLocal(shift.startedAt));
    setCorrectionEndedAt(shift.endedAt ? toDateTimeLocal(shift.endedAt) : "");
    setCorrectionReason("");
    setCorrectionError(null);
  };

  const saveCorrection = async () => {
    if (!correctionShift || correctionSaving) return;
    if (!correctionReason.trim()) {
      setCorrectionError("El motivo de la corrección es obligatorio.");
      return;
    }

    const startedAt = toIsoTimestamp(correctionStartedAt);
    const endedAt = correctionEndedAt ? toIsoTimestamp(correctionEndedAt) : null;
    if (!startedAt || (correctionEndedAt && !endedAt)) {
      setCorrectionError("Ingresa fechas y horas válidas.");
      return;
    }

    setCorrectionSaving(true);
    setCorrectionError(null);
    try {
      await requestJson(`/api/attendance/${correctionShift.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          startedAt,
          endedAt,
          reason: correctionReason.trim(),
        }),
      });
      setCorrectionShift(null);
      setMessage("Corrección guardada correctamente.");
      await loadHistoryPage(1, selectedWorkerId);
      setNextPage(2);
    } catch (requestError) {
      setCorrectionError(requestError instanceof Error ? requestError.message : "No se pudo guardar la corrección.");
    } finally {
      setCorrectionSaving(false);
    }
  };

  return (
    <div className={`page ${styles.page}`}>
      <HeaderXuchil />
      <main className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Control personal</p>
            <h1>Asistencia</h1>
            {workerName && <p className={styles.workerName}>Trabajador: {workerName}</p>}
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => loadAttendance()}
            disabled={loading || processing}
            aria-label="Actualizar asistencia"
            title="Actualizar asistencia"
          >
            <RefreshCw size={19} />
          </button>
        </div>

        {error && <div className={styles.alertError} role="alert">{error}</div>}
        {message && <div className={styles.alertSuccess} role="status"><CheckCircle2 size={18} />{message}</div>}

        <Card className={styles.attendanceCard}>
          <section className={styles.statusCard} aria-live="polite">
            <div className={`${styles.statusIcon} ${currentShift ? styles.statusActive : styles.statusInactive}`}>
              {currentShift ? <Clock3 size={28} /> : <CalendarClock size={28} />}
            </div>
            <div className={styles.statusCopy}>
              <p className={styles.statusLabel}>
                {hasWorker ? (currentShift ? "Turno en curso" : "Sin turno activo") : "Sin trabajador asociado"}
              </p>
              <p className={styles.statusDetail}>
                {!hasWorker
                  ? "La asistencia personal no está disponible para esta cuenta."
                  : currentShift
                    ? `Entrada: ${formatDate(currentShift.startedAt)} a las ${formatTime(currentShift.startedAt)}`
                    : "Registra tu entrada para comenzar tu turno."}
              </p>
              {openShiftNeedsAttention && (
                <p className={styles.attentionMessage}>
                  Este turno comenzó anteriormente y puede requerir una corrección administrativa.
                </p>
              )}
            </div>
            {hasWorker && (
              <Button
                size="regular"
                action={currentShift ? "negative" : "primary"}
                onClick={handleShiftAction}
                disabled={processing || loading}
                className={styles.actionButton}
              >
                <span className={styles.actionContent}>
                  <span className={styles.actionIcon} aria-hidden="true">
                    {processing ? <RefreshCw size={18} /> : currentShift ? <LogOut size={18} /> : <LogIn size={18} />}
                  </span>
                  <span>{processing ? "Registrando..." : currentShift ? "Registrar salida" : "Registrar entrada"}</span>
                </span>
              </Button>
            )}
          </section>
        </Card>

        <section className={styles.summarySection}>
          <h2>Resumen</h2>
          <div className={styles.summaryGrid}>
            <Card className={styles.attendanceCard}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Resumen de hoy</span>
                <strong>{totals ? formatMinutes(totals.daily.completedMinutes) : "—"}</strong>
                <span className={styles.summaryMeta}>{totals?.daily.openShiftCount ? "Hay un turno en curso" : "Tiempo completado"}</span>
              </div>
            </Card>
            <Card className={styles.attendanceCard}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Resumen semanal</span>
                <strong>{totals ? formatMinutes(totals.weekly.completedMinutes) : "—"}</strong>
                <span className={styles.summaryMeta}>{totals?.weekly.openShiftCount ? "Hay un turno en curso" : "Tiempo completado"}</span>
              </div>
            </Card>
          </div>
        </section>

        <section className={styles.historySection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Historial de asistencia</h2>
              <p>Consulta tus entradas y salidas registradas.</p>
            </div>
            {isAdmin && (
              <label className={styles.workerFilter}>
                <span>Trabajador</span>
                <select value={selectedWorkerId} onChange={handleWorkerFilterChange} disabled={loading || correctionSaving}>
                  <option value="">Todos los trabajadores</option>
                  {workerOptions.map((worker) => (
                    <option value={worker.id} key={worker.id}>{worker.fullName}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {loading ? (
            <div className={styles.state}>Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className={styles.state}>Aún no tienes turnos registrados.</div>
          ) : (
            <>
              <div className={styles.historyTable}>
                <div className={`${styles.tableHeader} ${isAdmin ? styles.withWorker : ""} ${isAdmin ? styles.withActions : ""}`}>
                  {isAdmin && <span>Trabajador</span>}
                  <span>Fecha</span>
                  <span>Hora de entrada</span>
                  <span>Hora de salida</span>
                  <span>Duración</span>
                  {isAdmin && <span>Acción</span>}
                </div>
                {history.map((shift) => (
                  <div className={`${styles.tableRow} ${isAdmin ? styles.withWorker : ""} ${isAdmin ? styles.withActions : ""}`} key={shift.id}>
                    {isAdmin && <span data-label="Trabajador">{shift.worker?.fullName ?? "—"}</span>}
                    <span data-label="Fecha">{formatDate(shift.startedAt)}</span>
                    <span data-label="Hora de entrada">{formatTime(shift.startedAt)}</span>
                    <span data-label="Hora de salida">
                      {shift.endedAt ? formatTime(shift.endedAt) : <em className={styles.openLabel}>Turno en curso</em>}
                    </span>
                    <span data-label="Duración">{formatDuration(shift)}</span>
                    {isAdmin && (
                      <span data-label="Acción">
                        <Button size="mini" action="secondary" onClick={() => openCorrection(shift)} disabled={correctionSaving}>
                          Editar
                        </Button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {hasMore && (
                <Button size="small" action="secondary" onClick={loadMoreHistory} disabled={loadingMore}>
                  {loadingMore ? "Cargando..." : "Cargar más"}
                </Button>
              )}
            </>
          )}
        </section>
      </main>
      <Modal
        open={Boolean(correctionShift)}
        title="Corregir asistencia"
        confirmText={correctionSaving ? "Guardando..." : "Guardar corrección"}
        cancelText="Cancelar"
        onCancel={() => {
          if (!correctionSaving) setCorrectionShift(null);
        }}
        onConfirm={saveCorrection}
        width="min(92%, 520px)"
      >
        {correctionShift && (
          <div className={styles.correctionForm}>
            <p className={styles.correctionWorker}>{correctionShift.worker.fullName}</p>
            <label>
              <span>Entrada</span>
              <input
                type="datetime-local"
                value={correctionStartedAt}
                onChange={(event) => setCorrectionStartedAt(event.target.value)}
                disabled={correctionSaving}
              />
            </label>
            <label>
              <span>Salida</span>
              <input
                type="datetime-local"
                value={correctionEndedAt}
                onChange={(event) => setCorrectionEndedAt(event.target.value)}
                disabled={correctionSaving}
              />
              <small>Déjala vacía para conservar el turno abierto.</small>
            </label>
            <label>
              <span>Motivo</span>
              <TextField
                placeholder="Describe el motivo de la corrección"
                value={correctionReason}
                onChange={(event) => setCorrectionReason(event.target.value)}
              />
            </label>
            {correctionError && <div className={styles.correctionError} role="alert">{correctionError}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
