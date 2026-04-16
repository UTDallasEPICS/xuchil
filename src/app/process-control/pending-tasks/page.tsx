"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";
import styles from "./PendingTasks.module.css";
import { PendingTask } from "@/types/PendingTask";

const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const router = useRouter();

  useEffect(() => {
    const dummy: PendingTask[] = [
      {
        id: "1",
        productId: "101",
        productName: "Producto A",
        variantId: "201",
        startDate: "04/10/2026",
        startedBy: "Juan Perez",
        currentStep: "Mezcla",
        currentStepNumber: 2,
        totalSteps: 5,
        openRoute: "/process-control/new-production/101/201/2",
      },
      {
        id: "2",
        productId: "102",
        productName: "Producto B",
        variantId: "202",
        startDate: "04/12/2026",
        startedBy: "Maria Lopez",
        currentStep: "Empaque",
        currentStepNumber: 4,
        totalSteps: 6,
        openRoute: "/process-control/new-production/102/202/4",
      },
      {
        id: "3",
        productId: "103",
        productName: "Producto C",
        variantId: "203",
        startDate: "04/13/2026",
        startedBy: "Carlos Ruiz",
        currentStep: "Captura de resultados",
        currentStepNumber: 5,
        totalSteps: 5,
        openRoute:
          "/process-control/new-production/103/203/results?runId=3",
      },
    ];

    setTasks(dummy);
  }, []);

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>Tareas Pendientes</h1>

      <div className={styles.container}>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => router.push(task.openRoute)}
            style={{ cursor: "pointer" }}
            className={styles.cardContainer}
          >
            <PendingTaskCard
              productName={task.productName}
              startDate={task.startDate}
              startedBy={task.startedBy}
              currentStep={task.currentStep}
              currentStepNumber={task.currentStepNumber}
              totalSteps={task.totalSteps}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTasksPage;
