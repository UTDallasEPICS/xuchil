"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";

import Button from "@/components/Button";
import styles from "./PendingTasks.module.css";
import { fetchPendingTasks } from "@/constants/api";
import { PendingTask } from "@/types/PendingTask";
import dynamic from 'next/dynamic';
const BoxWhiskerChart = dynamic(
  () => import("@/components/BoxWhiskerChart"),
  { ssr: false, loading: () => <div>Loading chart...</div> }
);
import { 
  RawTaskData, 
  GroupedTaskCategory 
} from "@/types/TaskTime";
import { 
  groupTasksByCategory, 
  generateMockTaskData 
} from "@/utils/dataUtils";


const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [taskCategories, setTaskCategories] = useState<GroupedTaskCategory[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState<boolean>(true); // Toggle to show/hide charts
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
        
        // TODO: Replace with actual API call when available
        // For now, using mock data
        // const response = await fetch('/api/task-times');
        // const data: RawTaskData[] = await response.json();
        
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

  return (
    <div className="page">
      <HeaderXuchil />
      
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
            {showCharts ? "Hide Charts" : "Show Charts"}
          </Button>
        </div>
      </div>

      {/* Charts Section - Toggleable */}
      {showCharts && (
        <div className={styles.chartsSection}>
          <h2 className={styles.sectionTitle}>Analysis de Tareas</h2>
          
          {chartLoading && (
            <div className={styles.loadingState}>
              <p>Loading task time data...</p>
            </div>
          )}
          
          {chartError && (
            <div className={styles.errorState}>
              <p>Error loading charts: {chartError}</p>
              <Button 
                size="small" 
                action="primary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}
          
          {!chartLoading && !chartError && taskCategories.length === 0 && (
            <div className={styles.emptyState}>
              <p>No task time data available</p>
            </div>
          )}
          
          {!chartLoading && !chartError && taskCategories.map((category, index) => (
            <div key={`${category.category}-${index}`} className={styles.chartWrapper}>
              <BoxWhiskerChart 
                data={category.tasks}
                title={category.category}
                height={350}
                unit="minutes"
              />
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