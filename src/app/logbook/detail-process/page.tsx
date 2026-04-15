"use client";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, User } from "lucide-react";
import styles from "@/styles/DetailProcess.module.css";
import UnitField from "@/components/UnitField2";
import HeaderXuchil from "@/components/HeaderXuchil";
import { fetchProcessRunDetail, fetchStepExecutionDetail } from "@/app/oldapi/logbook";
import React from "react";

const DetailProcessContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [processRun, setProcessRun] = React.useState<any | null>(null);
  const [stepDetail, setStepDetail] = React.useState<any | null>(null);
  const [materialSummary, setMaterialSummary] = React.useState<Array<{name:string, qty:number, unit?:string}>>([]);

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
      setLoading(true); setError(null);
      try {
        if (isAdminMode) {
          // Process detail (admin)
          const pr = await fetchProcessRunDetail(parseInt(id));
          setProcessRun(pr);
          // Build material consumption summary across steps if available (criteria requires it)
          // We aggregate by rawMaterial.name using tasks/{stepId} endpoint.
          const seIds = (pr?.stepExecutions ?? []).map((se: any) => se.id);
          const details = await Promise.all(seIds.map((sid: number) => fetchStepExecutionDetail(sid).catch(()=>null)));
          const acc = new Map<string, {qty:number, unit?:string}>();
          details.filter(Boolean).forEach((d: any) => {
            (d?.stepMaterialUsages ?? []).forEach((u: any) => {
              const key = u.rawMaterial?.name ?? "Materia prima";
              const prev = acc.get(key) ?? {qty:0, unit: u.unit?.name};
              acc.set(key, { qty: prev.qty + (u.qty ?? 0), unit: u.unit?.name || prev.unit });
            });
          });
          setMaterialSummary(Array.from(acc.entries()).map(([name,v])=>({name, qty:v.qty, unit:v.unit})));
        } else {
          // Step execution detail (worker)
          const sd = await fetchStepExecutionDetail(parseInt(id));
          setStepDetail(sd);
        }
      } catch (e:any) {
        setError(e?.message ?? "Error al cargar detalle");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className={styles.container}>
      <HeaderXuchil />
      {loading && <p>Cargando…</p>}
      {error && <p style={{color:"red"}}>{error}</p>}

      {isAdminMode && processRun && (
        <>
          <h1 className={styles.title}>Producto: {processRun.productVariant?.name ?? "—"}</h1>
          <h3 className={styles.processId}>Proceso no. <span>{processRun.id}</span></h3>

          <div className={styles.dateRange}>
            <Calendar size={18} />
            <span>
              {processRun.startedAt ? new Date(processRun.startedAt).toLocaleDateString("es-MX") : "—"}
              {" - "}
              {processRun.finishedAt ? new Date(processRun.finishedAt).toLocaleDateString("es-MX") : "—"}
            </span>
          </div>

          <div className={styles.timelineContainer}>
            <ul className={styles.timeline}>
              {processRun.stepExecutions?.map((se: any) => (
                <li key={se.id}>
                  <div className={styles.dot}></div>
                  <div>
                    <strong>
                      {se.templateStep?.name} <User size={16} style={{ marginLeft: 6 }} />
                    </strong>
                    <div className={styles.dateTime}>
                      <span>
                        {se.startedAt ? new Date(se.startedAt).toLocaleDateString("es-MX") : "—"}
                      </span>
                      <span>
                        {se.startedAt ? new Date(se.startedAt).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) : "—"}
                        {" - "}
                        {se.finishedAt ? new Date(se.finishedAt).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) : "—"}
                      </span>
                    </div>
                    <p className={styles.responsible}>Responsable: {se.worker?.fullName ?? "—"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {materialSummary.length > 0 && (
            <div className={styles.unitFieldWrapper}>
              {materialSummary.map((m) => (
                <UnitField key={m.name} titulo={m.name} cantidad={m.qty} unidad={m.unit ?? ""} />
              ))}
            </div>
          )}
          {typeof processRun.goodOutputQty === "number" && (
            <UnitField titulo="Producto" cantidad={processRun.goodOutputQty} unidad={processRun.outputUnit?.name ?? ""} />
          )}
          {typeof processRun.scrapQty === "number" && (
            <UnitField titulo="Merma" cantidad={processRun.scrapQty} unidad={processRun.outputUnit?.name ?? ""} />
          )}

          <div className={styles.observations}>
            <h4>Observaciones</h4>
            <div className={styles.noteCard}>
              <p>{processRun.notes ?? "Sin observaciones"}</p>
            </div>
          </div>
        </>
      )}

      {!isAdminMode && stepDetail && (
  <>
    <h1 className={styles.title}>Producto: {stepDetail.processRun?.productVariant?.name ?? "—"}</h1>
    <h2 className={styles.activityTitle}>Actividad: {stepDetail.templateStep?.name ?? "—"}</h2>

    <div className={styles.infoRow}>
      <User size={18} />
      <span>{stepDetail.worker?.fullName ?? currentUser}</span>
    </div>

    <div className={styles.infoRow}>
      <Calendar size={18} />
      <span>{stepDetail.startedAt ? new Date(stepDetail.startedAt).toLocaleDateString("es-MX") : "—"}</span>
    </div>

    <div className={styles.infoRow}>
      <Clock size={18} />
      <span>
        {stepDetail.startedAt ? new Date(stepDetail.startedAt).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) : "—"}
        {" - "}
        {stepDetail.finishedAt ? new Date(stepDetail.finishedAt).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) : "—"}
      </span>
    </div>

    <div className={styles.unitFieldWrapper}>
      {typeof stepDetail.inputQty === "number" && (
        <UnitField titulo="Entrada" cantidad={stepDetail.inputQty} unidad={stepDetail.inputUnit?.name ?? ""} />
      )}
    </div>

    <div className={styles.observations}>
      <h4>Observaciones</h4>
      <div className={styles.noteCard}>
        <p>{stepDetail.notes ?? "Sin observaciones"}</p>
      </div>
    </div>
  </>
)}

    </div>
  );
};

const DetailProcess = () => {
  return (
    <React.Suspense fallback={<div className={styles.container}><HeaderXuchil /><p>Cargando…</p></div>}>
      <DetailProcessContent />
    </React.Suspense>
  );
};

export default DetailProcess;
