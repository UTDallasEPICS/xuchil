-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT,
    "unitId" INTEGER NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "imgUrl" TEXT,
    CONSTRAINT "RawMaterial_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "imgUrl" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isGuest" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ProcessTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "ProcessTemplate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessTemplateStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "idealDurationMin" INTEGER,
    "instructions" TEXT,
    CONSTRAINT "ProcessTemplateStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessTemplateStepMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stepId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    CONSTRAINT "ProcessTemplateStepMaterial_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessTemplateStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessTemplateStepMaterial_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processId" INTEGER NOT NULL,
    "batchCode" TEXT NOT NULL,
    "plannedQuantity" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "outputQuantity" DECIMAL,
    "scrapQuantity" DECIMAL,
    "notes" TEXT,
    CONSTRAINT "ProcessExecution_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ProcessTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessPause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processExecutionId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    CONSTRAINT "ProcessPause_processExecutionId_fkey" FOREIGN KEY ("processExecutionId") REFERENCES "ProcessExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessStepExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processExecutionId" INTEGER NOT NULL,
    "stepId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "actualDurationMin" INTEGER,
    "inputQty" DECIMAL,
    "notes" TEXT,
    CONSTRAINT "ProcessStepExecution_processExecutionId_fkey" FOREIGN KEY ("processExecutionId") REFERENCES "ProcessExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessStepExecution_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessTemplateStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessStepMaterialUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stepExecutionId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "qtyUsed" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ProcessStepMaterialUsage_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "ProcessStepExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessStepMaterialUsage_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessStepWorker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stepExecutionId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    CONSTRAINT "ProcessStepWorker_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "ProcessStepExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessStepWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemType" TEXT NOT NULL,
    "rawMaterialId" INTEGER,
    "productId" INTEGER,
    "quantity" DECIMAL NOT NULL,
    "expiryAt" DATETIME,
    CONSTRAINT "InventoryItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "quantityChange" DECIMAL NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedStepMaterialUsageId" INTEGER,
    "relatedOrderId" INTEGER,
    "note" TEXT,
    "movedAt" DATETIME NOT NULL,
    "processStepExecutionId" INTEGER,
    CONSTRAINT "InventoryMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_relatedStepMaterialUsageId_fkey" FOREIGN KEY ("relatedStepMaterialUsageId") REFERENCES "ProcessStepMaterialUsage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_processStepExecutionId_fkey" FOREIGN KEY ("processStepExecutionId") REFERENCES "ProcessStepExecution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientName" TEXT NOT NULL,
    "address" TEXT,
    "deliveryDate" DATETIME NOT NULL,
    "deliveryVariant" TEXT NOT NULL DEFAULT 'MAIL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "deliveredAt" DATETIME,
    "consignmentPartner" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" DECIMAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_name_key" ON "RawMaterial"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTemplateStep_processId_position_key" ON "ProcessTemplateStep"("processId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessExecution_batchCode_key" ON "ProcessExecution"("batchCode");

-- CreateIndex
CREATE INDEX "ProcessExecution_processId_idx" ON "ProcessExecution"("processId");

-- CreateIndex
CREATE INDEX "ProcessPause_processExecutionId_idx" ON "ProcessPause"("processExecutionId");

-- CreateIndex
CREATE INDEX "ProcessStepMaterialUsage_stepExecutionId_idx" ON "ProcessStepMaterialUsage"("stepExecutionId");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deliveryVariant_idx" ON "Order"("deliveryVariant");
