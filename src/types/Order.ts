import { deliveryVariants } from "@/constants/deliveryConfig";
import { ProductCardProps } from "@/components/ProductCard";

export interface Order {
  id: number;
  clientName: string;
  address: string;
  deliveryDate: string;
  deliveryVariant: keyof typeof deliveryVariants;
  delivered: boolean;
  products: (Omit<ProductCardProps, "onClick"> & { id: string })[];
}
