"use client";

import { useRouter } from "next/navigation";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./ProcessControl.module.css";

const ProcessControl = () => {
  const router = useRouter();

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <div className={styles.newProcessButtonWrapper}>
        <Button
          size="small"
          action="secondary"
          onClick={() => router.push("/process-control/new-process")}
        >
          + Nuevo Proceso
        </Button>
      </div>

      <HeaderXuchil />

      <div className={styles.headerContainer}>
        <h1>Control de procesos</h1>
      </div>

      <div className={styles.container}>  
        <ImageCard imageSrc="/new-process.svg" text="Nueva producción" type="large" route="/process-control/new-production" />
        <ImageCard imageSrc="/pending-task.svg" text="Tareas pendientes" type="large" route="/process-control/pending-tasks" />
      </div>
    </div>
  );
};

export default ProcessControl;
