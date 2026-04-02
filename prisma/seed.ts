import {
  PrismaClient,
  ProcessStatus,
  StepStatus,
  ItemType,
  MovementDirection,
  MovementReason,
  DeliveryVariant,
  OrderStatus
} from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  
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
  console.log('  Unidades')

  
  // 2. CATEGORÍAS DE PRODUCTO
  
  await prisma.productCategory.createMany({
    data: [
      { id: 1, name: "Harina", imageUrl: "/harina.svg" },
      { id: 2, name: "Galletas", imageUrl: "/galletas.svg" },
      { id: 3, name: "Frijol", imageUrl: "/frijol.svg" },
      { id: 4, name: "Sustituto de café", imageUrl: "/cafe.svg" },
    ]
  });
  console.log('  Categorías de producto')

  
  // 3. PRODUCTOS
  
  await prisma.product.createMany({
    data: [
      { id: 1, categoryId: 1, sku: "HAR001", name: "Harina", defaultUnitId: 1 },
      { id: 2, categoryId: 2, sku: "GAL001", name: "Galletas", defaultUnitId: 5 },
      { id: 3, categoryId: 3, sku: "FRI001", name: "Frijol", defaultUnitId: 1 },
      { id: 4, categoryId: 4, sku: "CAF001", name: "Sustituto de café", defaultUnitId: 1 },
    ]
  });
  console.log('  Productos')

  
  // 4. VARIANTES DE PRODUCTO
  
  await prisma.productVariant.createMany({
    data: [
      // Harinas
      { id: 1, productId: 1, name: "Harina de Mezquite", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/mezquite.webp" },
      { id: 2, productId: 1, name: "Harina de Amaranto", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/amaranth.webp" },
      { id: 3, productId: 1, name: "Harina de Maíz", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5 },
      { id: 4, productId: 1, name: "Harina de Plátano verde", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5 },
      // Galletas
      { id: 5, productId: 2, name: "Galletas de Amaranto", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 6, productId: 2, name: "Galletas de Mezquite", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 7, productId: 2, name: "Galletas de Chocolate", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      { id: 8, productId: 2, name: "Galletas de Vainilla", presentation: "500 g", netContent: 500, contentUnitId: 2, defaultUnitId: 5 },
      // Frijol
      { id: 9, productId: 3, name: "Frijol Negro", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5 },
      { id: 10, productId: 3, name: "Frijol Bayo", presentation: "5 kg", netContent: 5, contentUnitId: 1, defaultUnitId: 5 },
      // Café
      { id: 11, productId: 4, name: "Sustituto de Café", presentation: "1 kg", netContent: 1, contentUnitId: 1, defaultUnitId: 5, imageUrl: "/coffee.webp" },
    ]
  });
  console.log('  Variantes de producto')

  
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
  console.log('  Materias primas')

  
  // 6. ROLES
  
  await prisma.role.createMany({
    data: [
      { id: 1, name: "Producción" },
      { id: 2, name: "Administración" },
    ]
  });
  console.log('  Roles')

  
  // 7. TRABAJADORES
  
  await prisma.worker.createMany({
    data: [
      { id: 1, fullName: "Antonio López", roleId: 1, phone: null },
      { id: 2, fullName: "Minerva Cruz", roleId: 1, phone: null },
      { id: 3, fullName: "Petronila Hernández", roleId: 1, phone: null },
      { id: 4, fullName: "Víctor Aragón", roleId: 1, phone: null },
      { id: 5, fullName: "Zoraida Pérez", roleId: 1, phone: null },
    ]
  });
  console.log('  Trabajadores')

  
  // 8. USUARIO ADMINISTRADOR
  
  const adminHash = await bcrypt.hash("Admin123", 10);
  await prisma.authUser.create({
    data: {
      id: 1,
      workerId: 1,
      email: "admin@xuchil.com",
      passwordHash: adminHash,
      isAdmin: true,
    }
  });
  console.log('  Usuario administrador (admin@xuchil.com / Admin123)')

  
  // 9. PLANTILLAS DE PROCESO (ProcessTemplate)
  
  await prisma.processTemplate.createMany({
    data: [
      // Procesos detallados (del mockup api.ts)
      { id: 1, productVariantId: 1, version: 1, name: "Producción Harina de Mezquite" },
      { id: 2, productVariantId: 11, version: 1, name: "Producción Sustituto de Café" },
      // Procesos simplificados (del mockup tableData.ts)
      { id: 3, productVariantId: 5, version: 1, name: "Producción Galletas de Amaranto" },
      { id: 4, productVariantId: 3, version: 1, name: "Producción Harina de Maíz" },
      { id: 5, productVariantId: 9, version: 1, name: "Producción Frijol Negro" },
      { id: 6, productVariantId: 6, version: 1, name: "Producción Galletas de Mezquite" },
    ]
  });
  console.log('  Plantillas de proceso')

  
  // 10. PASOS DE PLANTILLA (TemplateStep)
  

  // --- Harina de Mezquite (17 pasos) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 1, processTemplateId: 1, position: 1, name: "Recepción de materia prima", idealDurationMin: 2, requiresInput: true, instructions: "Verificar y pesar la materia prima recibida." },
      { id: 2, processTemplateId: 1, position: 2, name: "Recepción de ingredientes", idealDurationMin: 2, requiresInput: false, instructions: "Registrar los ingredientes recibidos." },
      { id: 3, processTemplateId: 1, position: 3, name: "Recepción de envase y etiquetas", idealDurationMin: 2, requiresInput: false, instructions: "Verificar la calidad y cantidad de envases y etiquetas." },
      { id: 4, processTemplateId: 1, position: 4, name: "Transporte", idealDurationMin: 5, requiresInput: false, instructions: "Trasladar la materia prima al área de procesamiento." },
      { id: 5, processTemplateId: 1, position: 5, name: "Pesaje de mezquite", idealDurationMin: 5, requiresInput: true, instructions: "Pesar el mezquite para su posterior procesamiento." },
      { id: 6, processTemplateId: 1, position: 6, name: "Limpieza", idealDurationMin: 10, requiresInput: false, instructions: "Limpiar y preparar la materia prima." },
      { id: 7, processTemplateId: 1, position: 7, name: "Lavado", idealDurationMin: 120, requiresInput: false, instructions: "Lavar y enjuagar las vainas de mezquite." },
      { id: 8, processTemplateId: 1, position: 8, name: "Secado", idealDurationMin: 60, requiresInput: false, instructions: "Secar la materia prima en condiciones controladas." },
      { id: 9, processTemplateId: 1, position: 9, name: "Molienda", idealDurationMin: 120, requiresInput: false, instructions: "Moler el mezquite hasta obtener una consistencia fina." },
      { id: 10, processTemplateId: 1, position: 10, name: "Tamizado", idealDurationMin: 90, requiresInput: false, instructions: "Tamizar la harina para eliminar impurezas." },
      { id: 11, processTemplateId: 1, position: 11, name: "Cernido", idealDurationMin: 180, requiresInput: false, instructions: "Cernir manualmente la harina para separarla por consistencias." },
      { id: 12, processTemplateId: 1, position: 12, name: "Almacén", idealDurationMin: 5, requiresInput: false, instructions: "Almacenar la harina en condiciones óptimas." },
      { id: 13, processTemplateId: 1, position: 13, name: "Etiquetado", idealDurationMin: 5, requiresInput: false, instructions: "Etiquetar los productos con la información correspondiente." },
      { id: 14, processTemplateId: 1, position: 14, name: "Envasado", idealDurationMin: 15, requiresInput: false, instructions: "Empaquetar el producto final." },
      { id: 15, processTemplateId: 1, position: 15, name: "Venta", idealDurationMin: 5, requiresInput: false, instructions: "Registrar la venta del producto." },
      { id: 16, processTemplateId: 1, position: 16, name: "Rastreo de mercancía", idealDurationMin: null, requiresInput: false, instructions: "Realizar el seguimiento del envío." },
      { id: 17, processTemplateId: 1, position: 17, name: "Entrega y envío", idealDurationMin: null, requiresInput: false, instructions: "Entregar el producto al cliente o al transportista." },
    ]
  });

  // --- Sustituto de Café (15 pasos) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 18, processTemplateId: 2, position: 1, name: "Recepción de materia prima", idealDurationMin: 2, requiresInput: true, instructions: "Verificar y pesar la materia prima recibida." },
      { id: 19, processTemplateId: 2, position: 2, name: "Recepción de ingredientes", idealDurationMin: 2, requiresInput: false, instructions: "Registrar los ingredientes recibidos." },
      { id: 20, processTemplateId: 2, position: 3, name: "Recepción de envase y etiquetas", idealDurationMin: 2, requiresInput: false, instructions: "Verificar la calidad y cantidad de envases y etiquetas." },
      { id: 21, processTemplateId: 2, position: 4, name: "Transporte", idealDurationMin: 5, requiresInput: false, instructions: "Trasladar la materia prima al área de procesamiento." },
      { id: 22, processTemplateId: 2, position: 5, name: "Pesaje de merma", idealDurationMin: 5, requiresInput: true, instructions: "Pesar la merma a trabajar." },
      { id: 23, processTemplateId: 2, position: 6, name: "Tostado", idealDurationMin: 120, requiresInput: false, instructions: "Tostar la merma de manera uniforme." },
      { id: 24, processTemplateId: 2, position: 7, name: "Molienda", idealDurationMin: 120, requiresInput: false, instructions: "Moler la materia para obtener la consistencia adecuada." },
      { id: 25, processTemplateId: 2, position: 8, name: "Tamizado", idealDurationMin: 90, requiresInput: false, instructions: "Tamizar el producto para eliminar impurezas." },
      { id: 26, processTemplateId: 2, position: 9, name: "Cernido", idealDurationMin: 60, requiresInput: false, instructions: "Cernir manualmente el producto." },
      { id: 27, processTemplateId: 2, position: 10, name: "Almacén", idealDurationMin: 5, requiresInput: false, instructions: "Almacenar el producto terminado." },
      { id: 28, processTemplateId: 2, position: 11, name: "Etiquetado", idealDurationMin: 5, requiresInput: false, instructions: "Etiquetar el producto con la información necesaria." },
      { id: 29, processTemplateId: 2, position: 12, name: "Envasado", idealDurationMin: 15, requiresInput: false, instructions: "Empaquetar el producto final." },
      { id: 30, processTemplateId: 2, position: 13, name: "Venta", idealDurationMin: 5, requiresInput: false, instructions: "Registrar la venta del producto." },
      { id: 31, processTemplateId: 2, position: 14, name: "Rastreo de mercancía", idealDurationMin: null, requiresInput: false, instructions: "Realizar el seguimiento del envío." },
      { id: 32, processTemplateId: 2, position: 15, name: "Entrega y envío", idealDurationMin: null, requiresInput: false, instructions: "Entregar el producto al cliente o transportista." },
    ]
  });

  // --- Galletas de Amaranto (3 pasos, del tableData) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 33, processTemplateId: 3, position: 1, name: "Molienda y tamizado", idealDurationMin: 45, requiresInput: true, instructions: "Moler y tamizar el amaranto." },
      { id: 34, processTemplateId: 3, position: 2, name: "Lavado y secado", idealDurationMin: 45, requiresInput: false, instructions: "Lavar y secar los ingredientes." },
      { id: 35, processTemplateId: 3, position: 3, name: "Envasado", idealDurationMin: 60, requiresInput: false, instructions: "Envasar las galletas de amaranto." },
    ]
  });

  // --- Harina de Maíz (2 pasos, del tableData) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 36, processTemplateId: 4, position: 1, name: "Lavado", idealDurationMin: 90, requiresInput: true, instructions: "Lavar el maíz para eliminar impurezas." },
      { id: 37, processTemplateId: 4, position: 2, name: "Secado", idealDurationMin: 90, requiresInput: false, instructions: "Secar el maíz en condiciones controladas." },
    ]
  });

  // --- Frijol Negro (2 pasos, del tableData) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 38, processTemplateId: 5, position: 1, name: "Clasificación", idealDurationMin: 60, requiresInput: true, instructions: "Clasificar el frijol por calidad." },
      { id: 39, processTemplateId: 5, position: 2, name: "Embolsado de 5kg", idealDurationMin: 90, requiresInput: false, instructions: "Embolsar el frijol en presentaciones de 5kg." },
    ]
  });

  // --- Galletas de Mezquite (3 pasos, del tableData) ---
  await prisma.templateStep.createMany({
    data: [
      { id: 40, processTemplateId: 6, position: 1, name: "Preparación de la mezcla", idealDurationMin: 60, requiresInput: true, instructions: "Preparar la mezcla para las galletas." },
      { id: 41, processTemplateId: 6, position: 2, name: "Horneado", idealDurationMin: 90, requiresInput: false, instructions: "Hornear las galletas de mezquite." },
      { id: 42, processTemplateId: 6, position: 3, name: "Decoración", idealDurationMin: 60, requiresInput: false, instructions: "Decorar las galletas terminadas." },
    ]
  });
  console.log('  Pasos de plantilla')

  
  // 11. MATERIALES REQUERIDOS POR PASO (StepRequiredMaterial)
  
  await prisma.stepRequiredMaterial.createMany({
    data: [
      // Harina de Mezquite - Recepción: Vaina de Mezquite
      { id: 1, templateStepId: 1, rawMaterialId: 1, qtyPerUnitOutput: 2.0, unitId: 1 },
      // Sustituto de Café - Recepción: Vaina de Mezquite (merma)
      { id: 2, templateStepId: 18, rawMaterialId: 1, qtyPerUnitOutput: 1.5, unitId: 1 },
      // Galletas de Amaranto - Molienda: Amaranto
      { id: 3, templateStepId: 33, rawMaterialId: 6, qtyPerUnitOutput: 0.5, unitId: 1 },
      // Galletas de Mezquite - Preparación: Harina de Mezquite MP
      { id: 4, templateStepId: 40, rawMaterialId: 2, qtyPerUnitOutput: 0.3, unitId: 1 },
    ]
  });
  console.log('  Materiales requeridos')

  
  // 12. INVENTARIO - Items
  
  await prisma.inventoryItem.createMany({
    data: [
      // Materias primas
      { id: 1, itemType: ItemType.RAW, rawMaterialId: 1, defaultUnitId: 1 },  // Vaina de Mezquite
      { id: 2, itemType: ItemType.RAW, rawMaterialId: 2, defaultUnitId: 1 },  // Harina de Mezquite MP
      { id: 3, itemType: ItemType.RAW, rawMaterialId: 3, defaultUnitId: 1 },  // Maíz Negro
      { id: 4, itemType: ItemType.RAW, rawMaterialId: 4, defaultUnitId: 1 },  // Maíz Amarillo
      { id: 5, itemType: ItemType.RAW, rawMaterialId: 5, defaultUnitId: 1 },  // Frijol Negro MP
      { id: 6, itemType: ItemType.RAW, rawMaterialId: 6, defaultUnitId: 1 },  // Amaranto
      // Productos terminados
      { id: 7, itemType: ItemType.PRODUCT, productVariantId: 1, defaultUnitId: 5 }, // Harina de Mezquite 5kg
      { id: 8, itemType: ItemType.PRODUCT, productVariantId: 2, defaultUnitId: 5 }, // Harina de Amaranto
      { id: 9, itemType: ItemType.PRODUCT, productVariantId: 11, defaultUnitId: 5 }, // Sustituto de Café
      { id: 10, itemType: ItemType.PRODUCT, productVariantId: 5, defaultUnitId: 5 }, // Galletas de Amaranto
      { id: 11, itemType: ItemType.PRODUCT, productVariantId: 6, defaultUnitId: 5 }, // Galletas de Mezquite
    ]
  });
  console.log('  Items de inventario')

  
  // 13. INVENTARIO - Lotes
  
  await prisma.inventoryLot.createMany({
    data: [
      // Materias primas (stock actual del mockup)
      { id: 1, inventoryItemId: 1, lotCode: "VAINA-2025A", qtyOnHand: 1000, unitId: 1, receivedAt: new Date('2025-01-15T10:00:00Z') },
      { id: 2, inventoryItemId: 2, lotCode: "HMEQ-2025A", qtyOnHand: 500, unitId: 1, receivedAt: new Date('2025-01-20T10:00:00Z') },
      { id: 3, inventoryItemId: 3, lotCode: "MZNEG-2025A", qtyOnHand: 100, unitId: 1, receivedAt: new Date('2025-02-01T10:00:00Z') },
      { id: 4, inventoryItemId: 4, lotCode: "MZAM-2025A", qtyOnHand: 200, unitId: 1, receivedAt: new Date('2025-02-01T10:00:00Z') },
      { id: 5, inventoryItemId: 5, lotCode: "FRJN-2025A", qtyOnHand: 150, unitId: 1, receivedAt: new Date('2025-02-05T10:00:00Z') },
      { id: 6, inventoryItemId: 6, lotCode: "AMAR-2025A", qtyOnHand: 80, unitId: 1, receivedAt: new Date('2025-02-10T10:00:00Z') },
      // Productos terminados
      { id: 7, inventoryItemId: 7, lotCode: "PROD-HMEQ-01", qtyOnHand: 20, unitId: 5, receivedAt: new Date('2025-02-15T14:00:00Z') },
      { id: 8, inventoryItemId: 8, lotCode: "PROD-HAM-01", qtyOnHand: 15, unitId: 5, receivedAt: new Date('2025-02-18T14:00:00Z') },
      { id: 9, inventoryItemId: 9, lotCode: "PROD-CAFE-01", qtyOnHand: 12, unitId: 5, receivedAt: new Date('2025-02-20T14:00:00Z') },
      { id: 10, inventoryItemId: 10, lotCode: "PROD-GAM-01", qtyOnHand: 0, unitId: 5, receivedAt: new Date('2025-02-06T14:00:00Z') },
      { id: 11, inventoryItemId: 11, lotCode: "PROD-GMEQ-01", qtyOnHand: 0, unitId: 5, receivedAt: new Date('2025-02-19T14:00:00Z') },
    ]
  });
  console.log('  Lotes de inventario')

  
  // 14. COLABORADORES INVITADOS
  
  await prisma.guestCollaborator.create({
    data: { id: 1, displayName: "Juan Pérez", contactInfo: null }
  });
  console.log('  Colaboradores invitados')

  
  // 15. PROCESS RUNS (del mockup tableData.ts)
  
  await prisma.processRun.createMany({
    data: [
      // Proceso 143217: Galletas de amaranto - COMPLETADO
      {
        id: 1, productVariantId: 5, processTemplateId: 3, batchCode: "GAM-20250204-A",
        createdByWorkerId: 1, plannedQty: 16.2, plannedUnitId: 1,
        status: ProcessStatus.COMPLETED,
        startedAt: new Date('2025-02-04T10:30:00Z'),
        finishedAt: new Date('2025-02-06T13:00:00Z'),
        goodOutputQty: 15.4, scrapQty: 0.71, outputUnitId: 1,
        notes: "Todo el proceso se realizó correctamente. Se notó ligera merma en el horneado."
      },
      // Proceso 143218: Harina de maíz - COMPLETADO
      {
        id: 2, productVariantId: 3, processTemplateId: 4, batchCode: "HMAZ-20250110-A",
        createdByWorkerId: 3, plannedQty: 25, plannedUnitId: 1,
        status: ProcessStatus.COMPLETED,
        startedAt: new Date('2025-01-10T08:00:00Z'),
        finishedAt: new Date('2025-01-11T11:00:00Z'),
        goodOutputQty: 23, scrapQty: 2, outputUnitId: 1,
        notes: "Buen rendimiento. El secado fue más largo por la humedad."
      },
      // Proceso 143219: Frijol - COMPLETADO
      {
        id: 3, productVariantId: 9, processTemplateId: 5, batchCode: "FRJN-20250215-A",
        createdByWorkerId: 4, plannedQty: 30, plannedUnitId: 1,
        status: ProcessStatus.COMPLETED,
        startedAt: new Date('2025-02-15T09:00:00Z'),
        finishedAt: new Date('2025-02-15T11:30:00Z'),
        goodOutputQty: 29.5, scrapQty: 0.5, outputUnitId: 1,
        notes: "Empacado sin incidentes."
      },
      // Proceso 143220: Sustituto de café - COMPLETADO
      {
        id: 4, productVariantId: 11, processTemplateId: 2, batchCode: "CAFE-20250322-A",
        createdByWorkerId: 3, plannedQty: 12, plannedUnitId: 1,
        status: ProcessStatus.COMPLETED,
        startedAt: new Date('2025-03-22T13:00:00Z'),
        finishedAt: new Date('2025-03-23T10:00:00Z'),
        goodOutputQty: 10.5, scrapQty: 1.5, outputUnitId: 1,
        notes: "La molienda fue más gruesa de lo normal."
      },
      // Proceso 143221: Galletas de mezquite - COMPLETADO
      {
        id: 5, productVariantId: 6, processTemplateId: 6, batchCode: "GMEQ-20250218-A",
        createdByWorkerId: 5, plannedQty: 20, plannedUnitId: 1,
        status: ProcessStatus.COMPLETED,
        startedAt: new Date('2025-02-18T08:30:00Z'),
        finishedAt: new Date('2025-02-19T10:00:00Z'),
        goodOutputQty: 18, scrapQty: 2, outputUnitId: 1,
        notes: "Se realizaron pruebas con nueva receta."
      },
      // Proceso en progreso: Harina de Mezquite
      {
        id: 6, productVariantId: 1, processTemplateId: 1, batchCode: "HMEQ-20250213-A",
        createdByWorkerId: 1, plannedQty: 50, plannedUnitId: 1,
        status: ProcessStatus.IN_PROGRESS,
        startedAt: new Date('2025-02-13T08:00:00Z'),
      },
    ]
  });
  console.log('  Corridas de proceso')

  
  // 16. STEP EXECUTIONS (actividades del tableData)
  
  await prisma.stepExecution.createMany({
    data: [
      // --- Galletas de amaranto (run 1, template 3) ---
      {
        id: 1, processRunId: 1, templateStepId: 33, workerId: 1, status: StepStatus.DONE,
        startedAt: new Date('2025-02-04T10:30:00Z'), finishedAt: new Date('2025-02-04T11:15:00Z'),
        actualDurationMin: 45, inputQty: 16.2, inputUnitId: 1, notes: "Molienda y tamizado completados."
      },
      {
        id: 2, processRunId: 1, templateStepId: 34, workerId: 2, status: StepStatus.DONE,
        startedAt: new Date('2025-02-05T11:15:00Z'), finishedAt: new Date('2025-02-05T12:00:00Z'),
        actualDurationMin: 45, notes: "Lavado y secado completados."
      },
      {
        id: 3, processRunId: 1, templateStepId: 35, workerId: 5, status: StepStatus.DONE,
        startedAt: new Date('2025-02-06T12:00:00Z'), finishedAt: new Date('2025-02-06T13:00:00Z'),
        actualDurationMin: 60, notes: "Envasado completado."
      },

      // --- Harina de maíz (run 2, template 4) ---
      {
        id: 4, processRunId: 2, templateStepId: 36, workerId: 3, status: StepStatus.DONE,
        startedAt: new Date('2025-01-10T08:00:00Z'), finishedAt: new Date('2025-01-10T09:30:00Z'),
        actualDurationMin: 90, inputQty: 25, inputUnitId: 1, notes: "Lavado completado."
      },
      {
        id: 5, processRunId: 2, templateStepId: 37, workerId: 2, status: StepStatus.DONE,
        startedAt: new Date('2025-01-10T09:30:00Z'), finishedAt: new Date('2025-01-10T11:00:00Z'),
        actualDurationMin: 90, notes: "Secado completado. Más largo por la humedad."
      },

      // --- Frijol (run 3, template 5) ---
      {
        id: 6, processRunId: 3, templateStepId: 38, workerId: 4, status: StepStatus.DONE,
        startedAt: new Date('2025-02-15T09:00:00Z'), finishedAt: new Date('2025-02-15T10:00:00Z'),
        actualDurationMin: 60, inputQty: 30, inputUnitId: 1, notes: "Clasificación completada."
      },
      {
        id: 7, processRunId: 3, templateStepId: 39, workerId: 1, status: StepStatus.DONE,
        startedAt: new Date('2025-02-15T10:00:00Z'), finishedAt: new Date('2025-02-15T11:30:00Z'),
        actualDurationMin: 90, notes: "Embolsado de 5kg completado."
      },

      // --- Sustituto de café (run 4, template 2) ---
      {
        id: 8, processRunId: 4, templateStepId: 22, workerId: 3, status: StepStatus.DONE,
        startedAt: new Date('2025-03-22T13:00:00Z'), finishedAt: new Date('2025-03-22T14:00:00Z'),
        actualDurationMin: 60, inputQty: 12, inputUnitId: 1, notes: "Pesaje de merma completado."
      },
      {
        id: 9, processRunId: 4, templateStepId: 29, workerId: 2, status: StepStatus.DONE,
        startedAt: new Date('2025-03-23T09:00:00Z'), finishedAt: new Date('2025-03-23T10:00:00Z'),
        actualDurationMin: 60, notes: "Envasado completado."
      },

      // --- Galletas de mezquite (run 5, template 6) ---
      {
        id: 10, processRunId: 5, templateStepId: 40, workerId: 5, status: StepStatus.DONE,
        startedAt: new Date('2025-02-18T08:30:00Z'), finishedAt: new Date('2025-02-18T09:30:00Z'),
        actualDurationMin: 60, inputQty: 20, inputUnitId: 1, notes: "Mezcla preparada."
      },
      {
        id: 11, processRunId: 5, templateStepId: 41, workerId: 1, status: StepStatus.DONE,
        startedAt: new Date('2025-02-18T10:00:00Z'), finishedAt: new Date('2025-02-18T11:30:00Z'),
        actualDurationMin: 90, notes: "Horneado completado."
      },
      {
        id: 12, processRunId: 5, templateStepId: 42, workerId: 4, status: StepStatus.DONE,
        startedAt: new Date('2025-02-19T09:00:00Z'), finishedAt: new Date('2025-02-19T10:00:00Z'),
        actualDurationMin: 60, notes: "Decoración completada."
      },

      // --- Harina de Mezquite en progreso (run 6, template 1) ---
      {
        id: 13, processRunId: 6, templateStepId: 1, workerId: 1, status: StepStatus.DONE,
        startedAt: new Date('2025-02-13T08:00:00Z'), finishedAt: new Date('2025-02-13T08:10:00Z'),
        actualDurationMin: 10, inputQty: 50, inputUnitId: 1, notes: "Materia prima recibida y pesada."
      },
      {
        id: 14, processRunId: 6, templateStepId: 5, workerId: 1, status: StepStatus.IN_PROGRESS,
        startedAt: new Date('2025-02-13T08:15:00Z'),
        notes: "En proceso de pesaje."
      },
    ]
  });
  console.log('  Ejecuciones de pasos')

  
  // 17. MOVIMIENTOS DE INVENTARIO
  
  await prisma.inventoryMovement.createMany({
    data: [
      // Compras de materia prima
      {
        id: 1, inventoryLotId: 1, direction: MovementDirection.IN, qty: 1000, unitId: 1,
        reason: MovementReason.PURCHASE, movedAt: new Date('2025-01-15T10:00:00Z'),
        note: "Compra de 1000kg de Vaina de Mezquite"
      },
      {
        id: 2, inventoryLotId: 2, direction: MovementDirection.IN, qty: 500, unitId: 1,
        reason: MovementReason.PURCHASE, movedAt: new Date('2025-01-20T10:00:00Z'),
        note: "Recepción de 500kg de Harina de Mezquite"
      },
      {
        id: 3, inventoryLotId: 3, direction: MovementDirection.IN, qty: 100, unitId: 1,
        reason: MovementReason.PURCHASE, movedAt: new Date('2025-02-01T10:00:00Z'),
        note: "Compra de 100kg de Maíz Negro"
      },
      {
        id: 4, inventoryLotId: 4, direction: MovementDirection.IN, qty: 200, unitId: 1,
        reason: MovementReason.PURCHASE, movedAt: new Date('2025-02-01T10:00:00Z'),
        note: "Compra de 200kg de Maíz Amarillo"
      },
      {
        id: 5, inventoryLotId: 5, direction: MovementDirection.IN, qty: 150, unitId: 1,
        reason: MovementReason.PURCHASE, movedAt: new Date('2025-02-05T10:00:00Z'),
        note: "Recepción de 150kg de Frijol Negro"
      },
      // Consumos de producción
      {
        id: 6, inventoryLotId: 3, direction: MovementDirection.OUT, qty: 50, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP, relatedStepExecutionId: 4,
        movedAt: new Date('2025-01-10T09:30:00Z'), note: "Consumo de 50kg de Maíz Negro para Harina de Maíz"
      },
      {
        id: 7, inventoryLotId: 4, direction: MovementDirection.OUT, qty: 80, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP,
        movedAt: new Date('2025-02-09T10:00:00Z'), note: "Consumo de 80kg de Maíz Amarillo"
      },
      {
        id: 8, inventoryLotId: 5, direction: MovementDirection.OUT, qty: 20, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP, relatedStepExecutionId: 6,
        movedAt: new Date('2025-02-15T10:00:00Z'), note: "Consumo de 20kg de Frijol Negro"
      },
      {
        id: 9, inventoryLotId: 2, direction: MovementDirection.OUT, qty: 100, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP,
        movedAt: new Date('2025-02-10T10:00:00Z'), note: "Consumo de 100kg de Harina de Mezquite"
      },
      {
        id: 10, inventoryLotId: 1, direction: MovementDirection.OUT, qty: 200, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP,
        movedAt: new Date('2025-02-08T10:00:00Z'), note: "Consumo de 200kg de Vaina de Mezquite"
      },
      // Producción completada
      {
        id: 11, inventoryLotId: 7, direction: MovementDirection.IN, qty: 20, unitId: 5,
        reason: MovementReason.COMPLETION_RUN, relatedProcessRunId: 6,
        movedAt: new Date('2025-02-15T14:00:00Z'), note: "Producción de 20 unidades de Harina de Mezquite 5kg"
      },
      {
        id: 12, inventoryLotId: 8, direction: MovementDirection.IN, qty: 15, unitId: 5,
        reason: MovementReason.COMPLETION_RUN,
        movedAt: new Date('2025-02-18T14:00:00Z'), note: "Producción de 15 unidades de Harina de Amaranto"
      },
      {
        id: 13, inventoryLotId: 9, direction: MovementDirection.IN, qty: 12, unitId: 5,
        reason: MovementReason.COMPLETION_RUN, relatedProcessRunId: 4,
        movedAt: new Date('2025-03-23T14:00:00Z'), note: "Producción de 12 frascos de Sustituto de Café"
      },
    ]
  });
  console.log('  Movimientos de inventario')

  
  // 18. PEDIDOS (Orders del mockup api.ts)
  
  await prisma.order.createMany({
    data: [
      {
        id: 1, clientName: "Adán Yair Jiménez Santiago",
        addressText: "Blvd. Guadalupe Hinojosa de Murat 1100, 71248 San Raymundo Jalpan, Oax.",
        deliveryDate: new Date('2025-11-01T15:00:00Z'),
        deliveryVariant: DeliveryVariant.PERSONAL,
        status: OrderStatus.SCHEDULED, createdByUserId: 1,
      },
      {
        id: 2, clientName: "Alejandra Cruz Martínez",
        addressText: "3ª Privada de La Gloria s/n, Barrio del Peñasco, 68230 Oaxaca, Oax.",
        deliveryDate: new Date('2025-11-02T15:00:00Z'),
        deliveryVariant: DeliveryVariant.MAIL,
        status: OrderStatus.SCHEDULED, createdByUserId: 1,
      },
      {
        id: 3, clientName: "Luis Fernando Vázquez Ríos",
        addressText: "Blvd. Guadalupe Hinojosa de Murat 1100, 71248 San Raymundo Jalpan, Oax.",
        deliveryDate: new Date('2025-11-20T14:00:00Z'),
        deliveryVariant: DeliveryVariant.CONSIGNMENT,
        status: OrderStatus.DELIVERED, deliveredAt: new Date('2025-11-20T14:30:00Z'),
      },
      {
        id: 4, clientName: "Patricia López Ramos",
        addressText: "Blvd. Guadalupe Hinojosa de Murat 1100, 71248 San Raymundo Jalpan, Oax.",
        deliveryDate: new Date('2025-11-21T15:00:00Z'),
        deliveryVariant: DeliveryVariant.PERSONAL,
        status: OrderStatus.SCHEDULED,
      },
      {
        id: 5, clientName: "José Hernández Canseco",
        addressText: "Blvd. Guadalupe Hinojosa de Murat 1100, 71248 San Raymundo Jalpan, Oax.",
        deliveryDate: new Date('2025-11-21T15:00:00Z'),
        deliveryVariant: DeliveryVariant.CONSIGNMENT,
        status: OrderStatus.SCHEDULED,
      },
    ]
  });
  console.log('  Pedidos')

  
  // 19. ITEMS DE PEDIDO (OrderItem)
  
  await prisma.orderItem.createMany({
    data: [
      // Pedido 1: Harina Mezq + Harina Amar + Sustituto
      { id: 1, orderId: 1, productVariantId: 1, quantity: 20, unitId: 5 },
      { id: 2, orderId: 1, productVariantId: 2, quantity: 15, unitId: 5 },
      { id: 3, orderId: 1, productVariantId: 11, quantity: 12, unitId: 5 },
      // Pedido 2: Harina Mezquite
      { id: 4, orderId: 2, productVariantId: 1, quantity: 20, unitId: 5 },
      // Pedido 3: Harina Mezq + Harina Amar
      { id: 5, orderId: 3, productVariantId: 1, quantity: 20, unitId: 5 },
      { id: 6, orderId: 3, productVariantId: 2, quantity: 15, unitId: 5 },
      // Pedido 4: Harina Amar + Sustituto
      { id: 7, orderId: 4, productVariantId: 2, quantity: 15, unitId: 5 },
      { id: 8, orderId: 4, productVariantId: 11, quantity: 12, unitId: 5 },
      // Pedido 5: Harina Amar + Sustituto
      { id: 9, orderId: 5, productVariantId: 2, quantity: 15, unitId: 5 },
      { id: 10, orderId: 5, productVariantId: 11, quantity: 12, unitId: 5 },
    ]
  });
  console.log('  Items de pedido')

  console.log(`\nSeeding finished!`)
  console.log(`\n  Usuario admin: admin@xuchil.com / Admin123`)
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