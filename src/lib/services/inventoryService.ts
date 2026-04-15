// inventoryService: inventory items and movements
import { sendRequest } from '@/utils/request';

export async function listInventoryItems() {
  return await sendRequest({ method: 'GET', url: '/api/inventory-items', credentials: 'include' });
}

export async function getInventoryItem(id: number) {
  return await sendRequest({ method: 'GET', url: `/api/inventory-items/${id}`, credentials: 'include' });
}

export async function createInventoryMovement(payload: any) {
  return await sendRequest({ method: 'POST', url: '/api/inventory-movements', credentials: 'include', body: payload });
}
