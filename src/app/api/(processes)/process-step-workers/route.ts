import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessStepWorkerCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processStepWorker");
export const POST = createHandler("processStepWorker", ProcessStepWorkerCreateSchema);
