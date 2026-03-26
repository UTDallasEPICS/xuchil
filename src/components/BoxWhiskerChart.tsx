"use client";

import React from 'react';
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  ErrorBar,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Define the data structure for a single task
export interface TaskTimeData {
  taskName: string;
  min: number;
  median: number;
  max: number;
}

// Define props for the chart component
interface BoxWhiskerChartProps {
  data: TaskTimeData[];
  title?: string;
  height?: number;
  unit?: string;
}

// Type for the chart data with name field (transformed from taskName)
interface ChartDataItem extends Omit<TaskTimeData, 'taskName'> {
  name: string;
}

// Simple custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{data?.name}</p>
        <p style={{ margin: '5px 0 0', color: '#ff7300' }}>
          Median: {data?.median} min
        </p>
        <p style={{ margin: '5px 0 0', color: '#666' }}>
          Range: {data?.min} - {data?.max} min
        </p>
      </div>
    );
  }
  return null;
};

const BoxWhiskerChart: React.FC<BoxWhiskerChartProps> = ({ 
  data, 
  title, 
  height = 300,
  unit = 'min'
}) => {
  // Transform data for the chart (convert taskName to name for XAxis)
  const chartData: ChartDataItem[] = data.map(item => ({
    name: item.taskName,
    min: item.min,
    median: item.median,
    max: item.max
  }));

  return (
    <div style={{ width: '100%', height, marginBottom: '30px' }}>
      {title && <h3 style={{ marginBottom: '10px', color: '#333' }}>{title}</h3>}
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: `Time (${unit})`, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Median points with error bars */}
          <Scatter 
            dataKey="median" 
            fill="#ff7300" 
            stroke="#ff7300"
            shape="diamond"
            name={`Median Time (${unit})`}
          >
            <ErrorBar 
              dataKey="max" 
              direction="y" 
              stroke="#666" 
              strokeWidth={2} 
              width={8}
            />
            <ErrorBar 
              dataKey="min" 
              direction="y" 
              stroke="#666" 
              strokeWidth={2} 
              width={8}
            />
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BoxWhiskerChart;