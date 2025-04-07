"use client";
import { useSearchParams } from "next/navigation";
import { procesos } from "@/constants/tableData";
import { Calendar, User } from "lucide-react";
import Card from "@/components/Card";
import styles from "@/styles/DetailProcess.module.css";

const DetailProcess = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const proceso = procesos.find((p) => p.id === id);
  if (!proceso) return <p>Proceso no encontrado</p>;

  return (
    <div className={styles.container}>
      <h2>Producto: <span className={styles.product}>{proceso.producto}</span></h2>
      <p className={styles.procesoId}>Proceso no. <span>{proceso.id}</span></p>

      <div className={styles.dateRange}>
        <Calendar size={18} />
        <span>{proceso.fechaInicio} - {proceso.fechaFin}</span>
      </div>

      <ul className={styles.timeline}>
        {proceso.actividades.map((a, index) => (
          <li key={index}>
            <div className={styles.dot}></div>
            <div>
              <strong>{a.tarea} <User size={16} style={{ marginLeft: 6 }} /></strong>
              <p>{a.fecha}</p>
              <p>{a.horaInicio} - {a.horaFin}</p>
              <p className={styles.usuario}>Responsable: {a.usuario}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.pesos}>
        <div><span>Materia prima</span><strong>{proceso.materiaPrimaKg} Kg</strong></div>
        <div><span>Producto</span><strong>{proceso.productoKg} Kg</strong></div>
        <div><span>Merma</span><strong>{proceso.mermaKg} Kg</strong></div>
      </div>

      <div className={styles.observaciones}>
        <h4>Observaciones</h4>
        <Card>
            <p>{proceso.observaciones}</p>
        </Card>
      </div>
    </div>
  );
};

export default DetailProcess;
