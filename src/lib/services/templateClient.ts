import { sendRequest } from '@/utils/request';
import {ProcessTemplateRead, ProcessTemplateReadSchema} from "@/lib/schemas";

export async function fetchPendingRuns() {
  return await sendRequest({ method: 'GET', url: '/api/process-runs/pending', credentials: 'include' });
}

async function getAllProcessTemplates(): Promise<ProcessTemplateRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/process-templates' });
  return (await res.json()).map((item: unknown) => ProcessTemplateReadSchema.parse(item));}

async function getProcessTemplateById(id: number): Promise<ProcessTemplateRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/process-templates/${id}` });
  return ProcessTemplateReadSchema.parse(await res.json());
}

export async function listProcessTemplates() {
  return await sendRequest({ method: 'GET', url: '/api/process-templates', credentials: 'include' });
}

export async function getProcessTemplate(id: number) {
  return await sendRequest({ method: 'GET', url: `/api/process-templates/${id}`, credentials: 'include' });
}

export async function createTemplateWithSteps(payload: unknown) {
  return await sendRequest({ method: 'POST', url: '/api/process-templates/create-with-steps', credentials: 'include', body: payload });
}

export async function createTemplate(payload: unknown) {
  return await sendRequest({ method: 'POST', url: '/api/process-templates', credentials: 'include', body: payload });
}

export async function updateTemplate(id: number, payload: unknown) {
  return await sendRequest({ method: 'PUT', url: `/api/process-templates/${id}`, credentials: 'include', body: payload });
}

export async function addTemplateStep(templateId: number, stepPayload: unknown) {
  return await sendRequest({ method: 'POST', url: `/api/templates/${templateId}/steps`, credentials: 'include', body: stepPayload });
}

export async function updateTemplateStep(stepId: number, payload: unknown) {
  return await sendRequest({ method: 'PUT', url: `/api/template-steps/${stepId}`, credentials: 'include', body: payload });
}

export async function deleteTemplateStep(stepId: number) {
  return await sendRequest({ method: 'DELETE', url: `/api/template-steps/${stepId}`, credentials: 'include' });
}
