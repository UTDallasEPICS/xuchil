// stepExecutionService: actions for step-executions
import {sendRequest} from '@/utils/request';
import {
  ProcessExecutionCreate,
  ProcessExecutionRead,
  ProcessExecutionReadSchema,
  ProcessPauseCreate,
  ProcessPauseRead,
  ProcessPauseReadSchema,
  ProcessStepExecutionCreate,
  ProcessStepExecutionRead,
  ProcessStepExecutionReadSchema,
  ProcessStepMaterialUsageCreate,
  ProcessStepMaterialUsageRead,
  ProcessStepMaterialUsageReadSchema,
} from "@/lib/schemas";
import templateClient from "@/lib/services/templateClient";
import executionClient from "@/lib/services/executionClient";

async function getAllProcessExecutions(query?: { pending?: boolean }): Promise<ProcessExecutionRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: '/api/process-executions',
    query,
  });

  return (res as unknown[]).map((item: unknown) => ProcessExecutionReadSchema.parse(item));
}

async function createProcessExecution(payload: ProcessExecutionCreate): Promise<ProcessExecutionRead> {
  const res = await sendRequest({
    method: 'POST',
    url: '/api/process-executions',
    body: payload,
  });
  return ProcessExecutionReadSchema.parse(res);
}

async function createProcessStepExecution(payload: ProcessStepExecutionCreate): Promise<ProcessStepExecutionRead> {
  const res = await sendRequest({
    method: 'POST',
    url: '/api/process-step-executions',
    body: payload,
  });
  return ProcessStepExecutionReadSchema.parse(res);
}

async function createExecutionsFromTemplate(templateId: number): Promise<ProcessExecutionRead> {
  const template = await templateClient.getProcessTemplateById(templateId);
  const processExecution = await createProcessExecution({
    processId: templateId,
    startedAt: (new Date()).toISOString(),
  });

  processExecution.processStepExecutions = await Promise.all(
      template.processTemplateSteps.map(step =>
          createProcessStepExecution({
            processExecutionId: processExecution.id,
            stepId: step.id,
          })
      )
  );
  return processExecution;
}

async function pauseStepExecution(step: ProcessStepExecutionRead): Promise<ProcessStepExecutionRead> {
  const updated = await executionClient.updateProcessStepExecution(step.id, {status: "PENDING"});
  await executionClient.createProcessPause({
    processStepExecutionId: step.id,
    startedAt: (new Date()).toISOString(),
  });
  return updated
}

async function resumeStepExecution(step: ProcessStepExecutionRead): Promise<ProcessStepExecutionRead> {
  const updated = await executionClient.updateProcessStepExecution(step.id, {status: "IN_PROGRESS"});
  const pauses = await executionClient.getAllProcessPauses({processStepExecutionId: step.id});
  await executionClient.updateProcessPause(pauses[0].id, {
    endedAt: new Date().toISOString(),
  });
  return updated
}

async function getProcessExecutionById(id: number): Promise<ProcessExecutionRead> {
  const res = await sendRequest({
    method: "GET",
    url: `/api/process-executions/${id}`,
  });

  return ProcessExecutionReadSchema.parse(res);
}

async function updateProcessExecution(
  id: number,
  payload: Partial<ProcessExecutionCreate>,
): Promise<ProcessExecutionRead> {
  const res = await sendRequest({
    method: "PUT",
    url: `/api/process-executions/${id}`,
    body: payload,
  });

  return ProcessExecutionReadSchema.parse(res);
}

async function getProcessStepExecutionById(id: number): Promise<ProcessStepExecutionRead> {
  const res = await sendRequest({
    method: "GET",
    url: `/api/process-step-executions/${id}`,
  })
  return ProcessStepExecutionReadSchema.parse(res);
}

async function updateProcessStepExecution(
  id: number,
  payload: Partial<ProcessStepExecutionCreate>,
): Promise<ProcessStepExecutionRead> {
  const res = await sendRequest({
    method: "PUT",
    url: `/api/process-step-executions/${id}`,
    body: payload,
  });

  return ProcessStepExecutionReadSchema.parse(res);
}

async function getAllProcessPauses(query?: { processStepExecutionId?: number }): Promise<ProcessPauseRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: '/api/process-pauses',
    query,
  });
  return (res as unknown[]).map((item) => ProcessPauseReadSchema.parse(item));
}

async function createProcessPause(payload: ProcessPauseCreate): Promise<ProcessPauseRead> {
  const res = await sendRequest({
    method: "POST",
    url: "/api/process-pauses",
    body: payload,
  });

  return ProcessPauseReadSchema.parse(res);
}

async function updateProcessPause(id: number, payload: Partial<ProcessPauseCreate>): Promise<ProcessPauseRead> {
  const res = await sendRequest({
    method: "PUT",
    url: `/api/process-pauses/${id}`,
    body: payload,
  });
  return ProcessPauseReadSchema.parse(res);
}

async function createMaterialUsage(payload: ProcessStepMaterialUsageCreate): Promise<ProcessStepMaterialUsageRead> {
  const res = await sendRequest({
    method: "POST",
    url: "/api/material-usages",
    body: payload,
  });

  return ProcessStepMaterialUsageReadSchema.parse(res);
}

export default {
  getAllProcessExecutions,
  getProcessExecutionById,
  createProcessExecution,
  pauseStepExecution,
  resumeStepExecution,
  createProcessStepExecution,
  updateProcessExecution,
  getProcessStepExecutionById,
  updateProcessStepExecution,
  getAllProcessPauses,
  createProcessPause,
  updateProcessPause,
  createExecutionsFromTemplate,
  createMaterialUsage
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

