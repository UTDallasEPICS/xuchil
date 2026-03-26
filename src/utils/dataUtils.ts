// src/utils/dataUtils.ts
import { 
  RawTaskData, 
  TransformedTaskData, 
  GroupedTaskCategory 
} from '@/types/TaskTime';

/**
 * Calculate median from sorted array
 */
const calculateMedian = (sortedArray: number[]): number => {
  if (sortedArray.length === 0) return 0;
  
  const mid = Math.floor(sortedArray.length / 2);
  
  if (sortedArray.length % 2 === 0) {
    return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
  } else {
    return sortedArray[mid];
  }
};

/**
 * Transform raw task data to chart format
 */
export const transformTaskDataForChart = (tasks: RawTaskData[]): TransformedTaskData[] => {
  return tasks.map(task => {
    const times = task.times || [];
    
    if (times.length === 0) {
      return {
        taskName: task.taskName,
        min: 0,
        median: 0,
        max: 0
      };
    }
    
    const sorted = [...times].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = calculateMedian(sorted);
    
    return {
      taskName: task.taskName,
      min,
      median,
      max
    };
  });
};

/**
 * Group tasks by category
 */
export const groupTasksByCategory = (tasks: RawTaskData[]): GroupedTaskCategory[] => {
  const grouped = new Map<string, RawTaskData[]>();
  
  tasks.forEach(task => {
    const category = task.category;
    const existing = grouped.get(category) || [];
    grouped.set(category, [...existing, task]);
  });
  
  return Array.from(grouped.entries()).map(([category, categoryTasks]) => ({
    category,
    tasks: transformTaskDataForChart(categoryTasks)
  }));
};

/**
 * Generate mock data for testing
 */
export const generateMockTaskData = (): RawTaskData[] => {
  return [
    {
      taskName: "Flour",
      category: "Production Tasks",
      times: [5, 7, 8, 9, 15, 6, 8, 10, 12, 8, 9, 11],
      id: "1"
    },
    {
      taskName: "Beans",
      category: "Production Tasks", 
      times: [3, 5, 4, 6, 5, 7, 5, 4, 8, 5, 6],
      id: "2"
    },
    {
      taskName: "Cookies",
      category: "Production Tasks",
      times: [10, 12, 15, 18, 25, 15, 14, 16, 20, 22],
      id: "3"
    },
    {
      taskName: "Coffee Substitute",
      category: "Production Tasks",
      times: [15, 18, 20, 22, 30, 25, 20, 19, 23],
      id: "4"
    }
  ];
};