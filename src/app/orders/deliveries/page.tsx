"use client";
import OrderCard from "@/components/OrderCard";
import { Order } from "@/types/Order";

const mockOrders: Order[] = [
  {
    id: 12376,
    address:
      "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
    deliveryDate: "13/03/2025",
    deliveryVariant: "personal",
  },
  {
    id: 12832,
    address:
      "3ª privada de La Gloria s/n, Barrio del Peñasco, 68230 Oaxaca, Oax.",
    deliveryDate: "18/03/2025",
    deliveryVariant: "mail",
  },
  {
    id: 13130,
    address:
      "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
    deliveryDate: "27/03/2025",
    deliveryVariant: "consignment",
  },
];


const Deliveries = () => {
  return (
    <section>
      {mockOrders.map((order) => (
        <OrderCard key={order.id} {...order} />
      ))}
    </section>
  );
};

export default Deliveries;
