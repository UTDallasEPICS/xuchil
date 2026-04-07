import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProcessStepMaterialUsageCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("processStepMaterialUsage");
export const POST = createHandler("processStepMaterialUsage", ProcessStepMaterialUsageCreateSchema);
