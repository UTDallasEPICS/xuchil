import prisma from '@/lib/db';

async function main() {
  await seedProductCategories();
  await seedProducts();
  await seedProcessSteps();
  await seedTasks();
}


async function lookupCategory(name: string) {
  return await prisma.productCategory.findUnique({ where: { name } });
}

async function lookupProduct(name: string) {
  return await prisma.product.findUnique({ where: { name } });
}

async function seedProductCategories() {
  await prisma.productCategory.createMany({
    data: [
      { name: "Harina", imageSrc: "/harina.svg", },
      { name: "Galletas", imageSrc: "/galletas.svg", },
      { name: "Frijol", imageSrc: "/frijol.svg", },
      { name: "Sustituto de café", imageSrc: "/cafe.svg", },
    ],
  })
}

async function seedProducts() {
  const harinaId = (await lookupCategory("Harina"))!.id;
  const galletaId = (await lookupCategory("Galletas"))!.id;
  const frijolId = (await lookupCategory("Frijol"))!.id;
  const cafeId = (await lookupCategory("Sustituto de café"))!.id;
  await prisma.product.createMany({
    data: [
      { name: "Harina de Mezquite", imageSrc: "/mezquite.svg", categoryId: harinaId, isEndProduct: true, },
      { name: "Harina de Amaranto", imageSrc: "/amaranto.svg", categoryId: harinaId, isEndProduct: true, },
      { name: "Harina de Maíz", imageSrc: "/maiz.svg", categoryId: harinaId, isEndProduct: true, },
      { name: "Harina de Plátano verde", imageSrc: "/platano.svg", categoryId: harinaId, isEndProduct: true, },
      { name: "Galletas de Chocolate", imageSrc: "/galleta-chocolate.svg", categoryId: galletaId, isEndProduct: true, },
      { name: "Galletas de Vainilla", imageSrc: "/galleta-vainilla.svg", categoryId: galletaId, isEndProduct: true, },
      { name: "Frijol Negro", imageSrc: "/frijol-negro.svg", categoryId: frijolId, isEndProduct: true, },
      { name: "Frijol Bayo", imageSrc: "/frijol-bayo.svg", categoryId: frijolId, isEndProduct: true, },
      { name: "Sustituto de Café", imageSrc: "/cafe.svg", categoryId: cafeId, isEndProduct: true, },
    ]
  })
}

