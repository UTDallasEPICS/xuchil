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
  max: number;
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
  height = 180,
  unit = 'min',
  maxWidth = '100%'
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
        No hay datos para {title}
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => a.median - b.median);
  const maxValue = Math.max(...sortedData.map(d => d.max));
  const minValue = Math.min(...sortedData.map(d => d.min));
  
  // Set domain with padding on both sides
  const xAxisMin = Math.max(0, Math.floor(minValue - 2)); // Start just below min value
  const xAxisMax = Math.ceil(maxValue + 2); // End just above max value
  
  // Calculate min, max, and median across all tasks
  const globalMin = Math.min(...sortedData.map(d => d.min));
  const globalMax = Math.max(...sortedData.map(d => d.max));
  const globalMedian = sortedData[Math.floor(sortedData.length / 2)]?.median || 0;

  // Create custom ticks with min, median, and max (NO 0)
  const customTicks = [globalMin, globalMedian, globalMax]
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a - b);

  console.log('Custom ticks:', customTicks); // Debug

  const chartData = sortedData.map((item, index) => ({
    taskName: item.taskName,
    median: item.median,
    min: item.min,
    max: item.max,
    index: index,
  }));

  return (
    <div style={{ 
      width: '100%',
      maxWidth: maxWidth, 
      height: height,
      backgroundColor: 'white',
      borderRadius: '6px',
      padding: '8px'
    }}>
      {title && (
        <h3 style={{ 
          marginBottom: '6px', 
          color: '#333',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'left'
        }}>
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          layout="vertical"
          margin={{ top: 2, right: 10, left: 0, bottom: 5 }}
          barCategoryGap={2}
          barGap={1}
        >
          <XAxis 
            type="number"
            domain={[xAxisMin, xAxisMax]}
            ticks={customTicks}
            tickCount={customTicks.length}
           padding={{ left: 0, right: 0 }}
          label={{ 
            value: `Tiempo (${unit})`, 
            position: 'bottom',
            offset: 5,
            style: { fontSize: '9px', fill: '#666' }
          }}
          tick={{ fontSize: 8 }}
          axisLine={{ stroke: '#ccc', strokeWidth: 1 }}
          tickLine={true}
          allowDecimals={true}
          interval={0}
          // Add this to prevent extra ticks
          allowDataOverflow={true}
          scale="linear"
          tickMargin={5}
          tickFormatter={(value) => {
          // Only show values that are in your customTicks array
          if (customTicks.includes(value)) {
            return value % 1 === 0 ? `${value}` : `${value.toFixed(1)}`;
           }
          return '';
         }}
/>
          <YAxis 
            type="category" 
            dataKey="index"
            hide={true}
            scale="point"
            padding={{ top: 0, bottom: 0 }}
          />
          
          <Scatter 
            dataKey="median" 
            fill="#214e34"
            shape="square"
            name="Mediana"
            size={28}
          >
            <ErrorBar 
              dataKey="min" 
              direction="x" 
              stroke="#666" 
              strokeWidth={1}
              width={6}
            />
            <ErrorBar 
              dataKey="max" 
              direction="x" 
              stroke="#666" 
              strokeWidth={1}
              width={6}
            />
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BoxWhiskerChart;