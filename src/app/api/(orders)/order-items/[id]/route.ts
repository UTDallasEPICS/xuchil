import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {OrderItemCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("orderItem");
export const PUT = updateHandler("orderItem", OrderItemCreateSchema);
export const DELETE = deleteHandler("orderItem");
