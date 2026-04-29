// inventoryService: inventory items and movements
import { sendRequest } from '@/utils/request';
import {ItemType} from "@prisma/client";
import {
  InventoryItemRead,
  InventoryItemReadSchema,
  InventoryLotRead,
  InventoryLotReadSchema,
  InventoryMovementRead, InventoryMovementReadSchema
} from "@/lib/schemas";
import productService from "@/lib/services/productClient";

async function getAllInventoryItems(query? : { itemType?: ItemType }): Promise<InventoryItemRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: `/api/inventory-items`,
    query,
  });
  return (await res.json() as unknown[]).map(item => InventoryItemReadSchema.parse(item));
}

async function getInventoryItemById(id: number): Promise<InventoryItemRead> {
  const res = await sendRequest({
    method: 'GET',
    url: `/api/inventory-items/${id}`,
  });
  return InventoryItemReadSchema.parse(await res.json());
}

async function getAllInventoryMovements(query?: {inventoryLotId?: number}): Promise<InventoryMovementRead[]> {
  const res = await sendRequest({
    method: 'GET',
    url: `/api/inventory-movements`,
    query,
  });
  return (await res.json() as unknown[]).map(movement => InventoryMovementReadSchema.parse(movement));
}

export default {
  getAllInventoryItems,
  getInventoryItemById,
  getAllInventoryMovements,
}
