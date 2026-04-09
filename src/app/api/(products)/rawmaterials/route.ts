import {createHandler, findAllHandler} from "@/utils/handlers";
import {RawMaterialCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("rawMaterial");
export const POST = createHandler("rawMaterial", RawMaterialCreateSchema);
