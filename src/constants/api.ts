export function fetchProducts() {
    return [
      {
        id: "harinas",
        name: "Harinas",
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
      case "harinas":
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
  