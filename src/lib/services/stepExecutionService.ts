// stepExecutionService: actions for step-executions
import { sendRequest } from '@/utils/request';

export async function postAction(stepExecutionId: number, action: string, body?: unknown) {
  return await sendRequest({ method: 'POST', url: `/api/step-executions/${stepExecutionId}/${action}`, credentials: 'include', body });
}
