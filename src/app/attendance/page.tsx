"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Clock3, LogIn, LogOut, RefreshCw } from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import HeaderXuchil from "@/components/HeaderXuchil";
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
  const [history, setHistory] = useState<WorkerShift[]>([]);
  const [totals, setTotals] = useState<AttendanceTotals | null>(null);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestJson = useCallback(async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });
    if (!response.ok) {
      throw new Error(messageForError(response.status, "No se pudo cargar la información."));
    }
    return response.json();
  }, []);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const date = formatDateInput(new Date());
      const [current, historyResponse, totalsResponse] = await Promise.all([
        requestJson("/api/attendance/current"),
        requestJson("/api/attendance/history?page=1&pageSize=20"),
        requestJson(`/api/attendance/totals?date=${date}`),
      ]);
      setCurrentShift(current);
      setHistory((historyResponse as HistoryResponse).data);
      setNextPage(2);
      setHasMore(
        (historyResponse as HistoryResponse).pagination.page <
          (historyResponse as HistoryResponse).pagination.totalPages,
      );
      setTotals(totalsResponse);
    } catch (requestError) {
      const errorMessage = requestError instanceof Error
        ? requestError.message
        : "No se pudo cargar la asistencia.";
      setError(errorMessage);
      if (errorMessage.startsWith("Tu sesión")) router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [requestJson, router]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleShiftAction = async () => {
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
      await loadAttendance();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo registrar el movimiento.");
      await loadAttendance();
    } finally {
      setProcessing(false);
    }
  };

  const loadMoreHistory = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const response = await requestJson(`/api/attendance/history?page=${nextPage}&pageSize=20`) as HistoryResponse;
      setHistory((previous) => [...previous, ...response.data]);
      setNextPage((page) => page + 1);
      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar más historial.");
    } finally {
      setLoadingMore(false);
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
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={loadAttendance}
            disabled={loading || processing}
            aria-label="Actualizar asistencia"
            title="Actualizar asistencia"
          >
            <RefreshCw size={19} />
          </button>
        </div>

        {error && <div className={styles.alertError} role="alert">{error}</div>}
        {message && <div className={styles.alertSuccess} role="status"><CheckCircle2 size={18} />{message}</div>}

        <Card>
          <section className={styles.statusCard} aria-live="polite">
            <div className={`${styles.statusIcon} ${currentShift ? styles.statusActive : styles.statusInactive}`}>
              {currentShift ? <Clock3 size={28} /> : <CalendarClock size={28} />}
            </div>
            <div className={styles.statusCopy}>
              <p className={styles.statusLabel}>{currentShift ? "Turno en curso" : "Sin turno activo"}</p>
              <p className={styles.statusDetail}>
                {currentShift
                  ? `Entrada: ${formatDate(currentShift.startedAt)} a las ${formatTime(currentShift.startedAt)}`
                  : "Registra tu entrada para comenzar tu turno."}
              </p>
            </div>
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
          </section>
        </Card>

        <section className={styles.summarySection}>
          <h2>Resumen</h2>
          <div className={styles.summaryGrid}>
            <Card>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Resumen de hoy</span>
                <strong>{totals ? formatMinutes(totals.daily.completedMinutes) : "—"}</strong>
                <span className={styles.summaryMeta}>{totals?.daily.openShiftCount ? "Hay un turno en curso" : "Tiempo completado"}</span>
              </div>
            </Card>
            <Card>
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
          </div>
          {loading ? (
            <div className={styles.state}>Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className={styles.state}>Aún no tienes turnos registrados.</div>
          ) : (
            <>
              <div className={styles.historyTable}>
                <div className={styles.tableHeader}>
                  <span>Fecha</span>
                  <span>Hora de entrada</span>
                  <span>Hora de salida</span>
                  <span>Duración</span>
                </div>
                {history.map((shift) => (
                  <div className={styles.tableRow} key={shift.id}>
                    <span data-label="Fecha">{formatDate(shift.startedAt)}</span>
                    <span data-label="Hora de entrada">{formatTime(shift.startedAt)}</span>
                    <span data-label="Hora de salida">
                      {shift.endedAt ? formatTime(shift.endedAt) : <em className={styles.openLabel}>Turno en curso</em>}
                    </span>
                    <span data-label="Duración">{formatDuration(shift)}</span>
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
    </div>
  );
};

export default AttendancePage;
