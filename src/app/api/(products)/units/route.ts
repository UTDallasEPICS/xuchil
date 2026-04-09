import {createHandler, findAllHandler} from "@/utils/handlers";
import {UnitCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("unit");
export const POST = createHandler("unit", UnitCreateSchema);