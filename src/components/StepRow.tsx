"use client";

import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { SkipForward, Check, FileText, Clock } from "lucide-react";
import styles from "@/styles/StepRow.module.css";
import { ProcessStep } from "@/types/ProcessStep";

export type StepState = "active" | "upcoming" | "done";

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

interface StepRowProps {
  step: ProcessStep;
  position: number;
  total: number;
  state: StepState;
  elapsed?: number;
  started?: boolean;
  running?: boolean;
  onToggleRunning?: () => void;
  onSkip?: () => void;
  noteValue?: string;
  onOpenNote?: () => void;
  children?: React.ReactNode;
}

const StepRow: React.FC<StepRowProps> = ({
  step,
  position,
  total,
  state,
  elapsed = 0,
  started = false,
  running = false,
  onToggleRunning,
  onSkip,
  noteValue,
  onOpenNote,
  children,
}) => {
  const goalSeconds = Math.max(1, step.estimatedTime * 60);
  const progress = Math.min(elapsed / goalSeconds, 1);
  const overtime = elapsed > goalSeconds;
  const isActive = state === "active";

  return (
    <li className={`${styles.row} ${styles[state]}`}>
      <div className={styles.body}>
        <div className={styles.labelTop}>
          <span className={styles.chip}>
            Paso {position} de {total}
          </span>

          {state === "done" && <Check size={16} className={styles.checkIcon} />}

          {isActive && (
            <span
              className={`${styles.timeGroup} ${
                overtime ? styles.timeGroupOver : ""
              }`}
            >
              <Clock size={15} className={styles.clockIcon} />
              <span className={styles.time}>{formatTime(elapsed)}</span>
              <span className={styles.goal}>
                {overtime
                  ? `/ +${formatTime(elapsed - goalSeconds)}`
                  : `/ meta ${step.estimatedTime} min`}
              </span>
            </span>
          )}
        </div>

        <div className={styles.titleLine}>
          <h3 className={styles.title}>{step.title}</h3>

          {!!noteValue && (
            <button
              type="button"
              className={styles.noteButton}
              onClick={onOpenNote}
              aria-label={`Ver lo que se registró en ${step.title}`}
              title="Ver lo registrado"
            >
              <FileText size={16} />
            </button>
          )}
        </div>

        {isActive && !!step.description && (
          <p className={styles.description}>{step.description}</p>
        )}
      </div>

      {isActive && (
        <div className={styles.controls}>
          {!!children && <div className={styles.inputSlot}>{children}</div>}

          <div className={styles.buttons}>
            <button
              type="button"
              className={`${styles.playButton} ${
                !started ? styles.playButtonIdle : ""
              }`}
              onClick={onToggleRunning}
              aria-label={
                !started ? "Iniciar paso" : running ? "Pausar" : "Reanudar"
              }
              title={!started ? "Iniciar" : running ? "Pausar" : "Reanudar"}
            >
              {running ? <FaPause /> : <FaPlay />}
            </button>

            <button
              type="button"
              className={styles.skipButton}
              onClick={onSkip}
              aria-label="Terminar este paso y pasar al siguiente"
              title="Siguiente paso"
            >
              <SkipForward size={22} />
            </button>
          </div>
        </div>
      )}

      {isActive && started && (
        <span
          className={styles.progress}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      )}
    </li>
  );
};

export default StepRow;
