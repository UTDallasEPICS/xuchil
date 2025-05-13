"use client";
import { useSearchParams } from "next/navigation";
import { procesos } from "@/constants/tableData";
import { Calendar, Clock, User } from "lucide-react";
import styles from "@/styles/DetailProcess.module.css";
import UnitField from "@/components/UnitField2";
import HeaderXuchil from "@/components/HeaderXuchil";
import { getSessionInfo } from "@/constants/api";

const { isAdminMode, currentUser } = getSessionInfo();

const DetailProcess = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const actividadParam = searchParams.get("actividad");

  const proceso = procesos.find((p) => p.id === id);
  if (!proceso) return <p>Proceso no encontrado</p>;

  const actividad = !isAdminMode
    ? proceso.actividades.find(
        (a) => a.tarea === actividadParam && a.usuario === currentUser
      )
    : null;

  if (!isAdminMode && !actividad) return <p>Actividad no encontrada</p>;

  return (
    <div className={styles.container}>
      <HeaderXuchil />
      <h1 className={styles.title}>Producto: {proceso.producto}</h1>

      {isAdminMode && (
        <>
          <h3 className={styles.processId}>Proceso no. <span>{proceso.id}</span></h3>

          <div className={styles.dateRange}>
            <Calendar size={18} />
            <span>{proceso.fechaInicio} - {proceso.fechaFin}</span>
          </div>

          <div className={styles.timelineContainer}>
            <ul className={styles.timeline}>
              {proceso.actividades.map((a, index) => (
                <li key={index}>
                  <div className={styles.dot}></div>
                  <div>
                    <strong>
                      {a.tarea} <User size={16} style={{ marginLeft: 6 }} />
                    </strong>
                    <div className={styles.dateTime}>
                      <span>{a.fecha}</span>
                      <span>{a.horaInicio} - {a.horaFin}</span>
                    </div>
                    <p className={styles.responsible}>Responsable: {a.usuario}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <UnitField titulo="Materia prima" cantidad={proceso.materiaPrimaKg} unidad="Kg" />
          <UnitField titulo="Producto" cantidad={proceso.productoKg} unidad="Kg" />
          <UnitField titulo="Merma" cantidad={proceso.mermaKg} unidad="Kg" />

          <div className={styles.observations}>
            <h4>Observaciones</h4>
            <div className={styles.noteCard}>
              <p>{proceso.observaciones}</p>
            </div>
          </div>
        </>
      )}

      {!isAdminMode && actividad && (
  <>
    <h2 className={styles.activityTitle}>Actividad: {actividad.tarea}</h2>

    <div className={styles.infoRow}>
      <User size={18} />
      <span>{actividad.usuario}</span>
    </div>

    <div className={styles.infoRow}>
      <Calendar size={18} />
      <span>{actividad.fecha}</span>
    </div>

    <div className={styles.infoRow}>
      <Clock size={18} />
      <span>{actividad.horaInicio} - {actividad.horaFin}</span>
    </div>

    <div className={styles.unitFieldWrapper}>
      <UnitField titulo="Producto" cantidad={proceso.productoKg} unidad="Kg" />
    </div>

    <div className={styles.observations}>
      <h4>Observaciones</h4>
      <div className={styles.noteCard}>
        <p>{proceso.observaciones}</p>
      </div>
    </div>
  </>
)}

    </div>
  );
};

export default DetailProcess;
