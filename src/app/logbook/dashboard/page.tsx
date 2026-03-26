"use client";

import React from 'react'
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import { fetchMyTasks, fetchProcessRuns } from "@/app/api/logbook";

import Link from 'next/link';
import styles from "./dashboard.module.css";
import ProductivityDashboard from './ProductivityDashboard';
import TasksDashboard from './TasksDashboard';
import type { LabelProps } from 'recharts';
// import styles from "./LogbookPage.module.css";   might not need


/* Notes:
    Need to compare with 'estimatedTime' (within ProcessStep interface)
        - time is not saved into database
    For task bar:
    can just calculate by looking at PendingTask 
        - pending: have a running total of 'currentStep'
        - not started: totalSteps - currentStepNumber 
        - completed: totalSteps - (totalStep - currentStepNumber)  
    
*/

export default function Dashboard() { 
    return (
        <div className={styles.container}> 
            <h6 className={styles.dashboardTitle}>Dashboard</h6>

            <Link href="/process-control/pending-tasks" 
                className={styles.dashBackground}
                 >
                    <h6 className={styles.insideHeader}>Productivity</h6>
                    <ProductivityDashboard />
                    
                    <h6 className={styles.insideHeader}>Tasks</h6>
                    <TasksDashboard />
            </Link>
        </div>
      );
}