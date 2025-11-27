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

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  await prisma.unit.createMany({
    data: [
      {id: 1, name: "kg", factorToBase: 1},
      {id: 2, name: "g", factorToBase: 0.001},
      {id: 3, name: "L", factorToBase: 1},
      {id: 4, name: "mL", factorToBase: 0.001},
      {id: 5, name: "unit", factorToBase: 1},
    ]
  });

  const productCategory = await prisma.productCategory.create({
    data: {id: 1, name: "Baked Goods"},
  });

  await prisma.product.createMany({
    data: [
      {id: 1, categoryId: productCategory.id, sku: "CR001", name: "Croissant", defaultUnitId: 5},
      {id: 2, categoryId: productCategory.id, sku: "BR002", name: "Sourdough Loaf", defaultUnitId: 5},
    ]
  });

  await prisma.productVariant.createMany({
    data: [
      {id: 1, productId: 1, name: "Classic Butter", netContent: 1, contentUnitId: 5, defaultUnitId: 5},
      {id: 2, productId: 2, name: "Standard 500g", netContent: 500, contentUnitId: 2, defaultUnitId: 5},
    ]
  });

  await prisma.rawMaterial.createMany({
    data: [
      {id: 1, code: "RM001", name: "All-Purpose Flour", defaultUnitId: 1},
      {id: 2, code: "RM002", name: "Butter (Unsalted)", defaultUnitId: 1},
    ]
  });

  const role = await prisma.role.create({data: {id: 1, name: "Baker"}});

  await prisma.worker.createMany({
    data: [
      {id: 1, fullName: "Alice (Staff)", roleId: role.id},
      {id: 2, fullName: "Bob (Admin)", roleId: role.id},
    ]
  });

  await prisma.authUser.create({
    data: {id: 1, workerId: 2, email: "admin@corp.com", passwordHash: "$2b$10$zJR.UT7NtHTssmHL5iRqcuv2ShubMmRNpmQgzEgB6ziY098h6Dwka", isAdmin: true}
  });

  const guestCharlie = await prisma.guestCollaborator.create({
    data: {id: 1, displayName: "Charlie (Temp)", contactInfo: "charlie@temp.com"}
  });

  await prisma.inventoryItem.createMany({
    data: [
      // Raw Material Flour
      {id: 1, itemType: ItemType.RAW, rawMaterialId: 1, productVariantId: null, defaultUnitId: 1},
      // Product Variant Croissant
      {id: 2, itemType: ItemType.PRODUCT, rawMaterialId: null, productVariantId: 1, defaultUnitId: 5},
      // Raw Material Butter (Need to manually create the inventory item for butter)
      {id: 3, itemType: ItemType.RAW, rawMaterialId: 2, productVariantId: null, defaultUnitId: 1},
    ]
  });

  await prisma.inventoryLot.createMany({
    data: [
      {
        id: 1, inventoryItemId: 1, lotCode: "FLOUR-A23", qtyOnHand: 500.00,
        unitId: 1, receivedAt: new Date('2025-09-01T10:00:00Z')
      },
      {
        id: 2, inventoryItemId: 3, lotCode: "BUTTER-C45", qtyOnHand: 100.00,
        unitId: 1, receivedAt: new Date('2025-10-10T11:00:00Z'),
        expiryAt: new Date('2026-04-10T00:00:00Z')
      },
      {
        id: 3, inventoryItemId: 2, lotCode: "PROD-20251001-A", qtyOnHand: 0.00,
        unitId: 5, receivedAt: new Date('2025-10-01T14:30:00Z'),
      },
    ]
  });

  const processTemplate = await prisma.processTemplate.create({
    data: {
      id: 1,
      productVariantId: 1,
      version: 1,
      name: "Standard Croissant Production"
    },
  });

  await prisma.templateStep.createMany({
    data: [
      {
        id: 1,
        processTemplateId: processTemplate.id,
        position: 1,
        name: "Dough Mixing",
        idealDurationMin: 60,
        requiresInput: true,
        instructions: "Mix until dough window is clear."
      },
      {id: 2, processTemplateId: processTemplate.id, position: 2, name: "Laminating & Folding", idealDurationMin: 180},
      {id: 3, processTemplateId: processTemplate.id, position: 3, name: "Baking & Cooling", idealDurationMin: 30},
    ]
  });

  await prisma.stepRequiredMaterial.createMany({
    data: [
      {id: 1, templateStepId: 1, rawMaterialId: 1, qtyPerUnitOutput: 0.10, unitId: 1},
      {id: 2, templateStepId: 2, rawMaterialId: 2, qtyPerUnitOutput: 0.05, unitId: 1},
    ]
  });

  await prisma.processRun.createMany({
    data: [
      // RUN 1: Completed Run
      {
        id: 1, productVariantId: 1, processTemplateId: 1, batchCode: "CRO-20251001-A",
        createdByWorkerId: 2, plannedQty: 100.00, plannedUnitId: 5,
        status: ProcessStatus.COMPLETED, startedAt: new Date('2025-10-01T08:00:00Z'),
        finishedAt: new Date('2025-10-01T14:30:00Z'), goodOutputQty: 98.00,
        scrapQty: 2.00, outputUnitId: 5,
      },
      // RUN 2: Cancelled Run
      {
        id: 2, productVariantId: 1, processTemplateId: 1, batchCode: "CRO-20251002-B",
        createdByWorkerId: 1, plannedQty: 50.00, plannedUnitId: 5,
        status: ProcessStatus.CANCELLED, startedAt: new Date('2025-10-02T09:00:00Z'),
        finishedAt: new Date('2025-10-02T10:00:00Z'), notes: "Contamination issue in raw materials, canceled early.",
      },
      // RUN 3: In Progress/Paused Run
      {
        id: 3, productVariantId: 1, processTemplateId: 1, batchCode: "CRO-20251016-C",
        createdByWorkerId: 1, plannedQty: 120.00, plannedUnitId: 5,
        status: ProcessStatus.PAUSED, startedAt: new Date('2025-10-16T10:00:00Z'),
      },
    ]
  });

  await prisma.processPause.createMany({
    data: [
      {
        id: 1,
        processRunId: 3,
        startedAt: new Date('2025-10-16T10:30:00Z'),
        endedAt: null,
        reason: "Equipment calibration check."
      }
    ]
  });

  await prisma.stepExecution.createMany({
    data: [
      // RUN 1 Steps
      {
        id: 1,
        processRunId: 1,
        templateStepId: 1,
        workerId: 1, // Alice
        status: StepStatus.DONE,
        startedAt: new Date('2025-10-01T08:00:00Z'),
        finishedAt: new Date('2025-10-01T08:55:00Z'),
        actualDurationMin: 55,
        inputQty: 10.00,
        inputUnitId: 1,
        notes: "A little sticky, adjusted water slightly.",
      },
      {
        id: 2,
        processRunId: 1,
        templateStepId: 2,
        workerId: 1, // Alice
        status: StepStatus.DONE,
        startedAt: new Date('2025-10-01T09:00:00Z'),
        finishedAt: new Date('2025-10-01T12:00:00Z'),
        actualDurationMin: 180,
        notes: "Perfect folds, stable temp.",
      },
      {
        id: 3,
        processRunId: 1,
        templateStepId: 3,
        workerId: 2, // Bob
        status: StepStatus.DONE,
        startedAt: new Date('2025-10-01T12:00:00Z'),
        finishedAt: new Date('2025-10-01T12:30:00Z'),
        actualDurationMin: 30,
      },
      // RUN 2 Step
      {
        id: 4,
        processRunId: 2,
        templateStepId: 1,
        workerId: 2, // Bob (Responsible)
        status: StepStatus.BLOCKED,
        startedAt: new Date('2025-10-02T09:00:00Z'),
        finishedAt: new Date('2025-10-02T10:00:00Z'),
        actualDurationMin: 60,
        notes: "Halted due to batch cancellation.",
      },
      // RUN 3 Step
      {
        id: 5, processRunId: 3, templateStepId: 1, workerId: 2, // Bob
        status: StepStatus.IN_PROGRESS, startedAt: new Date('2025-10-16T10:00:00Z'),
        inputQty: 12.00, inputUnitId: 1,
        notes: "Started mixing, paused for equipment maintenance."
      },
    ]
  });

  await prisma.stepParticipant.createMany({
    data: [
      {
        id: 1,
        stepExecutionId: 4,
        workerId: 1,
        guestId: null,
        roleInStep: "Helper",
        startedAt: new Date('2025-10-02T09:15:00Z'),
        finishedAt: new Date('2025-10-02T10:00:00Z')
      }, // Alice
      {
        id: 2,
        stepExecutionId: 4,
        workerId: null,
        guestId: guestCharlie.id,
        roleInStep: "Observer",
        startedAt: new Date('2025-10-02T09:30:00Z'),
        finishedAt: new Date('2025-10-02T10:00:00Z')
      }, // Charlie
    ]
  });

  await prisma.stepMaterialUsage.createMany({
    data: [
      {id: 1, stepExecutionId: 1, rawMaterialId: 1, inventoryLotId: 1, qtyUsed: 10.00, unitId: 1}, // Flour
      {id: 2, stepExecutionId: 2, rawMaterialId: 2, inventoryLotId: 2, qtyUsed: 5.00, unitId: 1}, // Butter
    ]
  });

  await prisma.order.createMany({
    data: [
      // Order 1: Scheduled Delivery
      {
        id: 1, clientName: "Jane's Cafe", addressText: "123 Main St, Anytown",
        deliveryDate: new Date('2025-10-17T15:00:00Z'), deliveryVariant: DeliveryVariant.PERSONAL,
        status: OrderStatus.SCHEDULED, createdByUserId: 1, notes: "Requires morning delivery."
      },
      // Order 2: Delivered Consignment
      {
        id: 2, clientName: "City Grocer", addressText: "456 Oak Ave, Bigcity",
        deliveryDate: new Date('2025-09-29T14:00:00Z'), deliveryVariant: DeliveryVariant.CONSIGNMENT,
        status: OrderStatus.DELIVERED, deliveredAt: new Date('2025-09-29T14:30:00Z'),
        consignmentPartner: "Fresh Distribution Inc."
      }
    ]
  });

  await prisma.orderItem.createMany({
    data: [
      {id: 1, orderId: 1, productVariantId: 1, quantity: 20.00, unitId: 5}, // Order 1: Croissant
      {id: 2, orderId: 2, productVariantId: 1, quantity: 50.00, unitId: 5}, // Order 2: Croissant
      {id: 3, orderId: 2, productVariantId: 2, quantity: 10.00, unitId: 5} // Order 2: Sourdough Loaf
    ],
  });

  await prisma.inventoryMovement.createMany({
    data: [
      // Movement 1: Raw Material Consumption (Flour from RUN 1, Step 1)
      {
        id: 1, inventoryLotId: 1, direction: MovementDirection.OUT, qty: 10.00, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP, relatedStepExecutionId: 1,
        movedAt: new Date('2025-10-01T08:55:00Z'), note: "Flour usage for Dough Mixing - CRO-20251001-A"
      },
      // Movement 2: Raw Material Consumption (Butter from RUN 1, Step 2)
      {
        id: 2, inventoryLotId: 2, direction: MovementDirection.OUT, qty: 5.00, unitId: 1,
        reason: MovementReason.CONSUMPTION_STEP, relatedStepExecutionId: 2,
        movedAt: new Date('2025-10-01T12:00:00Z'), note: "Butter usage for Laminating - CRO-20251001-A"
      },
      // Movement 3: Product Completion (Output from RUN 1)
      {
        id: 3, inventoryLotId: 3, direction: MovementDirection.IN, qty: 98.00, unitId: 5,
        reason: MovementReason.COMPLETION_RUN, relatedProcessRunId: 1,
        movedAt: new Date('2025-10-01T14:30:00Z'), note: "Good output for CRO-20251001-A"
      },
      // Movement 4: Raw Material Purchase (Adjustment)
      {
        id: 4, inventoryLotId: 1, direction: MovementDirection.IN, qty: 50.00, unitId: 1,
        reason: MovementReason.PURCHASE,
        movedAt: new Date('2025-10-15T10:00:00Z'), note: "Received new bag of Flour-A23."
      },
      // Movement 5: Product Outbound (Order 2)
      {
        id: 5, inventoryLotId: 3, direction: MovementDirection.OUT, qty: 50.00, unitId: 5,
        reason: MovementReason.OUTBOUND_ORDER, relatedOrderId: 2,
        movedAt: new Date('2025-09-29T14:00:00Z'), note: "Outbound for Order #2 (Croissants)"
      },
    ]
  });

  console.log(`Seeding finished.`)
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