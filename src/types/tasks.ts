// src/types/tasks.ts

// Use this enum for better type safety & auto-completion
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateTaskDto {
  worker_id: number;
  product_id: number;
  activity: string;
  input_weight: number;
  output_weight: number;
  loss_weight: number;
  status: TaskStatus;
  start_timestamp?: string;
  end_timestamp?: string;
  notes?: string;
}

export interface UpdateTaskDto {
  worker_id: number;
  product_id: number;
  activity: string;
  input_weight: number;
  output_weight: number;
  loss_weight: number;
  status: TaskStatus;
  start_timestamp?: string;
  end_timestamp?: string;
  notes?: string;
}
