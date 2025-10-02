import { ProcessStep } from "./ProcessStep";

export interface Product {
    id: string;
    name: string;
    presentation: string;
    image: string;
    quantity: number;
    units: string;

    categoryId?: string;
    variantId?: string;

    //billOfMaterials: BillOfMaterialsItem[];
    processSteps?: ProcessStep[];
  }
  