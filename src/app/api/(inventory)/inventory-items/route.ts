import {createHandler, findAllHandler} from "@/utils/handlers";
import {InventoryItemCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("inventoryItem");
export const POST = createHandler("inventoryItem", InventoryItemCreateSchema);
