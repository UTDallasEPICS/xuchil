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
  median: number;
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
  const average = typeof item.average === 'number' ? item.average : median;
  const count = item.count ?? 1;
  const hasSufficientData = item.hasSufficientData ?? (count >= 3);

  // Domain with safe padding to prevent tick labels from clipping
  const xAxisMin = Math.max(0, Math.floor(min - 2));
  const xAxisMax = Math.ceil(max + 2);

  // Custom ticks for Min, Median, Average, and Max
  const customTicks = [min, median, average, max]
    .filter((v, i, self) => self.indexOf(v) === i)
    .sort((a, b) => a - b);

  const chartData = [
    {
      taskName: item.taskName,
      median,
      average,
      min,
      max,
      errorX: [median-min, max-median],
      index: 0,
    },
  ];

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
            <span style={{ marginLeft: '8px', color: '#b45309', fontSize: '11px', fontWeight: '500' }}>
              ({item.statusMessage || `Muestra limitada (N = ${count})`})
            </span>
          )}
        </h3>

        <div style={{ fontSize: '10px', color: '#555' }}>
          <span>Mín: {min}</span> |{' '}
          <span style={{ color: '#214e34', fontWeight: '600' }}>Mediana: {median}</span> |{' '}
          <span style={{ color: '#d97706', fontWeight: '600' }}>Promedio: {average}</span> |{' '}
          <span>Máx: {max} {unit}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={chartData}
          layout="vertical"
          margin={{ top: 2, right: 25, left: 25, bottom: 4 }}
        >
          <XAxis
            type="number"
            domain={[xAxisMin, xAxisMax]}
            ticks={customTicks}
            tickCount={customTicks.length}
            tick={{ fontSize: 9 }}
            axisLine={{ stroke: '#ccc', strokeWidth: 1 }}
            tickLine={true}
            allowDecimals={true}
            interval={0}
            scale="linear"
            tickFormatter={(val) => `${val}`}
          />
          <YAxis
            type="category"
            dataKey="index"
            hide={true}
          />

          {/* Median: reen Square (#214e34) with Min/Max ErrorBar */}
          <Scatter
            dataKey="median"
            fill="#214e34"
            shape="square"
            name="Mediana"
            isAnimationActive={false}
          >
            <ErrorBar
              dataKey="errorX"
              direction="x"
              stroke="#666"
              strokeWidth={1.5}
              width={6}
            />
          </Scatter>

          {/* Average: Orange Circle (#d97706) */}
          <Scatter
            dataKey="average"
            fill="#d97706"
            shape="circle"
            name="Promedio"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BoxWhiskerChart;