async function seedProcessSteps() {
  const mezquiteHarinaId = (await lookupProduct("Harina de Mezquite"))!.id;
  const cafeId = (await lookupProduct("Sustituto de Café"))!.id;
  await prisma.processStep.createMany({
    data: [
      { order: 1, productId: mezquiteHarinaId, title: "Recepción de materia prima", estimatedTime: 2, hasInput: true, unit: "Kg", description: "Verificar y pesar la materia prima recibida.", },
      { order: 2, productId: mezquiteHarinaId, title: "Recepción de ingredientes", estimatedTime: 2, hasInput: false, description: "Registrar los ingredientes recibidos.", },
      { order: 3, productId: mezquiteHarinaId, title: "Recepción de envase y etiquetas", estimatedTime: 2, hasInput: false, description: "Verificar la calidad y cantidad de envases y etiquetas.", },
      { order: 4, productId: mezquiteHarinaId, title: "Transporte", estimatedTime: 5, hasInput: false, description: "Trasladar la materia prima al área de procesamiento.", },
      { order: 5, productId: mezquiteHarinaId, title: "Pesaje de mezquite", estimatedTime: 5, hasInput: true, unit: "Kg", description: "Pesar el mezquite para su posterior procesamiento.", },
      { order: 6, productId: mezquiteHarinaId, title: "Limpieza", estimatedTime: 10, hasInput: false, description: "Limpiar y preparar la materia prima.", },
      { order: 7, productId: mezquiteHarinaId, title: "Lavado", estimatedTime: 120, hasInput: false, description: "Lavar y enjuagar las vainas de mezquite.", },
      { order: 8, productId: mezquiteHarinaId, title: "Secado", estimatedTime: 60, hasInput: false, description: "Secar la materia prima en condiciones controladas.", },
      { order: 9, productId: mezquiteHarinaId, title: "Molienda", estimatedTime: 120, hasInput: false, description: "Moler el mezquite hasta obtener una consistencia fina.", },
      { order: 10, productId: mezquiteHarinaId, title: "Tamizado", estimatedTime: 90, hasInput: false, description: "Tamizar la harina para eliminar impurezas.", },
      { order: 11, productId: mezquiteHarinaId, title: "Cernido", estimatedTime: 180, hasInput: false, description: "Cernir manualmente la harina para separarla por consistencias.", },
      { order: 12, productId: mezquiteHarinaId, title: "Almacén", estimatedTime: 5, hasInput: false, description: "Almacenar la harina en condiciones óptimas.", },
      { order: 13, productId: mezquiteHarinaId, title: "Etiquetado", estimatedTime: 5, hasInput: false, description: "Etiquetar los productos con la información correspondiente.", },
      { order: 14, productId: mezquiteHarinaId, title: "Envasado", estimatedTime: 15, hasInput: false, description: "Empaquetar el producto final.", },
      { order: 15, productId: mezquiteHarinaId, title: "Venta", estimatedTime: 5, hasInput: false, description: "Registrar la venta del producto.", },
      { order: 16, productId: mezquiteHarinaId, title: "Rastreo de mercancía", estimatedTime: 0, hasInput: false, description: "Realizar el seguimiento del envío." },
      { order: 17, productId: mezquiteHarinaId, title: "Entrega y envío", estimatedTime: 0, hasInput: false, description: "Entregar el producto al cliente o al transportista." },
      { order: 1, productId: cafeId, title: "Recepción de materia prima", estimatedTime: 2, hasInput: true, unit: "Kg", description: "Verificar y pesar la materia prima recibida." },
      { order: 2, productId: cafeId, title: "Recepción de ingredientes", estimatedTime: 2, hasInput: false, description: "Registrar los ingredientes recibidos." },
      { order: 3, productId: cafeId, title: "Recepción de envase y etiquetas", estimatedTime: 2, hasInput: false, description: "Verificar la calidad y cantidad de envases y etiquetas." },
      { order: 4, productId: cafeId, title: "Transporte", estimatedTime: 5, hasInput: false, description: "Trasladar la materia prima al área de procesamiento." },
      { order: 5, productId: cafeId, title: "Pesaje de merma", estimatedTime: 5, hasInput: true, unit: "Kg", description: "Pesar la merma a trabajar." },
      { order: 6, productId: cafeId, title: "Tostado", estimatedTime: 120, hasInput: false, description: "Tostar la merma de manera uniforme." },
      { order: 7, productId: cafeId, title: "Molienda", estimatedTime: 120, hasInput: false, description: "Moler la materia para obtener la consistencia adecuada." },
      { order: 8, productId: cafeId, title: "Tamizado", estimatedTime: 90, hasInput: false, description: "Tamizar el producto para eliminar impurezas." },
      { order: 9, productId: cafeId, title: "Cernordero", estimatedTime: 60, hasInput: false, description: "Cernir manualmente el producto." },
      { order: 10, productId: cafeId, title: "Almacén", estimatedTime: 5, hasInput: false, description: "Almacenar el producto terminado." },
      { order: 11, productId: cafeId, title: "Etiquetado", estimatedTime: 5, hasInput: false, description: "Etiquetar el producto con la información necesaria." },
      { order: 12, productId: cafeId, title: "Envasado", estimatedTime: 15, hasInput: false, description: "Empaquetar el producto final." },
      { order: 13, productId: cafeId, title: "Venta", estimatedTime: 5, hasInput: false, description: "Registrar la venta del producto." },
      { order: 14, productId: cafeId, title: "Rastreo de mercancía", estimatedTime: 0, hasInput: false, description: "Realizar el seguimiento del envío." },
      { order: 15, productId: cafeId, title: "Entrega y envío", estimatedTime: 0, hasInput: false, description: "Entregar el producto al cliente o transportista." },
    ]
  })
}

async function seedTasks() {
  // TODO
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })