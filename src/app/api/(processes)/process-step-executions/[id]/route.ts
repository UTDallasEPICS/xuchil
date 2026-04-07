import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessStepExecutionCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processStepExecution");
export const PUT = updateHandler("processStepExecution", ProcessStepExecutionCreateSchema);
export const DELETE = deleteHandler("processStepExecution");
