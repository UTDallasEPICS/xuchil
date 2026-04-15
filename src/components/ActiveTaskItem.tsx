"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaPause, FaExternalLinkAlt } from "react-icons/fa";
import styles from "../styles/ActiveTaskItem.module.css";
import * as stepExecutionService from "@/lib/services/stepExecutionService";

interface ActiveTaskItemProps {
    productName: string;
    currentStepName: string;
    currentStepNumber: number;
    totalSteps: number;
    status: "IN_PROGRESS" | "PAUSED";
    stepExecutionId: number | null;
    startedAt?: string | null;
    openRoute: string;
    isResultsStage?: boolean;
    onActionComplete?: () => void;
}

const ActiveTaskItem: React.FC<ActiveTaskItemProps> = ({
    productName,
    currentStepName,
    currentStepNumber,
    totalSteps,
    status,
    stepExecutionId,
    startedAt,
    openRoute,
    isResultsStage = false,
    onActionComplete,
}) => {
    const router = useRouter();
    const [elapsed, setElapsed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Mini timer
    useEffect(() => {
        if (status !== "IN_PROGRESS" || !startedAt) {
            return;
        }
        const start = new Date(startedAt).getTime();
        const updateElapsed = () => {
            setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        };
        updateElapsed();
        const interval = window.setInterval(updateElapsed, 1000);
        return () => window.clearInterval(interval);
    }, [status, startedAt]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const callAction = async (action: string, body?: object) => {
        if (!stepExecutionId || isLoading) return;
        setIsLoading(true);
        try {
            await stepExecutionService.postAction(stepExecutionId, action, body);
            onActionComplete?.();
        } catch (e) {
            console.error(`Action ${action} error:`, e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePause = (e: React.MouseEvent) => {
        e.stopPropagation();
        callAction("pause", { reason: null });
    };

    const handleResume = (e: React.MouseEvent) => {
        e.stopPropagation();
        callAction("resume");
    };

    const handleOpen = () => {
        router.push(openRoute);
    };

    const isPaused = status === "PAUSED";

    return (
        <div
            className={`${styles.activeTaskItem} ${isPaused ? styles.paused : ""}`}
            onClick={handleOpen}
            style={{ cursor: "pointer" }}
        >
            <div className={styles.stepBadge}>
                {isResultsStage ? "FIN" : `${currentStepNumber}/${totalSteps}`}
            </div>

            <div className={styles.taskInfo}>
                <p className={styles.taskName}>
                    {productName}
                    <span
                        className={`${styles.statusBadge} ${isPaused ? styles.pausedBadge : styles.running
                            }`}
                    >
                        {isPaused ? "Pausada" : "Activa"}
                    </span>
                </p>
                <p className={styles.taskMeta}>
                    {currentStepName}
                    {status === "IN_PROGRESS" && (
                        <span className={styles.miniTimer}> — {formatTime(elapsed)}</span>
                    )}
                </p>
            </div>

            <div className={styles.actions}>
                {status === "IN_PROGRESS" ? (
                    <button
                        className={`${styles.actionBtn} ${styles.pauseBtn}`}
                        onClick={handlePause}
                        disabled={isLoading}
                        title="Pausar"
                    >
                        <FaPause size={12} />
                    </button>
                ) : (
                    <button
                        className={`${styles.actionBtn} ${styles.resumeBtn}`}
                        onClick={handleResume}
                        disabled={isLoading}
                        title="Reanudar"
                    >
                        <FaPlay size={12} />
                    </button>
                )}
                <button
                    className={`${styles.actionBtn} ${styles.openBtn}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                    }}
                    title="Abrir"
                >
                    <FaExternalLinkAlt size={12} />
                </button>
            </div>
        </div>
    );
};

export default ActiveTaskItem;
