import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessTemplateStepMaterialCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processTemplateStepMaterial");
export const PUT = updateHandler("processTemplateStepMaterial", ProcessTemplateStepMaterialCreateSchema);
export const DELETE = deleteHandler("processTemplateStepMaterial");
