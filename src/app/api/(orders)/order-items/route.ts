import {createHandler, findAllHandler} from "@/utils/handlers";
import {OrderItemCreateSchema} from "@/lib/schemas";

export const POST = createHandler("orderItem", OrderItemCreateSchema);
export const GET = findAllHandler("orderItem");

