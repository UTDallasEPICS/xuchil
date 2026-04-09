import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessTemplateStepCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processTemplateStep");
export const POST = createHandler("processTemplateStep", ProcessTemplateStepCreateSchema);
