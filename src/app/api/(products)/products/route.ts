import {createHandler, findAllHandler} from "@/utils/handlers";
import {ProductCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("product");
export const POST = createHandler("product", ProductCreateSchema);
