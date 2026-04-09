import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessTemplateCreateSchema} from "@/lib/schemas";

export const POST = createHandler("processTemplate", ProcessTemplateCreateSchema);
export const GET = findAllHandler("processTemplate");

