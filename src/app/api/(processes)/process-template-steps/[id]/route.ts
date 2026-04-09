import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessTemplateStepCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processTemplateStep");
export const PUT = updateHandler("processTemplateStep", ProcessTemplateStepCreateSchema);
export const DELETE = deleteHandler("processTemplateStep");
