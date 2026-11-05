"use client";

import React from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Scatter,
  ErrorBar,
} from 'recharts';

export interface TaskTimeData {
  taskName: string;
  min: number;
  q1?: number;
  median: number;
  q3?: number;
  average?: number;
  max: number;
  count?: number;
  hasSufficientData?: boolean;
  statusMessage?: string;
}

interface BoxWhiskerChartProps {
  data: TaskTimeData[];
  title?: string;
  height?: number;
  unit?: string;
  maxWidth?: string | number;
}

const BoxWhiskerChart: React.FC<BoxWhiskerChartProps> = ({
  data,
  title,
  height = 70,
  unit = 'minutos',
  maxWidth = '100%',
}) => {
  const item = data && data.length > 0 ? data[0] : null;

  // Empty state handling for products with 0 completed runs
  // If a product has 0 runs, do not render it at all
  const isZeroData = !item || item.count === 0 || (item.min === 0 && item.max === 0);
  if (isZeroData) {
    return (
      <div style={{
        width: '100%',
        maxWidth,
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        padding: '10px 8px',
        border: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '8px',
      }}>
        <strong style={{ color: '#374151' }}>{title}</strong>
        <span>Sin corridas completadas en este período</span>
      </div>
    );
  }

  const { min, median, max } = item;
  const q1 = item.q1 ?? min;
  const q3 = item.q3 ?? max;
  const average = typeof item.average === 'number' ? item.average : median;
  const count = item.count ?? 1;
  const hasSufficientData = item.hasSufficientData ?? (count >= 3);

  // Domain range with padding
  const domainPadding = Math.max(2, (max - min) * 0.08);
  const domainMin = Math.max(0, Math.floor(min - domainPadding));
  const domainMax = Math.ceil(max + domainPadding);
  const domainRange = domainMax - domainMin || 1;

  // Converts any numeric value to an X pixel position on a 600px canvas
  const toX = (val: number) => 35 + ((val - domainMin) / domainRange) * (600 - 70);

  return (
    <div style={{
      width: '100%',
      maxWidth,
      height,
      backgroundColor: '#ffffff',
      borderRadius: '6px',
      padding: '8px 8px',
      border: '1px solid #eee',
      marginBottom: '8px',
    }}>
      {/* Title & Simple Summary Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2px',
      }}>
        <h3 style={{
          margin: 0,
          color: '#333',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {title} <span style={{ color: '#777', fontWeight: '400' }}>(N = {count})</span>
            {!hasSufficientData && (
            <span
              title={item.statusMessage}
              style={{ marginLeft: '8px', color: '#b45309', fontSize: '11px', fontWeight: '500', whiteSpace: 'nowrap' }}
            >
              (Muestra limitada)
            </span>
          )}
        </h3>

        <div style={{ fontSize: '10px', color: '#555' }}>
          <span>Mín: {min}</span> |{' '}
          <span>Q1: <strong>{q1}</strong></span> |{' '}
          <span style={{ color: '#214e34', fontWeight: '600' }}>Mediana: {median}</span> |{' '}
          <span style={{ color: '#d97706', fontWeight: '600' }}>Promedio: {average}</span> |{' '}
          <span>Q3: <strong>{q3}</strong></span> |{' '}
          <span>Máx: {max} {unit}</span>
        </div>
      </div>

      {/* Box & Whisker Chart */}
      <svg viewBox="0 0 600 52" style={{ width: '100%', height: '52px', overflow: 'visible' }}>
         {min === max ? (
          /* Clean single-point display when N = 1 */
          <g>
            <line x1={35} y1={22} x2={565} y2={22} stroke="#e5e7eb" strokeWidth={1.5} />
            <circle cx={toX(median)} cy={22} r={6} fill="#214e34" stroke="#ffffff" strokeWidth={2} />
            <line x1={toX(median)} y1={22} x2={toX(median)} y2={35} stroke="#214e34" strokeWidth={1} />
            <text x={toX(median)} y={47} textAnchor="middle" fontSize={10} fontWeight="700" fill="#214e34">
              {median} {unit}
            </text>
          </g>
        ) : (
        <g>
        {/* Left Whisker (Min to Q1) with End Cap */}
        <line x1={toX(min)} y1={18} x2={toX(q1)} y2={18} stroke="#4b5563" strokeWidth={1.5} />
        <line x1={toX(min)} y1={11} x2={toX(min)} y2={25} stroke="#4b5563" strokeWidth={2} />

        {/* Box (Q1 to Q3) */}
        <rect
          x={toX(q1)}
          y={8}
          width={Math.max(toX(q3) - toX(q1), 2)}
          height={20}
          fill="#dcfce7"
          stroke="#214e34"
          strokeWidth={1.5}
          rx={2}
        />

        {/* Median Line */}
        <line x1={toX(median)} y1={8} x2={toX(median)} y2={28} stroke="#214e34" strokeWidth={2.5} />

        {/* Right Whisker (Q3 to Max) with End Cap */}
        <line x1={toX(q3)} y1={18} x2={toX(max)} y2={18} stroke="#4b5563" strokeWidth={1.5} />
        <line x1={toX(max)} y1={11} x2={toX(max)} y2={25} stroke="#4b5563" strokeWidth={2} />

        {/* Average Circle Marker */}
        {average !== undefined && (
          <circle cx={toX(average)} cy={18} r={4.5} fill="#d97706" stroke="#ffffff" strokeWidth={1.5} />
        )}

        {/* Axis Baseline & Ticks */}
        <line x1={toX(min)} y1={35} x2={toX(max)} y2={35} stroke="#d1d5db" strokeWidth={1} />
        {[
          { val: min, label: 'Mín' },
          { val: q1, label: 'Q1' },
          { val: median, label: 'Med' },
          { val: q3, label: 'Q3' },
          { val: max, label: 'Máx' },
        ].map((pt, i) => (
          <g key={i}>
            <line x1={toX(pt.val)} y1={35} x2={toX(pt.val)} y2={39} stroke="#9ca3af" strokeWidth={1} />
            <text x={toX(pt.val)} y={49} textAnchor="middle" fontSize={9} fill="#4b5563">
              {pt.val}
            </text>
          </g>
        ))}
        </g>
        )}
      </svg>
    </div>
  );
};

export default BoxWhiskerChart;