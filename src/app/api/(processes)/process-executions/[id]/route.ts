import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessExecutionCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processExecution");
export const PUT = updateHandler("processExecution", ProcessExecutionCreateSchema);
export const DELETE = deleteHandler("processExecution");
