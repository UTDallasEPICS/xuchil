import { sendRequest } from '@/utils/request';
import {
  ProcessTemplateCreate,
  ProcessTemplateRead,
  ProcessTemplateReadSchema,
  ProcessTemplateStepCreate,
  ProcessTemplateStepRead,
  ProcessTemplateStepReadSchema,
  ProcessTemplateStepMaterialCreate,
} from "@/lib/schemas";

async function getAllProcessTemplates(): Promise<ProcessTemplateRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/process-templates' });
  return (await res.json()).map((item: unknown) => ProcessTemplateReadSchema.parse(item));
}

async function getProcessTemplateById(id: number): Promise<ProcessTemplateRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/process-templates/${id}` });
  return ProcessTemplateReadSchema.parse(await res.json());
}

async function createProcessTemplate(payload: ProcessTemplateCreate): Promise<ProcessTemplateRead> {
  const res = await sendRequest({ method: 'POST', url: '/api/process-templates', body: payload });
  return ProcessTemplateReadSchema.parse(await res.json());
}

async function updateProcessTemplate(id: number, payload: Partial<ProcessTemplateCreate>): Promise<ProcessTemplateRead> {
  const res = await sendRequest({ method: 'PUT', url: `/api/process-templates/${id}`, body: payload });
  return ProcessTemplateReadSchema.parse(await res.json());
}

async function deleteProcessTemplate(id: number): Promise<void> {
  await sendRequest({ method: 'DELETE', url: `/api/process-templates/${id}` });
}

async function getProcessTemplateStepById(id: number): Promise<ProcessTemplateStepRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/process-template-steps/${id}` });
  return ProcessTemplateStepReadSchema.parse(await res.json());
}

async function createProcessTemplateStep(
  payload: ProcessTemplateStepCreate,
): Promise<ProcessTemplateStepRead> {
  const res = await sendRequest({ method: 'POST', url: '/api/process-template-steps', body: payload });
  return ProcessTemplateStepReadSchema.parse(await res.json());
}

async function updateProcessTemplateStep(
  id: number,
  payload: Partial<ProcessTemplateStepCreate>,
): Promise<ProcessTemplateStepRead> {
  const res = await sendRequest({ method: 'PUT', url: `/api/process-template-steps/${id}`, body: payload });
  return ProcessTemplateStepReadSchema.parse(await res.json());
}

async function deleteProcessTemplateStep(id: number): Promise<void> {
  await sendRequest({ method: 'DELETE', url: `/api/process-template-steps/${id}` });
}

async function createProcessTemplateStepMaterial(
  payload: ProcessTemplateStepMaterialCreate,
): Promise<void> {
  await sendRequest({ method: 'POST', url: '/api/process-template-materials', body: payload });
}

async function updateProcessTemplateStepMaterial(
  id: number,
  payload: Partial<ProcessTemplateStepMaterialCreate>,
): Promise<void> {
  await sendRequest({ method: 'PUT', url: `/api/process-template-materials/${id}`, body: payload });
}

async function deleteProcessTemplateStepMaterial(id: number): Promise<void> {
  await sendRequest({ method: 'DELETE', url: `/api/process-template-materials/${id}` });
}

const templateClient = {
  getAllProcessTemplates,
  getProcessTemplateById,
  createProcessTemplate,
  updateProcessTemplate,
  deleteProcessTemplate,
  getProcessTemplateStepById,
  createProcessTemplateStep,
  updateProcessTemplateStep,
  deleteProcessTemplateStep,
  createProcessTemplateStepMaterial,
  updateProcessTemplateStepMaterial,
  deleteProcessTemplateStepMaterial,
};

export default templateClient;
