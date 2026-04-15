import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {RawMaterialCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("rawMaterial");
export const PUT = updateHandler("rawMaterial", RawMaterialCreateSchema);
export const DELETE = deleteHandler("rawMaterial");
