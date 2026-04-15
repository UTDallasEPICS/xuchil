import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessStepWorkerCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processStepWorker");
export const PUT = updateHandler("processStepWorker", ProcessStepWorkerCreateSchema);
export const DELETE = deleteHandler("processStepWorker");
