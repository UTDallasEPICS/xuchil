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
 export const postAction = async (stepExecutionId: number, action: string, body?: object) => {
        const response = await fetch(`/api/steps/${stepExecutionId}/actions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, ...body }),
        });

        if (!response.ok) {
            throw new Error(`Failed to execute action: ${response.statusText}`);
        }

        return response.json();
    };

