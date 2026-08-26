"use client";

import Link from 'next/link';
import styles from "./dashboard.module.css";
import ProductivityDashboard from './ProductivityDashboard';
import TasksDashboard from './TasksDashboard';


/* Notes:
    Need to compare with 'estimatedTime' (within ProcessStep interface)
        - time is not saved into database
    For task bar:
    can just calculate by looking at PendingTask 
        - pending: have a running total of 'currentStep'
        - not started: totalSteps - currentStepNumber 
        - completed: totalSteps - (totalStep - currentStepNumber)  
    
*/

interface DashboardProps {
    currentUser: string;
    isAdminMode: boolean;
    selectedProduct: any;
    selectedUser: any;
    selectedMonth: any;
}

export default function Dashboard(
    { currentUser, isAdminMode, selectedProduct, selectedUser, selectedMonth}: DashboardProps   ) { 
    return (
        <div className={styles.container}> 
            <h6 className={styles.dashboardTitle}>Panel</h6>

            <Link href="/process-control/pending-tasks" 
                className={styles.dashBackground}
                 >
                    <h6 className={styles.insideHeader}>Productividad</h6>
                    <ProductivityDashboard 
                        currentUser={currentUser} isAdminMode={isAdminMode}
                        selectedProduct={selectedProduct} selectedUser={selectedUser} selectedMonth={selectedMonth}
                    />

                    {/* giving context to number in middle of the pi chart. "a tiempo" is on time, which is On Time + early tasks
                        NOTE: must change the percentage both in the pi chart and the statement to fit actual data!
                        for now just dummy data. */}
                    <p className={styles.summaryText}>
                        Completaste el 100% de tus tareas este mes.
                    </p>


                    <h6 className={styles.insideHeader}>Tareas</h6>
                    <TasksDashboard 
                        currentUser={currentUser} isAdminMode={isAdminMode}
                        selectedProduct={selectedProduct} selectedUser={selectedUser} selectedMonth={selectedMonth}
                    />
            </Link>
        </div>
      );
}