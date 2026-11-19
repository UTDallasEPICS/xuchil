import React from "react";
import { Calendar, User, ChevronRight } from "lucide-react";
import styles from "../styles/PendingTaskCard.module.css";

interface PendingTaskCardProps {
  productName: string;
  startDate: string;
  startedBy: string;
  currentStep: string;
  currentStepNumber: number;
  totalSteps: number;
  onClick?: () => void;
}

const PendingTaskCard: React.FC<PendingTaskCardProps> = ({
  productName,
  startDate,
  startedBy,
  currentStep,
  currentStepNumber,
  totalSteps,
  onClick,
}) => {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.body}>
        <p className={styles.name}>{productName}</p>
        <p className={styles.step}>{currentStep}</p>

        <p className={styles.meta}>
          <span className={styles.metaItem}>
            <Calendar size={14} className={styles.metaIcon} />
            {startDate}
          </span>
          <span className={styles.metaItem}>
            <User size={14} className={styles.metaIcon} />
            {startedBy}
          </span>
        </p>
      </div>

      <span className={styles.progress}>
        <span className={styles.progressValue}>
          {currentStepNumber}
          <span className={styles.progressTotal}>{` / ${totalSteps}`}</span>
        </span>
      </span>

      <ChevronRight size={18} className={styles.chevron} />
    </button>
  );
};

export default PendingTaskCard;
