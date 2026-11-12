"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Card from "@/components/Card";
import styles from "./Comparison.module.css";

type WorkerComparison = {
  workerId: number;
  workerName: string;
  attendanceMinutes: number;
  recordedActivityMinutes: number;
  productionMinutes: number;
  nonProductionMinutes: number | null;
  nonProductionAvailable: boolean;
  unallocatedMinutes: number;
  excessActivityMinutes: number;
  provisional: boolean;
  warnings: Array<{code: string; message: string; id?: number}>;
};

type UserWithWorker = {worker?: {id: number; fullName: string} | null};

const formatMinutes = (minutes: number) => `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AttendanceComparisonPage() {
  const today = localDate(new Date());
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [workerId, setWorkerId] = useState("");
  const [workerOptions, setWorkerOptions] = useState<Array<{id: number; fullName: string}>>([]);
  const [workerOptionsError, setWorkerOptionsError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<WorkerComparison[]>([]);
  const [warnings, setWarnings] = useState<Array<{code: string; message: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/users/me", {credentials: "include"})
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el perfil.");
        return response.json();
      })
      .then(async (profile) => {
        if (!profile?.isAdmin) return;
        const response = await fetch("/api/users", {credentials: "include"});
        if (!response.ok) throw new Error("No se pudieron cargar los trabajadores.");
        const users = await response.json();
        if (active) setWorkerOptions(
          (users as UserWithWorker[])
            .filter((user): user is {worker: {id: number; fullName: string}} => Boolean(user.worker))
            .map((user) => user.worker),
        );
      })
      .catch((requestError: unknown) => {
        if (active) setWorkerOptionsError(
          requestError instanceof Error ? requestError.message : "No se pudieron cargar los trabajadores.",
        );
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const workerQuery = workerId ? `&workerId=${encodeURIComponent(workerId)}` : "";
    fetch(`/api/attendance/comparison?dateFrom=${dateFrom}&dateTo=${dateTo}${workerQuery}`, {credentials: "include"})
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "No se pudo cargar la comparación.");
        return body;
      })
      .then((body) => {
        if (!active) return;
        setWorkers(body.workers);
        setWarnings(body.warnings);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setWorkers([]);
          setWarnings([]);
          setError(requestError instanceof Error ? requestError.message : "No se pudo cargar la comparación.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [dateFrom, dateTo, workerId]);

  return (
    <div className={`page ${styles.page}`}>
      <HeaderXuchil />
      <main className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Asistencia</p>
            <h1>Comparación de actividad</h1>
          </div>
          <Link href="/attendance" className={styles.backLink}>Volver a asistencia</Link>
        </div>

        <Card className={styles.filters}>
          <label>Desde<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label>Hasta<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
          {workerOptions.length > 0 && (
            <label>Trabajador
              <select value={workerId} onChange={(event) => setWorkerId(event.target.value)}>
                <option value="">Todos los trabajadores</option>
                {workerOptions.map((worker) => <option value={worker.id} key={worker.id}>{worker.fullName}</option>)}
              </select>
            </label>
          )}
        </Card>

        {error && <div className={styles.error} role="alert">{error}</div>}
        {workerOptionsError && <div className={styles.error} role="alert">{workerOptionsError}</div>}
        {warnings.length > 0 && (
          <Card className={styles.warning}>
            <strong>Advertencias de registros</strong>
            <ul>{warnings.map((warning, index) => <li key={`${warning.code}-${index}`}>{warning.message}</li>)}</ul>
          </Card>
        )}
        {loading ? <p>Cargando comparación...</p> : workers.length === 0 ? <p>No hay registros para el periodo seleccionado.</p> : (
          <section className={styles.grid}>
            {workers.map((worker) => (
              <Card key={worker.workerId} className={styles.workerCard}>
                <h2>{worker.workerName}</h2>
                <dl>
                  <div><dt>Asistencia</dt><dd>{formatMinutes(worker.attendanceMinutes)}</dd></div>
                  <div><dt>Actividad registrada</dt><dd>{formatMinutes(worker.recordedActivityMinutes)}</dd></div>
                  <div><dt>Producción</dt><dd>{formatMinutes(worker.productionMinutes)}</dd></div>
                  <div><dt>No producción</dt><dd>{worker.nonProductionAvailable && worker.nonProductionMinutes !== null ? formatMinutes(worker.nonProductionMinutes) : "No disponible"}</dd></div>
                  <div className={styles.unallocated}><dt>Tiempo no asignado</dt><dd>{formatMinutes(worker.unallocatedMinutes)}</dd></div>
                </dl>
                {worker.provisional && <p className={styles.provisional}>Provisional: incluye intervalos abiertos limitados al momento del reporte.</p>}
                {worker.excessActivityMinutes > 0 && <p className={styles.error}>La actividad registrada excede la asistencia por {formatMinutes(worker.excessActivityMinutes)}.</p>}
                {worker.warnings.length > 0 && <ul className={styles.workerWarnings}>{worker.warnings.map((warning, index) => <li key={`${warning.code}-${index}`}>{warning.message}</li>)}</ul>}
              </Card>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
