import { redirect } from 'next/navigation';

export default function OrdersIndex() {
  redirect('/orders/deliveries');
}