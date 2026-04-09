import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessPauseCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processPause");
export const PUT = updateHandler("processPause", ProcessPauseCreateSchema);
export const DELETE = deleteHandler("processPause");
