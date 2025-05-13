import { ProcessStep } from "@/types/ProcessStep";
import { ProductVariant } from "@/types/ProductVariant";
import { PendingTask } from "@/types/PendingTask";
import { Order } from "@/types/Order";
import { Product } from "@/types/Product";

export interface SessionInfo {
  isAdminMode: boolean;
  currentUser: string;
}

export function getSessionInfo(): SessionInfo {
  return {
    isAdminMode: false,
    currentUser: "Antonio López",
  };
}

export function fetchProductCategories() {
    return [
      {
        id: "harina",
        name: "Harina",
        imageSrc: "/harina.svg",
      },
      {
        id: "galletas",
        name: "Galletas",
        imageSrc: "/galletas.svg",
      },
      {
        id: "frijol",
        name: "Frijol",
        imageSrc: "/frijol.svg",
      },
      {
        id: "cafe",
        name: "Sustituto de café",
        imageSrc: "/cafe.svg",
      },
    ];
  }
  
export function fetchProductVariants(productId: string): ProductVariant[] {
    switch (productId) {
      case "harina":
        return [
          {
            id: "mezquite",
            name: "Harina de Mezquite",
            imageSrc: "/mezquite.svg",
          },
          {
            id: "amaranto",
            name: "Harina de Amaranto",
            imageSrc: "/amaranto.svg",
          },
          {
            id: "maiz",
            name: "Harina de Maíz",
            imageSrc: "/maiz.svg",
          },
          {
            id: "platano",
            name: "Harina de Plátano verde",
            imageSrc: "/platano.svg",
          },
        ];
      case "galletas":
        return [
          {
            id: "chocolate",
            name: "Galletas de Chocolate",
            imageSrc: "/galleta-chocolate.svg",
          },
          {
            id: "vainilla",
            name: "Galletas de Vainilla",
            imageSrc: "/galleta-vainilla.svg",
          },
        ];
      case "frijol":
        return [
          {
            id: "negro",
            name: "Frijol Negro",
            imageSrc: "/frijol-negro.svg",
          },
          {
            id: "bayo",
            name: "Frijol Bayo",
            imageSrc: "/frijol-bayo.svg",
          },
        ];
      case "cafe":
        return [
          {
            id: "sustituto",
            name: "Sustituto de Café",
            imageSrc: "/cafe.svg",
          },
        ];
      default:
        return [];
    }
  }
  
  export function fetchProcessSteps(productId: string, variantId: string): ProcessStep[] {
    if (productId === "harina" && variantId === "mezquite") {
      return [
        { id: 1,
          title: "Recepción de materia prima",
          estimatedTime: 2,
          hasInput: true,
          unit: "Kg",
          description: "Verificar y pesar la materia prima recibida."
        },
        {
          id: 2,
          title: "Recepción de ingredientes",
          estimatedTime: 2,
          hasInput: false,
          description: "Registrar los ingredientes recibidos."
        },
        {
          id: 3,
          title: "Recepción de envase y etiquetas",
          estimatedTime: 2,
          hasInput: false,
          description: "Verificar la calidad y cantidad de envases y etiquetas." 
        },
        { 
          id: 4, 
          title: "Transporte", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Trasladar la materia prima al área de procesamiento." 
        },
        { 
          id: 5, 
          title: "Pesaje de mezquite", 
          estimatedTime: 5, 
          hasInput: true, 
          unit: "Kg", 
          description: "Pesar el mezquite para su posterior procesamiento." 
        },
        { 
          id: 6, 
          title: "Limpieza", 
          estimatedTime: 10, 
          hasInput: false,
          description: "Limpiar y preparar la materia prima." 
        },
        { 
          id: 7, 
          title: "Lavado", 
          estimatedTime: 120, 
          hasInput: false,
          description: "Lavar y enjuagar las vainas de mezquite." 
        },
        { 
          id: 8, 
          title: "Secado", 
          estimatedTime: 60, 
          hasInput: false,
          description: "Secar la materia prima en condiciones controladas." 
        },
        { 
          id: 9, 
          title: "Molienda", 
          estimatedTime: 120, 
          hasInput: false,
          description: "Moler el mezquite hasta obtener una consistencia fina." 
        },
        { 
          id: 10, 
          title: "Tamizado", 
          estimatedTime: 90, 
          hasInput: false,
          description: "Tamizar la harina para eliminar impurezas." 
        },
        { 
          id: 11, 
          title: "Cernido", 
          estimatedTime: 180, 
          hasInput: false,
          description: "Cernir manualmente la harina para separarla por consistencias." 
        },
        { 
          id: 12, 
          title: "Almacén", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Almacenar la harina en condiciones óptimas." 
        },
        { 
          id: 13, 
          title: "Etiquetado", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Etiquetar los productos con la información correspondiente." 
        },
        { 
          id: 14, 
          title: "Envasado", 
          estimatedTime: 15, 
          hasInput: false,
          description: "Empaquetar el producto final." 
        },
        { 
          id: 15, 
          title: "Venta", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Registrar la venta del producto." 
        },
        { 
          id: 16, 
          title: "Rastreo de mercancía", 
          estimatedTime: 0, 
          hasInput: false,
          description: "Realizar el seguimiento del envío." 
        },
        { 
          id: 17, 
          title: "Entrega y envío", 
          estimatedTime: 0, 
          hasInput: false,
          description: "Entregar el producto al cliente o al transportista." 
        },
      ];
    } else if (productId === "cafe" && variantId === "sustituto") {
      return [
        { 
          id: 1, 
          title: "Recepción de materia prima", 
          estimatedTime: 2, 
          hasInput: true,
          unit: "Kg",
          description: "Verificar y pesar la materia prima recibida." 
        },
        { 
          id: 2, 
          title: "Recepción de ingredientes", 
          estimatedTime: 2, 
          hasInput: false,
          description: "Registrar los ingredientes recibidos." 
        },
        { 
          id: 3, 
          title: "Recepción de envase y etiquetas", 
          estimatedTime: 2, 
          hasInput: false,
          description: "Verificar la calidad y cantidad de envases y etiquetas." 
        },
        { 
          id: 4, 
          title: "Transporte", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Trasladar la materia prima al área de procesamiento." 
        },
        { 
          id: 5, 
          title: "Pesaje de merma", 
          estimatedTime: 5, 
          hasInput: true,
          unit: "Kg",
          description: "Pesar la merma a trabajar." 
        },
        { 
          id: 6, 
          title: "Tostado", 
          estimatedTime: 120, 
          hasInput: false,
          description: "Tostar la merma de manera uniforme." 
        },
        { 
          id: 7, 
          title: "Molienda", 
          estimatedTime: 120, 
          hasInput: false,
          description: "Moler la materia para obtener la consistencia adecuada." 
        },
        { 
          id: 8, 
          title: "Tamizado", 
          estimatedTime: 90, 
          hasInput: false,
          description: "Tamizar el producto para eliminar impurezas." 
        },
        { 
          id: 9, 
          title: "Cernido", 
          estimatedTime: 60, 
          hasInput: false,
          description: "Cernir manualmente el producto." 
        },
        { 
          id: 10, 
          title: "Almacén", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Almacenar el producto terminado." 
        },
        { 
          id: 11, 
          title: "Etiquetado", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Etiquetar el producto con la información necesaria." 
        },
        { 
          id: 12, 
          title: "Envasado", 
          estimatedTime: 15, 
          hasInput: false,
          description: "Empaquetar el producto final." 
        },
        { 
          id: 13, 
          title: "Venta", 
          estimatedTime: 5, 
          hasInput: false,
          description: "Registrar la venta del producto." 
        },
        { 
          id: 14, 
          title: "Rastreo de mercancía", 
          estimatedTime: 0, 
          hasInput: false,
          description: "Realizar el seguimiento del envío." 
        },
        { 
          id: 15, 
          title: "Entrega y envío", 
          estimatedTime: 0, 
          hasInput: false,
          description: "Entregar el producto al cliente o transportista." 
        },
      ];
    }
    return [];
  }

  export function fetchPendingTasks(): PendingTask[] {
    return [
      {
        id: 1,
        productId: "harina",
        productName: "Harina de Mezquite",
        variantId: "mezquite",
        startDate: "13/02/2025",
        startedBy: "Antonio López",
        currentStep: "Tatemado (Mezquite 5kg)",
        currentStepNumber: 2,
        totalSteps: 7,
      },
      {
        id: 2,
        productId: "cafe",
        productName: "Sustituto de Café",
        variantId: "sustituto",
        startDate: "15/03/2025",
        startedBy: "Juan Pérez",
        currentStep: "Tostado",
        currentStepNumber: 3,
        totalSteps: 15,
      },
      {
        id: 3,
        productId: "harina",
        productName: "Harina de Mezquite",
        variantId: "mezquite",
        startDate: "13/02/2025",
        startedBy: "Zoraida Jiménez",
        currentStep: "Transporte",
        currentStepNumber: 4,
        totalSteps: 7,
      },
    ];
  }

  export function fetchOrders(): Order[] {
    return [
      {
        id: 12376,
        clientName: "Adán Yair Jiménez Santiago",
        address:
          "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
        deliveryDate: "01/05/2025",
        deliveryVariant: "personal",
        delivered: false,
        products: [
          {
            id: "mezquite-5kg",
            photo: "/mezquite.webp",
            name: "Harina de Mezquite",
            presentation: "5 kg",
            quantity: 20,
            units: "Unidades",
          },
          {
            id: "amaranto-1kg",
            photo: "/amaranth.webp",
            name: "Harina De Amaranto",
            presentation: "5 kg",
            quantity: 15,
            units: "Unidades",
          },
          {
            id: "sustituto-1kg",
            photo: "/coffee.webp",
            name: "Sustituto De Café",
            presentation: "1 kg",
            quantity: 12,
            units: "Unidades",
          },
        ],
      },
      {
        id: 12832,
        clientName: "Alejandra Cruz Martínez",
        address:
          "3ª Privada de La Gloria s/n, Barrio del Peñasco, 68230 Oaxaca, Oax.",
        deliveryDate: "02/05/2025",
        deliveryVariant: "mail",
        delivered: false,
        products: [
          {
            id: "mezquite-5kg",
            photo: "/mezquite.webp",
            name: "Harina de Mezquite",
            presentation: "5 kg",
            quantity: 20,
            units: "Unidades",
          },
        ],
      },
      {
        id: 13130,
        clientName: "Luis Fernando Vázquez Ríos",
        address:
          "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
        deliveryDate: "20/05/2025",
        deliveryVariant: "consignment",
        delivered: true,
        products: [
          {
            id: "mezquite-5kg",
            photo: "/mezquite.webp",
            name: "Harina de Mezquite",
            presentation: "5 kg",
            quantity: 20,
            units: "Unidades",
          },
          {
            id: "amaranto-1kg",
            photo: "/amaranth.webp",
            name: "Harina De Amaranto",
            presentation: "5 kg",
            quantity: 15,
            units: "Unidades",
          },
        ],
      },
      {
        id: 12377,
        clientName: "Patricia López Ramos",
        address:
          "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
        deliveryDate: "21/05/2025",
        deliveryVariant: "personal",
        delivered: false,
        products: [
          {
            id: "amaranto-1kg",
            photo: "/amaranth.webp",
            name: "Harina De Amaranto",
            presentation: "5 kg",
            quantity: 15,
            units: "Unidades",
          },
          {
            id: "sustituto-1kg",
            photo: "/coffee.webp",
            name: "Sustituto De Café",
            presentation: "1 kg",
            quantity: 12,
            units: "Unidades",
          },
        ],
      },
      {
        id: 12833,
        clientName: "José Armando Pérez Peña",
        address:
          "3ª Privada de La Gloria s/n, Barrio del Peñasco, 68230 Oaxaca, Oax.",
        deliveryDate: "20/07/2025",
        deliveryVariant: "mail",
        delivered: false,
        products: [
          {
            id: "mezquite-5kg",
            photo: "/mezquite.webp",
            name: "Harina de Mezquite",
            presentation: "5 kg",
            quantity: 20,
            units: "Unidades",
          },
          {
            id: "sustituto-1kg",
            photo: "/coffee.webp",
            name: "Sustituto De Café",
            presentation: "1 kg",
            quantity: 12,
            units: "Unidades",
          },
        ],
      },
      {
        id: 13131,
        clientName: "María Teresa Gómez Vargas",
        address:
          "Blvd. Guadalupe Hinojosa de Murat 1100,\n71248 San Raymundo Jalpan, Oax.",
        deliveryDate: "28/07/2025",
        deliveryVariant: "consignment",
        delivered: true,
        products: [
          {
            id: "mezquite-5kg",
            photo: "/mezquite.webp",
            name: "Harina de Mezquite",
            presentation: "5 kg",
            quantity: 20,
            units: "Unidades",
          },
          {
            id: "amaranto-1kg",
            photo: "/amaranth.webp",
            name: "Harina De Amaranto",
            presentation: "5 kg",
            quantity: 15,
            units: "Unidades",
          },
          {
            id: "sustituto-1kg",
            photo: "/coffee.webp",
            name: "Sustituto De Café",
            presentation: "1 kg",
            quantity: 12,
            units: "Unidades",
          },
        ],
      },
    ];
  }

  export function fetchProducts(): Product[] {
    return [
      {
        id: "mezquite-5kg",
        image: "/mezquite.webp",
        name: "Harina de Mezquite",
        presentation: "5 kg",
        quantity: 20,
        units: "Unidades",
      },
      {
        id: "amaranto-1kg",
        image: "/amaranth.webp",
        name: "Harina De Amaranto",
        presentation: "5 kg",
        quantity: 15,
        units: "Unidades",
      },
      {
        id: "sustituto-1kg",
        image: "/coffee.webp",
        name: "Sustituto De Café",
        presentation: "1 kg",
        quantity: 12,
        units: "Unidades",
      },
    ];
  }
