// stepExecutionService: actions for step-executions
import { sendRequest } from '@/utils/request';
import {ProcessExecutionRead, ProcessExecutionReadSchema} from "@/lib/schemas";

async function getAllProcessExecutions(query?: { pending?: boolean}): Promise<ProcessExecutionRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: '/api/process-executions',
    query,
  });

  return (await res.json()).map((item: unknown) => ProcessExecutionReadSchema.parse(item));
}

export default {
  getAllProcessExecutions,
}
