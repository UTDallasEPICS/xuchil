import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessTemplateCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processTemplate");
export const PUT = updateHandler("processTemplate", ProcessTemplateCreateSchema);
export const DELETE = deleteHandler("processTemplate");
