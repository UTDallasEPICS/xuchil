import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessTemplateStepMaterialCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processTemplateStepMaterial");
export const POST = createHandler("processTemplateStepMaterial", ProcessTemplateStepMaterialCreateSchema);
