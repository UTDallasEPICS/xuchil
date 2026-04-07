import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProductCategoryCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("productCategory");
export const POST = createHandler("productCategory", ProductCategoryCreateSchema);
