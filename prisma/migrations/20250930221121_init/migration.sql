-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "factorToBase" DECIMAL NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnitId" INTEGER,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "presentation" TEXT,
    "netContent" DECIMAL,
    "contentUnitId" INTEGER,
    "defaultUnitId" INTEGER,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductVariant_contentUnitId_fkey" FOREIGN KEY ("contentUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductVariant_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnitId" INTEGER,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "RawMaterial_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "roleId" INTEGER,
    "phone" TEXT,
    "profilePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Worker_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workerId" INTEGER,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    CONSTRAINT "AuthUser_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productVariantId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    CONSTRAINT "ProcessTemplate_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processTemplateId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "idealDurationMin" INTEGER,
    "requiresInput" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT,
    CONSTRAINT "TemplateStep_processTemplateId_fkey" FOREIGN KEY ("processTemplateId") REFERENCES "ProcessTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepRequiredMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateStepId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "qtyPerUnitOutput" DECIMAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    CONSTRAINT "StepRequiredMaterial_templateStepId_fkey" FOREIGN KEY ("templateStepId") REFERENCES "TemplateStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepRequiredMaterial_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepRequiredMaterial_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productVariantId" INTEGER NOT NULL,
    "processTemplateId" INTEGER NOT NULL,
    "batchCode" TEXT NOT NULL,
    "createdByWorkerId" INTEGER,
    "plannedQty" DECIMAL,
    "plannedUnitId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "goodOutputQty" DECIMAL,
    "scrapQty" DECIMAL,
    "outputUnitId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "ProcessRun_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessRun_processTemplateId_fkey" FOREIGN KEY ("processTemplateId") REFERENCES "ProcessTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcessRun_createdByWorkerId_fkey" FOREIGN KEY ("createdByWorkerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProcessRun_plannedUnitId_fkey" FOREIGN KEY ("plannedUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProcessRun_outputUnitId_fkey" FOREIGN KEY ("outputUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessPause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processRunId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    "reason" TEXT,
    CONSTRAINT "ProcessPause_processRunId_fkey" FOREIGN KEY ("processRunId") REFERENCES "ProcessRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processRunId" INTEGER NOT NULL,
    "templateStepId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "actualDurationMin" INTEGER,
    "inputQty" DECIMAL,
    "inputUnitId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "StepExecution_processRunId_fkey" FOREIGN KEY ("processRunId") REFERENCES "ProcessRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepExecution_templateStepId_fkey" FOREIGN KEY ("templateStepId") REFERENCES "TemplateStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepExecution_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StepExecution_inputUnitId_fkey" FOREIGN KEY ("inputUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepMaterialUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stepExecutionId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "inventoryLotId" INTEGER,
    "qtyUsed" DECIMAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "StepMaterialUsage_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "StepExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepMaterialUsage_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepMaterialUsage_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StepMaterialUsage_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuestCollaborator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "contactInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "StepParticipant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stepExecutionId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "guestId" INTEGER,
    "roleInStep" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    CONSTRAINT "StepParticipant_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "StepExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepParticipant_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StepParticipant_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestCollaborator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemType" TEXT NOT NULL,
    "rawMaterialId" INTEGER,
    "productVariantId" INTEGER,
    "defaultUnitId" INTEGER,
    CONSTRAINT "InventoryItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL,
    "lotCode" TEXT,
    "qtyOnHand" DECIMAL,
    "unitId" INTEGER,
    "receivedAt" DATETIME NOT NULL,
    "expiryAt" DATETIME,
    CONSTRAINT "InventoryLot_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryLot_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryLotId" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "qty" DECIMAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedStepExecutionId" INTEGER,
    "relatedProcessRunId" INTEGER,
    "relatedOrderId" INTEGER,
    "note" TEXT,
    "movedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryMovement_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_relatedStepExecutionId_fkey" FOREIGN KEY ("relatedStepExecutionId") REFERENCES "StepExecution" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_relatedProcessRunId_fkey" FOREIGN KEY ("relatedProcessRunId") REFERENCES "ProcessRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryMovement_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientName" TEXT NOT NULL,
    "addressText" TEXT,
    "deliveryDate" DATETIME NOT NULL,
    "deliveryVariant" TEXT NOT NULL DEFAULT 'MAIL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "deliveredAt" DATETIME,
    "consignmentPartner" TEXT,
    "createdByUserId" INTEGER,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unitId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_name_idx" ON "Product"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_name_key" ON "ProductVariant"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_code_key" ON "RawMaterial"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- CreateIndex
CREATE INDEX "AuthUser_workerId_idx" ON "AuthUser"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTemplate_productVariantId_version_key" ON "ProcessTemplate"("productVariantId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStep_processTemplateId_position_key" ON "TemplateStep"("processTemplateId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessRun_batchCode_key" ON "ProcessRun"("batchCode");

-- CreateIndex
CREATE INDEX "ProcessRun_productVariantId_idx" ON "ProcessRun"("productVariantId");

-- CreateIndex
CREATE INDEX "ProcessRun_processTemplateId_idx" ON "ProcessRun"("processTemplateId");

-- CreateIndex
CREATE INDEX "ProcessRun_createdByWorkerId_idx" ON "ProcessRun"("createdByWorkerId");

-- CreateIndex
CREATE INDEX "ProcessPause_processRunId_idx" ON "ProcessPause"("processRunId");

-- CreateIndex
CREATE INDEX "StepMaterialUsage_stepExecutionId_idx" ON "StepMaterialUsage"("stepExecutionId");

-- CreateIndex
CREATE INDEX "StepParticipant_stepExecutionId_workerId_idx" ON "StepParticipant"("stepExecutionId", "workerId");

-- CreateIndex
CREATE INDEX "StepParticipant_stepExecutionId_guestId_idx" ON "StepParticipant"("stepExecutionId", "guestId");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deliveryVariant_idx" ON "Order"("deliveryVariant");
