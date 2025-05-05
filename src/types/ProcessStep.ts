export interface ProcessStep {
    id: number;
    title: string;
    estimatedTime: number; 
    hasInput: boolean;
    unit?: string;         
    description?: string;
  }
  