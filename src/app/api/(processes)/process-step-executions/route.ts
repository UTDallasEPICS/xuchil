import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessStepExecutionCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processStepExecution");
export const POST = createHandler("processStepExecution", ProcessStepExecutionCreateSchema);
