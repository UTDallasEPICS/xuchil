import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProductCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("product");
export const PUT = updateHandler("product", ProductCreateSchema);
export const DELETE = deleteHandler("product");
