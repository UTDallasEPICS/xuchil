import { deliveryVariants } from "@/constants/deliveryConfig";

export interface Order {
  id: number;
  address: string;
  deliveryDate: string;
  deliveryVariant: keyof typeof deliveryVariants;
}
