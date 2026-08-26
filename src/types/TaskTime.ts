// src/types/TaskTime.ts

// Raw data from API or mock
export interface RawTaskData {
  taskName: string;
  category: string;
  times: number[]; // Array of completion times in minutes
  id?: string | number;
}

// Transformed data for charts
export interface TransformedTaskData {
  taskName: string;
  min: number;
  median: number;
  max: number;
}

// Grouped by category for display
export interface GroupedTaskCategory {
  category: string;
  tasks: TransformedTaskData[];
}

// API Response types for task time data
export interface ApiTaskTimeResponse {
  data: RawTaskData[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
  };
}

// If your backend uses snake_case naming convention
export interface BackendTaskData {
  id: string;
  task_name: string;
  category: string;
  completion_times: number[];
  created_at: string;
  updated_at: string;
}

// Adapter function to convert backend data to frontend format
export const adaptBackendTaskData = (backendData: BackendTaskData[]): RawTaskData[] => {
  return backendData.map(item => ({
    taskName: item.task_name,
    category: item.category,
    times: item.completion_times,
    id: item.id
  }));
};