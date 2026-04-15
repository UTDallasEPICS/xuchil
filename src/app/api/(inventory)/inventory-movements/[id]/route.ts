import {deleteHandler, findByIdHandler, updateHandler} from "@/utils/handlers";
import {InventoryMovementCreateSchema} from "@/lib/schemas";

export const GET = findByIdHandler("inventoryMovement");
export const PUT = updateHandler("inventoryMovement", InventoryMovementCreateSchema);
export const DELETE = deleteHandler("inventoryMovement");
