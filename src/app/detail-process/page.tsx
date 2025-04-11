"use client";
import { useSearchParams } from "next/navigation";
import { procesos } from "@/constants/tableData";
import { Calendar, User } from "lucide-react";
import Card from "@/components/Card";
import styles from "@/styles/DetailProcess.module.css";
import UnitField from "@/components/UnitField";
import HeaderXuchil from "@/components/HeaderXuchil";

const DetailProcess = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const proceso = procesos.find((p) => p.id === id);
  if (!proceso) return <p>Proceso no encontrado</p>;

  return (
    <div className={styles.container}>
      <HeaderXuchil/>
      <h1>Producto: {proceso.producto}</h1>
      <h3 className={styles.procesoId}>Proceso no. <span>{proceso.id}</span></h3>

      <div className={styles.dateRange}>
        <Calendar size={18} />
        <span>{proceso.fechaInicio} - {proceso.fechaFin}</span>
      </div>

      <div className={styles.timelineContainer}>
      <ul className={styles.timeline}>
  {proceso.actividades.map((a, index) => (
    <li
      key={index}
      className={
        index === 0
          ? styles.first
          : index === proceso.actividades.length - 1
          ? styles.last
          : ""
      }
    >
      <div className={styles.dot}></div>
      <div>
        <strong>
          {a.tarea} <User size={16} style={{ marginLeft: 6 }} />
        </strong>
        <div className={styles.fechaHora}>
          <span>{a.fecha}</span>
          <span>{a.horaInicio} - {a.horaFin}</span>
        </div>
        <p className={styles.usuario}>Responsable: {a.usuario}</p>
      </div>
    </li>
  ))}
</ul>
</div>




        <UnitField titulo="Materia prima" cantidad={proceso.materiaPrimaKg} unidad="Kg" />
        <UnitField titulo="Producto" cantidad={proceso.productoKg} unidad="Kg" />
        <UnitField titulo="Merma" cantidad={proceso.mermaKg} unidad="Kg" />
      {/* <div className={styles.pesos}>
        <UnitField titulo="Materia prima" cantidad={proceso.materiaPrimaKg} unidad="Kg" />
        <UnitField titulo="Producto" cantidad={proceso.productoKg} unidad="Kg" />
        <UnitField titulo="Merma" cantidad={proceso.mermaKg} unidad="Kg" />
      </div> */}

      <div className={styles.observaciones}>
        <h4>Observaciones</h4>
        <div className={styles.provisionalCard}>
            <p>{proceso.observaciones}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailProcess;
