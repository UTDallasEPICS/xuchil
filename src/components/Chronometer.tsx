import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import styles from '../styles/Chronometer.module.css';

interface ChronometerProps {
  estimatedTime: number;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  initialTime?: number;
  initialRunning?: boolean;
}

const Chronometer: React.FC<ChronometerProps> = ({ estimatedTime, onStart, onPause, onResume, initialTime = 0, initialRunning = false }) => {
  const [hasStarted, setHasStarted] = useState<boolean>(initialRunning || initialTime > 0);
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(initialRunning);

  useEffect(() => {
    let intervalId: number | undefined;
    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
    if (onStart) {
      onStart();
    }
  };

  const handlePauseResume = () => {
    const willPause = isRunning;
    setIsRunning((prev) => !prev);
    if (willPause && onPause) {
      onPause();
    } else if (!willPause && onResume) {
      onResume();
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = estimatedTime > 0 ? Math.min(time / (estimatedTime * 60), 1) : 0;
  const strokeDashoffset = circumference * (1 - progress) || 0;
  const isOvertime = time > estimatedTime * 60;

  const displayText = hasStarted ? formattedTime : "INICIAR";

  return (
    <div className={styles.container}>
      <div className={styles.idealTime}>Tiempo Ideal {estimatedTime} min</div>

      <button
        className={hasStarted ? styles.disabledButton : styles.startButton}
        onClick={!hasStarted ? handleStart : undefined}
        disabled={hasStarted}
      >
        <div className={styles.timerContainer}>
          <svg className={styles.progressSvg} width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-gray-dark)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isOvertime ? "var(--color-negative)" : "var(--color-accent)"}
              strokeWidth={strokeWidth}
              fill={isOvertime ? "var(--color-green-light)" : "none"}
              strokeDasharray={circumference}
              strokeDashoffset={hasStarted ? strokeDashoffset : circumference}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className={styles.timerTextContainer}>
            <span className={styles.timerText}>{displayText}</span>
          </div>
        </div>
      </button>

      {hasStarted && (
        <button className={styles.pausePlayButton} onClick={handlePauseResume}>
          {isRunning ? (
            <FaPause size={32} color="white" />
          ) : (
            <FaPlay size={32} color="white" />
          )}
        </button>
      )}
    </div>
  );
};

export default Chronometer;
