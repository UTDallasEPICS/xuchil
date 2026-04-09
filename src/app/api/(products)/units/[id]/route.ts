import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {UnitCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("unit");
export const PUT = updateHandler("unit", UnitCreateSchema);
export const DELETE = deleteHandler("unit");