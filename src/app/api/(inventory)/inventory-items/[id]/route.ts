import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {InventoryItemCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("inventoryItem");
export const PUT = updateHandler("inventoryItem", InventoryItemCreateSchema);
export const DELETE = deleteHandler("inventoryItem");
