import {createHandler, findAllHandler} from "@/utils/handlers";
import {InventoryMovementCreateSchema} from "@/lib/schemas";

export const GET = findAllHandler("inventoryMovement");
export const POST = createHandler("inventoryMovement", InventoryMovementCreateSchema);
