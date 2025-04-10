"use client";

import { useRouter } from "next/navigation";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./ProcessControl.module.css";

const ProcessControl = () => {
  const router = useRouter();

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>Control de procesos</h1>

      <div className={styles.container}>  
        <ImageCard imageSrc="/new-process.svg" text="Nueva producción" type="large" route="/process-control/new-production" />
        <ImageCard imageSrc="/pending-task.svg" text="Tareas pendientes" type="large" route="/process-control/new-production" />
      </div>
    </div>
  );
};

export default ProcessControl;
