// ordersService: thin wrapper around existing ordersClient functions
import * as ordersClient from "@/lib/ordersClient";
import { sendRequest } from '@/utils/request';

export async function fetchOrders() {
  return ordersClient.fetchOrdersClient();
}

export async function fetchOrderById(id: number) {
  return ordersClient.fetchOrderByIdClient(id);
}

export async function updateOrderStatus(id: number, status: "SCHEDULED" | "DELIVERED" | "CANCELLED") {
  return ordersClient.putOrderStatusClient(id, status);
}

export async function createOrder(payload: unknown) {
  return await sendRequest({ method: 'POST', url: '/api/orders', credentials: 'include', body: payload });
}

export async function updateOrder(id: number, payload: unknown) {
  return await sendRequest({ method: 'PUT', url: `/api/orders/${id}`, credentials: 'include', body: payload });
}

export async function deleteOrder(id: number) {
  return await sendRequest({ method: 'DELETE', url: `/api/orders/${id}`, credentials: 'include' });
}
