import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessPauseCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processPause");
export const POST = createHandler("processPause", ProcessPauseCreateSchema);
