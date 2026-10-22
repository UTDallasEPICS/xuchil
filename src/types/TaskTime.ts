// src/types/TaskTime.ts

// Raw data from API or mock
export interface RawTaskData {
  taskName: string;
  category: string;
  times: number[]; // Array of completion times in minutes
  id?: string | number;
}