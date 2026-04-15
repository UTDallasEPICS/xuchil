// logbookService: re-export/adapter of src/lib/logbook.ts
import * as lb from "@/lib/logbook";

export const fetchMyTasks = lb.fetchMyTasks;
export const fetchStepExecutionDetail = lb.fetchStepExecutionDetail;
export const fetchProcessRuns = lb.fetchProcessRuns;
export const fetchProcessRunDetail = lb.fetchProcessRunDetail;
