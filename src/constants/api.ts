import { ProcessStep } from "@/types/types";

export function fetchProducts() {
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
  
export function fetchProductVariants(productId: string) {
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
        { id: 1, title: "Recepción de materia prima", estimatedTime: 2, hasInput: true },
        { id: 2, title: "Recepción de ingredientes", estimatedTime: 2, hasInput: false },
        { id: 3, title: "Recepción de envase y etiquetas", estimatedTime: 2, hasInput: false },
        { id: 4, title: "Transporte", estimatedTime: 5, hasInput: false },
        { id: 5, title: "Pesaje de mezquite", estimatedTime: 5, hasInput: true },
        { id: 6, title: "Limpieza", estimatedTime: 10, hasInput: false },
        { id: 7, title: "Lavado", estimatedTime: 120, hasInput: false },
        { id: 8, title: "Secado", estimatedTime: 60, hasInput: false },
        { id: 9, title: "Molienda", estimatedTime: 120, hasInput: false },
        { id: 10, title: "Tamizado", estimatedTime: 90, hasInput: false },
        { id: 11, title: "Cernido", estimatedTime: 180, hasInput: false },
        { id: 12, title: "Almacén", estimatedTime: 5, hasInput: false },
        { id: 13, title: "Etiquetado", estimatedTime: 5, hasInput: false },
        { id: 14, title: "Envasado", estimatedTime: 15, hasInput: false },
        { id: 15, title: "Venta", estimatedTime: 5, hasInput: false },
        { id: 16, title: "Rastreo de mercancía", estimatedTime: 0, hasInput: false },
        { id: 17, title: "Entrega y envío", estimatedTime: 0, hasInput: false },
      ];
    }
    
    else if (productId === "cafe" && variantId === "sustituto") {
      return [
        { id: 1, title: "Recepción de materia prima", estimatedTime: 2, hasInput: true },
        { id: 2, title: "Recepción de ingredientes", estimatedTime: 2, hasInput: false },
        { id: 3, title: "Recepción de envase y etiquetas", estimatedTime: 2, hasInput: false },
        { id: 4, title: "Transporte", estimatedTime: 5, hasInput: false },
        { id: 5, title: "Pesaje de merma", estimatedTime: 5, hasInput: true },
        { id: 6, title: "Tostado", estimatedTime: 120, hasInput: false },
        { id: 7, title: "Molienda", estimatedTime: 120, hasInput: false },
        { id: 8, title: "Tamizado", estimatedTime: 90, hasInput: false },
        { id: 9, title: "Cernido", estimatedTime: 60, hasInput: false },
        { id: 10, title: "Almacén", estimatedTime: 5, hasInput: false },
        { id: 11, title: "Etiquetado", estimatedTime: 5, hasInput: false },
        { id: 12, title: "Envasado", estimatedTime: 15, hasInput: false },
        { id: 13, title: "Venta", estimatedTime: 5, hasInput: false },
        { id: 14, title: "Rastreo de mercancía", estimatedTime: 0, hasInput: false },
        { id: 15, title: "Entrega y envío", estimatedTime: 0, hasInput: false },
      ];
    }
  
    return [];
  }