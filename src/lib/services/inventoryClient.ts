// inventoryService: inventory items and movements
import { sendRequest } from '@/utils/request';
import {ItemType} from "@prisma/client";
import {
  InventoryItemRead,
  InventoryItemReadSchema,
  InventoryMovementCreate,
  InventoryMovementRead, InventoryMovementReadSchema
} from "@/lib/schemas";

async function getAllInventoryItems(query? : { itemType?: ItemType }): Promise<InventoryItemRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: `/api/inventory-items`,
    query,
  });
  return (res as unknown[]).map(item => InventoryItemReadSchema.parse(item));
}

async function getInventoryItemById(id: number): Promise<InventoryItemRead> {
  const res = await sendRequest({
    method: 'GET',
    url: `/api/inventory-items/${id}`,
  });
  return InventoryItemReadSchema.parse(res);
}

async function createInventoryMovement(payload: InventoryMovementCreate): Promise<InventoryMovementRead> {
  const res = await sendRequest({
    method: 'POST',
    url: `/api/inventory-movements`,
    body: payload,
  });
  return InventoryMovementReadSchema.parse(res);
}

export default {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryMovement
}
