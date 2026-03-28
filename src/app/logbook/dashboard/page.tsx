"use client";

import Link from 'next/link';
import styles from "./dashboard.module.css";
import ProductivityDashboard from './ProductivityDashboard';
import TasksDashboard from './TasksDashboard';
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
        // dashboard too long for phone change later ?
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