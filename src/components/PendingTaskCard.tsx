import React from "react";
import styles from "../styles/PendingTaskCard.module.css";

interface PendingTaskCardProps {
  productName: string;
  startDate: string;
  startedBy: string;
  currentStep: string;
  currentStepNumber: number;
  totalSteps: number;
}

const PendingTaskCard: React.FC<PendingTaskCardProps> = ({
  productName,
  startDate,
  startedBy,
  currentStep,
  currentStepNumber,
  totalSteps,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.leftColumn}>
        <h3 className={styles.header}>{productName}</h3>
        <h4 className={styles.subheader}>Fecha:</h4>
        <p className={styles.text}>{startDate}</p>

        <h4 className={styles.subheader}>Comenzado por:</h4>
        <p className={styles.text}>{startedBy}</p>

        <h4 className={styles.subheader}>Paso Actual:</h4>
        <p className={styles.text}>{currentStep}</p>
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.circle}>
          {currentStepNumber} / {totalSteps}
        </div>
      </div>
    </div>
  );
};

export default PendingTaskCard;
