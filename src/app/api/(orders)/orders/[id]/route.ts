import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {OrderCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("order");
export const PUT = updateHandler("order", OrderCreateSchema);
export const DELETE = deleteHandler("order");
