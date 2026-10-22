import { PrismaClient, ProcessStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding processes...`)

  
  // PLANTILLAS DE PROCESO (ProcessTemplate)
  
  const templates = await prisma.processTemplate.createMany({
    data: [
      { id: 1, productVariantId: 1, version: 1, name: "Producción Harina de Mezquite" },
      { id: 2, productVariantId: 11, version: 1, name: "Producción Sustituto de Café" },
      { id: 3, productVariantId: 5, version: 1, name: "Producción Galletas de Amaranto" },
      { id: 4, productVariantId: 3, version: 1, name: "Producción Harina de Maíz" },
      { id: 5, productVariantId: 9, version: 1, name: "Producción Frijol Negro" },
      { id: 6, productVariantId: 6, version: 1, name: "Producción Galletas de Mezquite" },
    ]
  });
  console.log('  Plantillas de proceso creadas');

  
  // PASOS DE PLANTILLA (TemplateStep)
  

  // Harina de Mezquite (17 pasos)
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

  // Sustituto de Café (15 pasos)
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

  // Galletas de Amaranto (3 pasos)
  await prisma.templateStep.createMany({
    data: [
      { id: 33, processTemplateId: 3, position: 1, name: "Molienda y tamizado", idealDurationMin: 45, requiresInput: true, instructions: "Moler y tamizar el amaranto." },
      { id: 34, processTemplateId: 3, position: 2, name: "Lavado y secado", idealDurationMin: 45, requiresInput: false, instructions: "Lavar y secar los ingredientes." },
      { id: 35, processTemplateId: 3, position: 3, name: "Envasado", idealDurationMin: 60, requiresInput: false, instructions: "Envasar las galletas de amaranto." },
    ]
  });

  // Harina de Maíz (2 pasos)
  await prisma.templateStep.createMany({
    data: [
      { id: 36, processTemplateId: 4, position: 1, name: "Lavado", idealDurationMin: 90, requiresInput: true, instructions: "Lavar el maíz para eliminar impurezas." },
      { id: 37, processTemplateId: 4, position: 2, name: "Secado", idealDurationMin: 90, requiresInput: false, instructions: "Secar el maíz en condiciones controladas." },
    ]
  });

  // Frijol Negro (2 pasos)
  await prisma.templateStep.createMany({
    data: [
      { id: 38, processTemplateId: 5, position: 1, name: "Clasificación", idealDurationMin: 60, requiresInput: true, instructions: "Clasificar el frijol por calidad." },
      { id: 39, processTemplateId: 5, position: 2, name: "Embolsado de 5kg", idealDurationMin: 90, requiresInput: false, instructions: "Embolsar el frijol en presentaciones de 5kg." },
    ]
  });

  // Galletas de Mezquite (3 pasos)
  await prisma.templateStep.createMany({
    data: [
      { id: 40, processTemplateId: 6, position: 1, name: "Preparación de la mezcla", idealDurationMin: 60, requiresInput: true, instructions: "Preparar la mezcla para las galletas." },
      { id: 41, processTemplateId: 6, position: 2, name: "Horneado", idealDurationMin: 90, requiresInput: false, instructions: "Hornear las galletas de mezquite." },
      { id: 42, processTemplateId: 6, position: 3, name: "Decoración", idealDurationMin: 60, requiresInput: false, instructions: "Decorar las galletas terminadas." },
    ]
  });
  console.log('  Pasos de plantilla creados');

  
  // MATERIALES REQUERIDOS POR PASO (StepRequiredMaterial)
  
  await prisma.stepRequiredMaterial.createMany({
    data: [
      { id: 1, templateStepId: 1, rawMaterialId: 1, qtyPerUnitOutput: 2.0, unitId: 1 },
      { id: 2, templateStepId: 18, rawMaterialId: 1, qtyPerUnitOutput: 1.5, unitId: 1 },
      { id: 3, templateStepId: 33, rawMaterialId: 6, qtyPerUnitOutput: 0.5, unitId: 1 },
      { id: 4, templateStepId: 40, rawMaterialId: 2, qtyPerUnitOutput: 0.3, unitId: 1 },
    ]
  });
  console.log('  Materiales requeridos creados');

  // ==========================================
  // CORRIDAS DE PRODUCCIÓN Y PAUSAS (ProcessRun & ProcessPause)
  // ==========================================
  console.log('  Creando corridas de producción con métricas de prueba...');

  const now = new Date();
  const dayAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 1. HARINA DE MEZQUITE (ProductVariant 1, Template 1)
  // 7 Corridas: Gran rango (180 a 600 min), Mediana (240) != Promedio (293.6)
  const mezquiteRuns = [
    // [GrossMin, PauseMin, DaysAgo] -> Net duration
    { gross: 180, pause: 0, days: 2 },  // Net: 180 min (7d, 30d, 90d)
    { gross: 210, pause: 30, days: 3 }, // Net: 180 min (7d, 30d, 90d)
    { gross: 240, pause: 15, days: 5 }, // Net: 225 min (7d, 30d, 90d)
    { gross: 260, pause: 20, days: 12 },// Net: 240 min (30d, 90d)
    { gross: 310, pause: 40, days: 18 },// Net: 270 min (30d, 90d)
    { gross: 420, pause: 60, days: 25 },// Net: 360 min (30d, 90d)
    { gross: 680, pause: 80, days: 50 },// Net: 600 min (90d, todo) -> Runaway batch
  ];

  for (let i = 0; i < mezquiteRuns.length; i++) {
    const { gross, pause, days } = mezquiteRuns[i];
    const finishTime = dayAgo(days);
    const startTime = new Date(finishTime.getTime() - gross * 60 * 1000);

    await prisma.processRun.create({
      data: {
        productVariantId: 1,
        processTemplateId: 1,
        batchCode: `LOTE-MEZQUITE-${i + 1}-${Date.now()}`,
        status: ProcessStatus.COMPLETED,
        startedAt: startTime,
        finishedAt: finishTime,
        goodOutputQty: 50,
        ...(pause > 0
          ? {
              processPauses: {
                create: [
                  {
                    startedAt: new Date(startTime.getTime() + 20 * 60 * 1000),
                    endedAt: new Date(startTime.getTime() + (20 + pause) * 60 * 1000),
                    reason: "Mantenimiento / Limpieza",
                  },
                ],
              },
            }
          : {}),
      },
    });
  }

  // 2. SUSTITUTO DE CAFÉ (ProductVariant 11, Template 2)
  // 2 Corridas: Muestra limitada (N = 2 < 3)
  const cafeRuns = [
    { gross: 150, pause: 10, days: 4 }, // Net: 140 min
    { gross: 230, pause: 20, days: 10 },// Net: 210 min
  ];

  for (let i = 0; i < cafeRuns.length; i++) {
    const { gross, pause, days } = cafeRuns[i];
    const finishTime = dayAgo(days);
    const startTime = new Date(finishTime.getTime() - gross * 60 * 1000);

    await prisma.processRun.create({
      data: {
        productVariantId: 11,
        processTemplateId: 2,
        batchCode: `LOTE-CAFE-${i + 1}-${Date.now()}`,
        status: ProcessStatus.COMPLETED,
        startedAt: startTime,
        finishedAt: finishTime,
        goodOutputQty: 30,
        processPauses: {
          create: [
            {
              startedAt: new Date(startTime.getTime() + 15 * 60 * 1000),
              endedAt: new Date(startTime.getTime() + (15 + pause) * 60 * 1000),
              reason: "Espera de tostadora",
            },
          ],
        },
      },
    });
  }

  // 3. GALLETAS DE AMARANTO (ProductVariant 5, Template 3)
  // 4 Corridas: Duraciones moderadas (80 a 170 min)
  const galletasRuns = [
    { gross: 90, pause: 10, days: 1 },  // Net: 80 min
    { gross: 110, pause: 15, days: 4 }, // Net: 95 min
    { gross: 125, pause: 5, days: 8 },  // Net: 120 min
    { gross: 200, pause: 30, days: 16 },// Net: 170 min
  ];

  for (let i = 0; i < galletasRuns.length; i++) {
    const { gross, pause, days } = galletasRuns[i];
    const finishTime = dayAgo(days);
    const startTime = new Date(finishTime.getTime() - gross * 60 * 1000);

    await prisma.processRun.create({
      data: {
        productVariantId: 5,
        processTemplateId: 3,
        batchCode: `LOTE-GALLETA-${i + 1}-${Date.now()}`,
        status: ProcessStatus.COMPLETED,
        startedAt: startTime,
        finishedAt: finishTime,
        goodOutputQty: 100,
      },
    });
  }

  // 4. CORRIDAS INVÁLIDAS / CORRUPTAS (Prueba de Reglas de Exclusión)

  // Invalida 1: Timestamp invertido / duración negativa (finishedAt < startedAt) -> DEBE EXCLUIRSE
  await prisma.processRun.create({
    data: {
      productVariantId: 1,
      processTemplateId: 1,
      batchCode: `INVALIDA-NEGATIVA-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: new Date(),
      finishedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 min en el pasado
    },
  });

  // Invalida 2: Duración sub-minuto (< 1 min, click accidental) -> DEBE EXCLUIRSE
  const clickStart = dayAgo(3);
  await prisma.processRun.create({
    data: {
      productVariantId: 1,
      processTemplateId: 1,
      batchCode: `INVALIDA-SUBMINUTO-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: clickStart,
      finishedAt: new Date(clickStart.getTime() + 15 * 1000), // 15 segundos
    },
  });

  // Invalida 3: Pausa mayor que la duración total de la corrida -> DEBE EXCLUIRSE
  const corruptStart = dayAgo(4);
  const corruptEnd = new Date(corruptStart.getTime() + 30 * 60 * 1000); // 30 min bruta
  await prisma.processRun.create({
    data: {
      productVariantId: 11,
      processTemplateId: 2,
      batchCode: `INVALIDA-PAUSA-CORRUPTA-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: corruptStart,
      finishedAt: corruptEnd,
      processPauses: {
        create: [
          {
            startedAt: corruptStart,
            endedAt: new Date(corruptStart.getTime() + 60 * 60 * 1000), // 60 min de pausa (> 30 min)
            reason: "Pausa corrupta",
          },
        ],
      },
    },
  });

  console.log('  Corridas de producción creadas exitosamente.');
  console.log(`Seeding processes completed!`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
