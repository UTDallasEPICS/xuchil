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
      category: "Flour",
      times: [5, 6, 7, 8, 9, 6, 7, 8, 7, 6, 8, 9], // 5-9 min
      id: "1"
    },
    {
      taskName: "Cookies",
      category: "Cookies", 
      times: [8, 10, 12, 9, 11, 13, 10, 12, 11, 9, 10, 12], // 8-13 min
      id: "2"
    },
    {
      taskName: "Coffee Substitute",
      category: "Coffee Substitute",
      times: [15, 18, 22, 25, 28, 20, 24, 26, 23, 21, 27, 30], // 15-30 min
      id: "3"
    },
    {
      taskName: "Beans",
      category: "Beans",
      times: [20, 25, 28, 30, 32, 26, 29, 31, 27, 28, 30, 33], // 20-33 min
      id: "4"
    }
  ];
};