import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessExecutionCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processExecution");
export const POST = createHandler("processExecution", ProcessExecutionCreateSchema);
