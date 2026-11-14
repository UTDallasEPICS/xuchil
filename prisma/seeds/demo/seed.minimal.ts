import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding minimum data...`)

  
  // 1. UNIDADES
  
  await prisma.unit.createMany({
    data: [
      { id: 1, name: "kg", factorToBase: 1 },
      { id: 2, name: "g", factorToBase: 0.001 },
      { id: 3, name: "L", factorToBase: 1 },
      { id: 4, name: "mL", factorToBase: 0.001 },
      { id: 5, name: "unidad", factorToBase: 1 },
    ]
  });
  console.log('  Unidades');

  
  // 2. CATEGORÍAS DE PRODUCTO
  
  await prisma.productCategory.createMany({
    data: [
      { id: 1, name: "Harina", imageUrl: "/harina.svg" },
      { id: 2, name: "Galletas", imageUrl: "/galletas.svg" },
      { id: 3, name: "Frijol", imageUrl: "/frijol.svg" },
      { id: 4, name: "Sustituto de café", imageUrl: "/cafe.svg" },
    ]
  });
  console.log('  Categorías de producto');

  
  // 3. PRODUCTOS
  
  await prisma.product.createMany({
    data: [
      { id: 1, categoryId: 1, sku: "HAR001", name: "Harina", defaultUnitId: 1 },
      { id: 2, categoryId: 2, sku: "GAL001", name: "Galletas", defaultUnitId: 5 },
      { id: 3, categoryId: 3, sku: "FRI001", name: "Frijol", defaultUnitId: 1 },
      { id: 4, categoryId: 4, sku: "CAF001", name: "Sustituto de café", defaultUnitId: 1 },
    ]
  });
  console.log('  Productos');

  
  // 4. VARIANTES DE PRODUCTO
  
  await prisma.productVariant.createMany({
    data: [
      { id: 1, productId: 1, name: "Harina de Mezquite", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/mezquite.webp" },
      { id: 2, productId: 1, name: "Harina de Amaranto", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/amaranth.webp" },
      { id: 3, productId: 1, name: "Harina de Maíz", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5 },
      { id: 4, productId: 1, name: "Harina de Plátano verde", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5 },
      { id: 5, productId: 2, name: "Galletas de Amaranto", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 6, productId: 2, name: "Galletas de Mezquite", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 7, productId: 2, name: "Galletas de Chocolate", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 8, productId: 2, name: "Galletas de Vainilla", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 9, productId: 3, name: "Frijol Negro", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5 },
      { id: 10, productId: 3, name: "Frijol Bayo", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5 },
      { id: 11, productId: 4, name: "Sustituto de Café", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/coffee.webp" },
    ]
  });
  console.log('  Variantes de producto');

  
  // 5. MATERIAS PRIMAS
  
  await prisma.rawMaterial.createMany({
    data: [
      { id: 1, code: "MP001", name: "Vaina de Mezquite", defaultUnitId: 1, imageUrl: "/raw/vaina-mezquite.webp" },
      { id: 2, code: "MP002", name: "Harina de Mezquite (materia prima)", defaultUnitId: 1, imageUrl: "/raw/harina-mezquite.jpg" },
      { id: 3, code: "MP003", name: "Maíz Negro", defaultUnitId: 1, imageUrl: "/raw/maiz-negro.jpg" },
      { id: 4, code: "MP004", name: "Maíz Amarillo", defaultUnitId: 1, imageUrl: "/raw/maiz-amarillo.jpg" },
      { id: 5, code: "MP005", name: "Frijol Negro (materia prima)", defaultUnitId: 1, imageUrl: "/raw/frijol-negro.jpg" },
      { id: 6, code: "MP006", name: "Amaranto", defaultUnitId: 1 },
      { id: 7, code: "MP007", name: "Azúcar", defaultUnitId: 1 },
      { id: 8, code: "MP008", name: "Manteca vegetal", defaultUnitId: 1 },
    ]
  });
  console.log('  Materias primas');

  console.log(`Seeding minimum data completed!`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
