import {createHandler, findAllHandler} from "@/utils/handlers";
import {OrderCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("order");
export const POST = createHandler("order", OrderCreateSchema);
