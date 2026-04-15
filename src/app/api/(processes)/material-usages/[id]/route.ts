import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProcessStepMaterialUsageCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("processStepMaterialUsage");
export const PUT = updateHandler("processStepMaterialUsage", ProcessStepMaterialUsageCreateSchema);
export const DELETE = deleteHandler("processStepMaterialUsage");
