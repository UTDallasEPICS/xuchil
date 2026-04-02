"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";
import Button from "@/components/Button";
import styles from "./PendingTasks.module.css";
import { fetchPendingTasks } from "@/constants/api";
import { PendingTask } from "@/types/PendingTask";
import { 
  RawTaskData, 
  GroupedTaskCategory 
} from "@/types/TaskTime";
import { 
  groupTasksByCategory, 
  generateMockTaskData 
} from "@/utils/dataUtils";

// Dynamically import the chart component with SSR disabled
const BoxWhiskerChart = dynamic(
  () => import("@/components/BoxWhiskerChart"),
  { 
    ssr: false,
    loading: () => (
      <div className={styles.chartLoadingPlaceholder}>
        <p>Cargando gráficos...</p>
      </div>
    )
  }
);



const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [taskCategories, setTaskCategories] = useState<GroupedTaskCategory[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const router = useRouter();

  // Load pending tasks
  useEffect(() => {
    const data = fetchPendingTasks();
    setTasks(data);
  }, []);

  // Load chart data
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartLoading(true);
        
        // Use mock data
        const mockData: RawTaskData[] = generateMockTaskData();
        const grouped = groupTasksByCategory(mockData);
        setTaskCategories(grouped);
        setChartError(null);
      } catch (err) {
        setChartError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setChartLoading(false);
      }
    };

    loadChartData();
  }, []);

  // Add this test data right before the return statement
const testData = [
  { name: "Coffee Substitute", value: 25 },
  { name: "Cookies", value: 12 },
  { name: "Beans", value: 30 },
  { name: "Flour", value: 8 },
];

// Then in your JSX, add this test chart:
{/* Test Chart - Remove after confirming it works */}


  return (
    <div className="page">
      
      
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <Button 
            size="small" 
            action="secondary" 
            onClick={() => router.push("/process-control")}
          >
            ← Back
          </Button>
          <h1>Tareas Pendientes</h1>
          <Button 
            size="small" 
            action="primary" 
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
          </Button>
        </div>
      </div>

      {/* Charts Section - Toggleable */}
    {/* Charts Section - Toggleable */}
{showCharts && (
  <div className={styles.chartsSection}>
    <h2 className={styles.sectionTitle}>Análisis de Tareas</h2>
    
    {chartLoading && (
      <div className={styles.loadingState}>
        <p>Cargando datos...</p>
      </div>
    )}
    
    {chartError && (
      <div className={styles.errorState}>
        <p>Error: {chartError}</p>
        <Button 
          size="small" 
          action="primary" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    )}
    
    {!chartLoading && !chartError && taskCategories.length === 0 && (
      <div className={styles.emptyState}>
        <p>No hay datos disponibles</p>
      </div>
    )}
    
   {!chartLoading && !chartError && taskCategories.map((category, index) => (
  <div key={`${category.category}-${index}`} style={{ 
    marginBottom: '10px',
    width: '100%',
    minHeight: '40px',
    background: '#fafafa',
    padding: '0px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
  }}>
    <div style={{ 
      width: '100%',           // Take full width
      maxWidth: '1000px',       // But no wider than 500px
      minWidth: '275px'        // And no narrower than 250px
    }}>
      <BoxWhiskerChart 
        data={category.tasks}
        title={category.category}
        height={39}
        unit="minutos"
      />
    </div>
  </div>
))}
  </div>
)}

      {/* Pending Tasks List */}
      <div className={styles.tasksSection}>
        <h2 className={styles.sectionTitle}>Pending Tasks List</h2>
        <div className={styles.container}>
          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No pending tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() =>
                  router.push(
                    `/process-control/new-production/${task.productId}/${task.variantId}/${task.currentStepNumber}`
                  )
                }
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingTasksPage;