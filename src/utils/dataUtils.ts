// src/utils/dataUtils.ts
import { 
  RawTaskData, 
  TransformedTaskData, 
  GroupedTaskCategory 
} from '@/types/TaskTime'; 

/**
 * Calculate median from sorted array
 */
export function calculateMedian(sortedArray: number[]): number {
    const mid = Math.floor(sortedArray.length / 2);
  if (sortedArray.length % 2 === 0) {
    return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
  } else {
    return sortedArray[mid];
  }
}