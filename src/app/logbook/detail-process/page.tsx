"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Check, MessageSquare } from "lucide-react";
import styles from "@/styles/DetailProcess.module.css";
import {
  fetchProcessRunDetail,
  fetchStepExecutionDetail,
  type LogbookProcessRun,
  type LogbookTask,
} from "@/app/api/logbook";

const hora = (v?: string | null) =>
  v
    ? new Date(v).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    : "—";

const fecha = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("es-MX") : "—";

function duracion(min: number | null) {
  if (min === null || Number.isNaN(min)) return null;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")} min`;
}

function minutosEntre(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

function inicial(nombre?: string | null) {
  return (nombre || "?").trim().charAt(0).toUpperCase();
}

interface PasoProps {
  nombre: string;
  desde?: string | null;
  hasta?: string | null;
  responsable?: string | null;
  metaMin?: number | null;
  hecho?: boolean;
}

const Paso: React.FC<PasoProps> = ({
  nombre,
  desde,
  hasta,
  responsable,
  metaMin,
  hecho = true,
}) => {
  const reales = minutosEntre(desde, hasta);
  const texto = duracion(reales);
  const excedido = reales !== null && !!metaMin && reales > metaMin;

  return (
    <li className={styles.step}>
      <span className={`${styles.bullet} ${hecho ? styles.bulletDone : ""}`}>
        {hecho && <Check size={14} strokeWidth={3} />}
      </span>

      <div className={styles.stepBody}>
        <div className={styles.stepHead}>
          <h3 className={styles.stepName}>{nombre}</h3>

          {texto && metaMin && (
            <span
              className={`${styles.chip} ${
                excedido ? styles.chipOver : styles.chipOk
              }`}
            >
              {excedido ? `${texto} · meta ${duracion(metaMin!)}` : `${texto} · en meta`}
            </span>
          )}
        </div>

        <p className={styles.stepTime}>
          {hora(desde)} – {hora(hasta)}
        </p>

        {!!responsable && (
          <p className={styles.person}>
            <span className={styles.avatar}>{inicial(responsable)}</span>
            {responsable}
          </p>
        )}
      </div>
    </li>
  );
};

const DetailProcessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [processRun, setProcessRun] = React.useState<LogbookProcessRun | null>(null);
  const [stepDetail, setStepDetail] = React.useState<LogbookTask | null>(null);
  const [materialSummary, setMaterialSummary] = React.useState<
    Array<{ name: string; qty: number; unit?: string }>
  >([]);

  React.useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        if (!mounted) return;
        setIsAdminMode(!!data.isAdmin);
        setCurrentUser(data.worker?.fullName ?? data.email ?? "");
      } catch {
        return;
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        if (isAdminMode) {
          const pr = await fetchProcessRunDetail(parseInt(id));
          setProcessRun(pr);

          const seIds = (pr?.stepExecutions ?? []).map((se) => Number(se.id));
          const details = await Promise.all(
            seIds.map((sid: number) => fetchStepExecutionDetail(sid).catch(() => null))
          );
          const acc = new Map<string, { qty: number; unit?: string }>();
          details
            .filter((d): d is LogbookTask => Boolean(d))
            .forEach((d) => {
            (d.stepMaterialUsages ?? []).forEach((u) => {
              const key = u.rawMaterial?.name ?? "Materia prima";
              const prev = acc.get(key) ?? { qty: 0, unit: u.unit?.name };
              acc.set(key, {
                qty: prev.qty + (u.qty ?? 0),
                unit: u.unit?.name ?? prev.unit ?? undefined,
              });
            });
          });
          setMaterialSummary(
            Array.from(acc.entries()).map(([name, v]) => ({
              name,
              qty: v.qty,
              unit: v.unit,
            }))
          );
        } else {
          setStepDetail(await fetchStepExecutionDetail(parseInt(id)));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar detalle");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isAdminMode]);

  const pasos = processRun?.stepExecutions ?? [];
  const hechos = pasos.filter((se) => !!se.finishedAt).length;
  const totalMin = minutosEntre(processRun?.startedAt, processRun?.finishedAt);

  const resultados: Array<{ label: string; valor: string }> = [];
  if (processRun) {
    materialSummary.forEach((m) =>
      resultados.push({ label: m.name, valor: `${m.qty} ${m.unit ?? ""}`.trim() })
    );
    if (typeof processRun.goodOutputQty === "number") {
      resultados.push({
        label: "Producto",
        valor: `${processRun.goodOutputQty} ${processRun.outputUnit?.name ?? ""}`.trim(),
      });
    }
    if (typeof processRun.scrapQty === "number") {
      resultados.push({
        label: "Merma",
        valor: `${processRun.scrapQty} ${processRun.outputUnit?.name ?? ""}`.trim(),
      });
    }
  }
  if (stepDetail && typeof stepDetail.inputQty === "number") {
    resultados.push({
      label: "Entrada",
      valor: `${stepDetail.inputQty} ${stepDetail.inputUnit?.name ?? ""}`.trim(),
    });
  }

  const notas = isAdminMode ? processRun?.notes : stepDetail?.notes;
  const cargado = isAdminMode ? !!processRun : !!stepDetail;

  return (
    <div className={styles.wrapper}>
      {loading && <p className={styles.state}>Cargando…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && cargado && (
        <>
          <header className={styles.head}>
            <button
              type="button"
              className={styles.back}
              onClick={() => router.back()}
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>

            <div className={styles.headText}>
              <h1 className={styles.title}>
                {isAdminMode
                  ? processRun?.productVariant?.name ?? "—"
                  : stepDetail?.processRun?.productVariant?.name ?? "—"}
                <span className={styles.lote}>
                  {" · "}
                  {isAdminMode
                    ? `Lote ${processRun?.batchCode ?? processRun?.id}`
                    : stepDetail?.templateStep?.name ?? "Actividad"}
                </span>
              </h1>

              <p className={styles.meta}>
                <span className={styles.metaItem}>
                  <Calendar size={14} className={styles.metaIcon} />
                  {fecha(isAdminMode ? processRun?.startedAt : stepDetail?.startedAt)}
                </span>

                {isAdminMode && duracion(totalMin) && (
                  <span className={styles.metaItem}>
                    <Clock size={14} className={styles.metaIcon} />
                    {duracion(totalMin)} total
                  </span>
                )}

                {isAdminMode && pasos.length > 0 && (
                  <span className={styles.metaItem}>
                    <Check size={14} className={styles.metaIcon} />
                    {hechos} de {pasos.length} pasos
                  </span>
                )}
              </p>
            </div>
          </header>

          <div className={styles.card}>
            <ul className={styles.timeline}>
              {isAdminMode ? (
                pasos.map((se) => (
                  <Paso
                    key={se.id}
                    nombre={se.templateStep?.name ?? "Paso"}
                    desde={se.startedAt}
                    hasta={se.finishedAt}
                    responsable={se.worker?.fullName}
                    metaMin={se.templateStep?.idealDurationMin}
                    hecho={!!se.finishedAt}
                  />
                ))
              ) : (
                <Paso
                  nombre={stepDetail?.templateStep?.name ?? "Actividad"}
                  desde={stepDetail?.startedAt}
                  hasta={stepDetail?.finishedAt}
                  responsable={stepDetail?.worker?.fullName ?? currentUser}
                  metaMin={stepDetail?.templateStep?.idealDurationMin}
                  hecho={!!stepDetail?.finishedAt}
                />
              )}
            </ul>
          </div>

          {resultados.length > 0 && (
            <div className={styles.card}>
              <dl className={styles.results}>
                {resultados.map((r) => (
                  <div key={r.label} className={styles.resultRow}>
                    <dt className={styles.resultLabel}>{r.label}</dt>
                    <dd className={styles.resultValue}>{r.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <p className={`${styles.notes} ${notas ? styles.notesFilled : ""}`}>
            <MessageSquare size={15} className={styles.notesIcon} />
            {notas || "Sin observaciones registradas"}
          </p>
        </>
      )}
    </div>
  );
};

const DetailProcess = () => {
  return (
    <React.Suspense
      fallback={
        <div className={styles.wrapper}>
          <p className={styles.state}>Cargando…</p>
        </div>
      }
    >
      <DetailProcessContent />
    </React.Suspense>
  );
};

export default DetailProcess;
