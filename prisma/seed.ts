const {
  PrismaClient,
  ProcessStatus,
  StepStatus,
  DeliveryVariant,
  OrderStatus,
  ItemType,
  MovementReason,
} = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // delete in child-to-parent order
  await prisma.inventoryMovement.deleteMany();
  await prisma.processStepWorker.deleteMany();
  await prisma.processStepMaterialUsage.deleteMany();
  await prisma.processPause.deleteMany();
  await prisma.processStepExecution.deleteMany();
  await prisma.processExecution.deleteMany();
  await prisma.processTemplateStepMaterial.deleteMany();
  await prisma.processTemplateStep.deleteMany();
  await prisma.processTemplate.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.unit.deleteMany();

  // units
  const pieceUnit = await prisma.unit.create({
    data: { name: "piece" },
  });

  const kgUnit = await prisma.unit.create({
    data: { name: "kg" },
  });

  const literUnit = await prisma.unit.create({
    data: { name: "liter" },
  });

  // categories
  const breadCategory = await prisma.productCategory.create({
    data: {
      name: "Bread",
      imgUrl: "https://example.com/bread.jpg",
    },
  });

  const drinkCategory = await prisma.productCategory.create({
    data: {
      name: "Drinks",
      imgUrl: "https://example.com/drinks.jpg",
    },
  });

  // products
  const sourdough = await prisma.product.create({
    data: {
      name: "Sourdough Loaf",
      imgUrl: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
      categoryId: breadCategory.id,
      unitId: pieceUnit.id,
    },
  });

  const lemonade = await prisma.product.create({
    data: {
      name: "Lemonade Bottle",
      imgUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e",
      categoryId: drinkCategory.id,
      unitId: pieceUnit.id,
    },
  });

  const baguette = await prisma.product.create({
    data: {
      name: "Baguette",
      imgUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df",
      categoryId: breadCategory.id,
      unitId: pieceUnit.id,
    },
  });

  const dinnerRolls = await prisma.product.create({
    data: {
      name: "Dinner Rolls",
      imgUrl: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
      categoryId: breadCategory.id,
      unitId: pieceUnit.id,
    },
  });

  const orangeJuice = await prisma.product.create({
    data: {
      name: "Orange Juice Bottle",
      imgUrl: "https://images.unsplash.com/photo-1571687949920-6e7c1a9bce64",
      categoryId: drinkCategory.id,
      unitId: pieceUnit.id,
    },
  });

  // raw materials
  const flour = await prisma.rawMaterial.create({
    data: {
      name: "Flour",
      unitId: kgUnit.id,
      imgUrl: "https://example.com/flour.jpg",
    },
  });

  const water = await prisma.rawMaterial.create({
    data: {
      name: "Water",
      unitId: literUnit.id,
      imgUrl: "https://example.com/water.jpg",
    },
  });

  const yeast = await prisma.rawMaterial.create({
    data: {
      name: "Yeast",
      unitId: kgUnit.id,
      imgUrl: "https://example.com/yeast.jpg",
    },
  });

  const salt = await prisma.rawMaterial.create({
    data: {
      name: "Salt",
      unitId: kgUnit.id,
      imgUrl: "https://example.com/salt.jpg",
    },
  });

  const sugar = await prisma.rawMaterial.create({
    data: {
      name: "Sugar",
      unitId: kgUnit.id,
      imgUrl: "https://example.com/sugar.jpg",
    },
  });

  const butter = await prisma.rawMaterial.create({
    data: {
      name: "Butter",
      unitId: kgUnit.id,
      imgUrl: "https://example.com/butter.jpg",
    },
  });

  const milk = await prisma.rawMaterial.create({
    data: {
      name: "Milk",
      unitId: literUnit.id,
      imgUrl: "https://example.com/milk.jpg",
    },
  });

  const eggs = await prisma.rawMaterial.create({
    data: {
      name: "Eggs",
      unitId: pieceUnit.id,
      imgUrl: "https://example.com/eggs.jpg",
    },
  });

  const lemonJuice = await prisma.rawMaterial.create({
    data: {
      name: "Lemon Juice",
      unitId: literUnit.id,
      imgUrl: "https://example.com/lemon-juice.jpg",
    },
  });

  const orangeConcentrate = await prisma.rawMaterial.create({
    data: {
      name: "Orange Concentrate",
      unitId: literUnit.id,
      imgUrl: "https://example.com/orange-concentrate.jpg",
    },
  });

  // users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "1111111111",
      imgUrl: "https://example.com/admin.jpg",
      passwordHash: "hashedpassword",
      isAdmin: true,
      isGuest: false,
    },
  });

  const worker = await prisma.user.create({
    data: {
      name: "Worker One",
      email: "worker@example.com",
      phone: "2222222222",
      imgUrl: "https://example.com/worker.jpg",
      passwordHash: "hashedpassword",
      isAdmin: false,
      isGuest: false,
    },
  });

  // process template
  const breadProcess = await prisma.processTemplate.create({
    data: {
      name: "Basic Bread Process",
      productId: sourdough.id,
    },
  });

  const step1 = await prisma.processTemplateStep.create({
    data: {
      processId: breadProcess.id,
      position: 1,
      name: "Mix Ingredients",
      idealDurationMin: 20,
      instructions: "Mix flour, water, and yeast.",
    },
  });

  const step2 = await prisma.processTemplateStep.create({
    data: {
      processId: breadProcess.id,
      position: 2,
      name: "Bake",
      idealDurationMin: 40,
      instructions: "Bake until golden brown.",
    },
  });

  await prisma.processTemplateStepMaterial.create({
    data: {
      stepId: step1.id,
      rawMaterialId: flour.id,
    },
  });

  await prisma.processTemplateStepMaterial.create({
    data: {
      stepId: step1.id,
      rawMaterialId: water.id,
    },
  });

  await prisma.processTemplateStepMaterial.create({
    data: {
      stepId: step1.id,
      rawMaterialId: yeast.id,
    },
  });

  // inventory items
  const flourInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: flour.id,
      quantity: 100,
      expiryAt: new Date("2026-04-24T10:00:00.000Z"),
    },
  });

  const waterInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: water.id,
      quantity: 200,
      expiryAt: new Date("2026-04-30T10:00:00.000Z"),
    },
  });

  const yeastInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: yeast.id,
      quantity: 25,
      expiryAt: new Date("2026-04-16T09:15:42.000Z"),
    },
  });

  const saltInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: salt.id,
      quantity: 65,
      expiryAt: new Date("2026-05-10T12:00:00.000Z"),
    },
  });

  const sugarInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: sugar.id,
      quantity: 45,
      expiryAt: new Date("2026-04-18T14:23:11.000Z"),
    },
  });

  const butterInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: butter.id,
      quantity: 30,
      expiryAt: new Date("2026-04-14T21:47:05.000Z"),
    },
  });

  const milkInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: milk.id,
      quantity: 80,
      expiryAt: new Date("2026-04-20T08:30:00.000Z"),
    },
  });

  const eggsInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: eggs.id,
      quantity: 48,
      expiryAt: new Date("2026-04-17T03:32:58.000Z"),
    },
  });

  const lemonJuiceInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: lemonJuice.id,
      quantity: 22,
      expiryAt: new Date("2026-04-15T17:06:29.000Z"),
    },
  });

  const orangeConcentrateInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.RAW,
      rawMaterialId: orangeConcentrate.id,
      quantity: 55,
      expiryAt: new Date("2026-04-19T11:20:00.000Z"),
    },
  });

  const breadInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.PRODUCT,
      productId: sourdough.id,
      quantity: 10,
      expiryAt: new Date("2026-04-18T12:00:00.000Z"),
    },
  });

  const lemonadeInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.PRODUCT,
      productId: lemonade.id,
      quantity: 15,
      expiryAt: new Date("2026-04-17T16:00:00.000Z"),
    },
  });

  const baguetteInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.PRODUCT,
      productId: baguette.id,
      quantity: 18,
      expiryAt: new Date("2026-04-16T13:00:00.000Z"),
    },
  });

  const dinnerRollsInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.PRODUCT,
      productId: dinnerRolls.id,
      quantity: 24,
      expiryAt: new Date("2026-04-20T14:00:00.000Z"),
    },
  });

  const orangeJuiceInventory = await prisma.inventoryItem.create({
    data: {
      itemType: ItemType.PRODUCT,
      productId: orangeJuice.id,
      quantity: 12,
      expiryAt: new Date("2026-04-19T15:30:00.000Z"),
    },
  });

  // inventory movements
  await prisma.inventoryMovement.create({
    data: {
      itemId: flourInventory.id,
      quantityChange: 100,
      reason: MovementReason.PURCHASE,
      note: "Initial flour stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: waterInventory.id,
      quantityChange: 200,
      reason: MovementReason.PURCHASE,
      note: "Initial water stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: yeastInventory.id,
      quantityChange: 25,
      reason: MovementReason.PURCHASE,
      note: "Initial yeast stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: sugarInventory.id,
      quantityChange: 45,
      reason: MovementReason.PURCHASE,
      note: "Initial sugar stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: butterInventory.id,
      quantityChange: 30,
      reason: MovementReason.PURCHASE,
      note: "Initial butter stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: breadInventory.id,
      quantityChange: 10,
      reason: MovementReason.COMPLETION_RUN,
      note: "Initial bread stock",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: lemonadeInventory.id,
      quantityChange: 15,
      reason: MovementReason.COMPLETION_RUN,
      note: "Initial lemonade stock",
      movedAt: new Date(),
    },
  });

  // process execution
  const processExecution = await prisma.processExecution.create({
    data: {
      processId: breadProcess.id,
      batchCode: "BATCH-001",
      plannedQuantity: 20,
      status: ProcessStatus.IN_PROGRESS,
      startedAt: new Date(),
      notes: "First batch",
    },
  });

  const stepExecution1 = await prisma.processStepExecution.create({
    data: {
      processExecutionId: processExecution.id,
      stepId: step1.id,
      status: StepStatus.DONE,
      startedAt: new Date(),
      finishedAt: new Date(),
      actualDurationMin: 18,
      inputQty: 20,
      notes: "Mixing complete",
    },
  });

  const stepExecution2 = await prisma.processStepExecution.create({
    data: {
      processExecutionId: processExecution.id,
      stepId: step2.id,
      status: StepStatus.IN_PROGRESS,
      startedAt: new Date(),
      notes: "Currently baking",
    },
  });

  await prisma.processStepWorker.create({
    data: {
      stepExecutionId: stepExecution1.id,
      workerId: worker.id,
    },
  });

  const flourUsage = await prisma.processStepMaterialUsage.create({
    data: {
      stepExecutionId: stepExecution1.id,
      rawMaterialId: flour.id,
      qtyUsed: 5,
      notes: "Used for dough",
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: flourInventory.id,
      quantityChange: -5,
      reason: MovementReason.CONSUMPTION_STEP,
      relatedStepMaterialUsageId: flourUsage.id,
      processStepExecutionId: stepExecution1.id,
      note: "Flour used in batch",
      movedAt: new Date(),
    },
  });

  // orders
  const order1 = await prisma.order.create({
    data: {
      clientName: "Sample Customer",
      address: "123 Main St",
      deliveryDate: new Date("2026-04-15T10:00:00.000Z"),
      deliveryVariant: DeliveryVariant.MAIL,
      status: OrderStatus.SCHEDULED,
      notes: "Test order",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      clientName: "North Market",
      address: "45 Oak Ave",
      deliveryDate: new Date("2026-04-15T09:00:00.000Z"),
      deliveryVariant: DeliveryVariant.PERSONAL,
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-15T12:30:00.000Z"),
      notes: "Morning delivery",
    },
  });

  const order3 = await prisma.order.create({
    data: {
      clientName: "Cafe Luna",
      address: "88 River Rd",
      deliveryDate: new Date("2026-04-14T08:00:00.000Z"),
      deliveryVariant: DeliveryVariant.CONSIGNMENT,
      consignmentPartner: "FastDrop",
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-15T14:15:00.000Z"),
      notes: "Weekly restock",
    },
  });

  const order4 = await prisma.order.create({
    data: {
      clientName: "City Deli",
      address: "200 Pine St",
      deliveryDate: new Date("2026-04-14T11:00:00.000Z"),
      deliveryVariant: DeliveryVariant.MAIL,
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-13T16:45:00.000Z"),
      notes: "Large bread order",
    },
  });

  const order5 = await prisma.order.create({
    data: {
      clientName: "Fresh Table",
      address: "17 Maple Dr",
      deliveryDate: new Date("2026-04-12T10:30:00.000Z"),
      deliveryVariant: DeliveryVariant.PERSONAL,
      status: OrderStatus.CANCELLED,
      notes: "Customer cancelled",
    },
  });

  const order6 = await prisma.order.create({
    data: {
      clientName: "Bistro Seven",
      address: "901 Elm St",
      deliveryDate: new Date("2026-04-11T09:45:00.000Z"),
      deliveryVariant: DeliveryVariant.MAIL,
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-13T13:20:00.000Z"),
      notes: "Weekend order",
    },
  });

  const order7 = await prisma.order.create({
    data: {
      clientName: "Corner Shop",
      address: "320 Cedar Ln",
      deliveryDate: new Date("2026-04-10T08:20:00.000Z"),
      deliveryVariant: DeliveryVariant.MAIL,
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-11T15:00:00.000Z"),
      notes: "Bread and drinks",
    },
  });

  const order8 = await prisma.order.create({
    data: {
      clientName: "Harbor Cafe",
      address: "12 Coast Blvd",
      deliveryDate: new Date("2026-04-09T07:50:00.000Z"),
      deliveryVariant: DeliveryVariant.CONSIGNMENT,
      consignmentPartner: "QuickRoute",
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date("2026-04-09T11:40:00.000Z"),
      notes: "Cafe supply order",
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: sourdough.id,
      quantity: 2,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: sourdough.id,
      quantity: 4,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: lemonade.id,
      quantity: 3,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: baguette.id,
      quantity: 6,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: dinnerRolls.id,
      quantity: 5,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: sourdough.id,
      quantity: 8,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: orangeJuice.id,
      quantity: 4,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order5.id,
      productId: lemonade.id,
      quantity: 2,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order6.id,
      productId: dinnerRolls.id,
      quantity: 7,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order6.id,
      productId: sourdough.id,
      quantity: 3,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order7.id,
      productId: baguette.id,
      quantity: 5,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order7.id,
      productId: lemonade.id,
      quantity: 6,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order8.id,
      productId: orangeJuice.id,
      quantity: 5,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order8.id,
      productId: dinnerRolls.id,
      quantity: 4,
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: breadInventory.id,
      quantityChange: -2,
      reason: MovementReason.OUTBOUND_ORDER,
      relatedOrderId: order1.id,
      note: "Bread sent for order",
      movedAt: new Date(),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: breadInventory.id,
      quantityChange: -4,
      reason: MovementReason.OUTBOUND_ORDER,
      relatedOrderId: order2.id,
      note: "Bread sent for delivered order",
      movedAt: new Date("2026-04-15T12:30:00.000Z"),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: lemonadeInventory.id,
      quantityChange: -3,
      reason: MovementReason.OUTBOUND_ORDER,
      relatedOrderId: order2.id,
      note: "Lemonade sent for delivered order",
      movedAt: new Date("2026-04-15T12:30:00.000Z"),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: baguetteInventory.id,
      quantityChange: -6,
      reason: MovementReason.OUTBOUND_ORDER,
      relatedOrderId: order3.id,
      note: "Baguette sent for delivered order",
      movedAt: new Date("2026-04-14T14:15:00.000Z"),
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      itemId: dinnerRollsInventory.id,
      quantityChange: -5,
      reason: MovementReason.OUTBOUND_ORDER,
      relatedOrderId: order3.id,
      note: "Dinner rolls sent for delivered order",
      movedAt: new Date("2026-04-14T14:15:00.000Z"),
    },
  });

  console.log("Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });