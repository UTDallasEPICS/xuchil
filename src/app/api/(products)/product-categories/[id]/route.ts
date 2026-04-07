import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {ProductCategoryCreateSchema} from "@/lib/schemas";
export const DELETE = deleteHandler("productCategory");
export const PUT = updateHandler("productCategory", ProductCategoryCreateSchema);
export const GET = findByIdHandler("productCategory");

