import { PrismaClient, ProcessStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando datos de prueba para la gráfica de ciclos...\n");

  // 1. Ensure Category and Unit exist
  let category = await prisma.productCategory.findFirst({
    where: { name: "Apicultura" },
  });
  if (!category) {
    category = await prisma.productCategory.create({
      data: { name: "Apicultura" },
    });
  }

  let unit = await prisma.unit.findFirst({ where: { name: "Pieza" } });
  if (!unit) {
    unit = await prisma.unit.create({
      data: { name: "Pieza", factorToBase: 1 },
    });
  }

  // 2. Product 1: "Miel Multiflora" -> Will have 3 runs (N = 3, sufficient data)
  let prod1 = await prisma.product.findFirst({ where: { sku: "MIEL-01" } });
  if (!prod1) {
    prod1 = await prisma.product.create({
      data: {
        name: "Miel Multiflora",
        sku: "MIEL-01",
        categoryId: category.id,
        defaultUnitId: unit.id,
      },
    });
  }

  let variant1 = await prisma.productVariant.findFirst({
    where: { productId: prod1.id },
  });
  if (!variant1) {
    variant1 = await prisma.productVariant.create({
      data: {
        productId: prod1.id,
        name: "Miel Multiflora 500g",
        defaultUnitId: unit.id,
      },
    });
  }

  let template1 = await prisma.processTemplate.findFirst({
    where: { productVariantId: variant1.id },
  });
  if (!template1) {
    template1 = await prisma.processTemplate.create({
      data: {
        productVariantId: variant1.id,
        name: "Envasado de Miel",
        version: 1,
      },
    });
  }

  // 3. Product 2: "Jabón de Miel" -> Will have 1 run (N = 1, tests "Muestra limitada")
  let prod2 = await prisma.product.findFirst({ where: { sku: "JAB-01" } });
  if (!prod2) {
    prod2 = await prisma.product.create({
      data: {
        name: "Jabón de Miel",
        sku: "JAB-01",
        categoryId: category.id,
        defaultUnitId: unit.id,
      },
    });
  }

  let variant2 = await prisma.productVariant.findFirst({
    where: { productId: prod2.id },
  });
  if (!variant2) {
    variant2 = await prisma.productVariant.create({
      data: {
        productId: prod2.id,
        name: "Jabón Barra 100g",
        defaultUnitId: unit.id,
      },
    });
  }

  let template2 = await prisma.processTemplate.findFirst({
    where: { productVariantId: variant2.id },
  });
  if (!template2) {
    template2 = await prisma.processTemplate.create({
      data: {
        productVariantId: variant2.id,
        name: "Saponificación",
        version: 1,
      },
    });
  }

  // 4. Product 3: "Extracto de Propóleo" -> 0 runs (N = 0, tests empty state)
  let prod3 = await prisma.product.findFirst({ where: { sku: "PROP-01" } });
  if (!prod3) {
    prod3 = await prisma.product.create({
      data: {
        name: "Extracto de Propóleo",
        sku: "PROP-01",
        categoryId: category.id,
        defaultUnitId: unit.id,
      },
    });
  }

  const now = new Date();
  const dayAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // --- Run A (Miel): 45m Gross, 5m Pause => Net = 40m ---
  const r1Start = new Date(dayAgo(2).getTime() - 45 * 60 * 1000);
  const r1End = dayAgo(2);
  await prisma.processRun.create({
    data: {
      productVariantId: variant1.id,
      processTemplateId: template1.id,
      batchCode: `TEST-MIEL-001-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: r1Start,
      finishedAt: r1End,
      processPauses: {
        create: [
          {
            startedAt: new Date(r1Start.getTime() + 10 * 60 * 1000),
            endedAt: new Date(r1Start.getTime() + 15 * 60 * 1000),
            reason: "Limpieza de tolva",
          },
        ],
      },
    },
  });

  // --- Run B (Miel): 70m Gross, 10m Pause => Net = 60m ---
  const r2Start = new Date(dayAgo(4).getTime() - 70 * 60 * 1000);
  const r2End = dayAgo(4);
  await prisma.processRun.create({
    data: {
      productVariantId: variant1.id,
      processTemplateId: template1.id,
      batchCode: `TEST-MIEL-002-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: r2Start,
      finishedAt: r2End,
      processPauses: {
        create: [
          {
            startedAt: new Date(r2Start.getTime() + 20 * 60 * 1000),
            endedAt: new Date(r2Start.getTime() + 30 * 60 * 1000),
            reason: "Espera de frascos",
          },
        ],
      },
    },
  });

  // --- Run C (Miel): 95m Gross, 15m Pause => Net = 80m ---
  const r3Start = new Date(dayAgo(6).getTime() - 95 * 60 * 1000);
  const r3End = dayAgo(6);
  await prisma.processRun.create({
    data: {
      productVariantId: variant1.id,
      processTemplateId: template1.id,
      batchCode: `TEST-MIEL-003-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: r3Start,
      finishedAt: r3End,
      processPauses: {
        create: [
          {
            startedAt: new Date(r3Start.getTime() + 25 * 60 * 1000),
            endedAt: new Date(r3Start.getTime() + 40 * 60 * 1000),
            reason: "Calibración de balanza",
          },
        ],
      },
    },
  });

  // --- Run D (Jabón): 50m Gross, 0m Pause => Net = 50m (N = 1) ---
  const r4Start = new Date(dayAgo(3).getTime() - 50 * 60 * 1000);
  const r4End = dayAgo(3);
  await prisma.processRun.create({
    data: {
      productVariantId: variant2.id,
      processTemplateId: template2.id,
      batchCode: `TEST-JAB-001-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: r4Start,
      finishedAt: r4End,
    },
  });

  // --- Run E (Invalid - IN_PROGRESS): Must be EXCLUDED ---
  await prisma.processRun.create({
    data: {
      productVariantId: variant1.id,
      processTemplateId: template1.id,
      batchCode: `INVALID-IN-PROGRESS-${Date.now()}`,
      status: ProcessStatus.IN_PROGRESS,
      startedAt: new Date(),
    },
  });

  // --- Run F (Invalid - Corrupted timestamp finishedAt < startedAt): Must be EXCLUDED ---
  await prisma.processRun.create({
    data: {
      productVariantId: variant1.id,
      processTemplateId: template1.id,
      batchCode: `INVALID-TIMING-${Date.now()}`,
      status: ProcessStatus.COMPLETED,
      startedAt: new Date(),
      finishedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  console.log("¡Datos de prueba insertados exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });