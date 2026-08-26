// ordersService: thin wrapper around existing ordersClient functions
import { sendRequest } from '@/utils/request';
import {
  OrderCreate,
  OrderItemCreate,
  OrderItemRead,
  OrderItemReadSchema,
  OrderRead,
  OrderReadSchema
} from "@/lib/schemas";

async function getAllOrders(): Promise<OrderRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/orders' });
  return (await res.json()).map((item: unknown) => OrderReadSchema.parse(item));
}

async function getOrderById(id: number): Promise<OrderRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/orders/${id}` });
  return OrderReadSchema.parse(await res.json());
}

async function updateOrder(id: number, payload: Partial<OrderCreate>): Promise<OrderRead> {
  const res = await sendRequest({ method: 'PUT', url: `/api/orders/${id}`, body: payload });
  return OrderReadSchema.parse(await res.json());
}

async function createOrder(payload: OrderCreate): Promise<OrderRead> {
  const res = await sendRequest({ method: 'POST', url: '/api/orders', body: payload });
  return OrderReadSchema.parse(await res.json());
}

async function createOrderItem(payload: OrderItemCreate): Promise<OrderItemRead> {
  const res = await sendRequest({ method: 'POST', url: '/api/order-items', body: payload });
  return OrderItemReadSchema.parse(await res.json());
}

async function deleteOrder(id: number) {
  await sendRequest({ method: 'DELETE', url: `/api/orders/${id}` });
}

const orderClient = {
  getAllOrders,
  getOrderById,
  updateOrder,
  createOrder,
  createOrderItem,
  deleteOrder,
};

export default orderClient;
