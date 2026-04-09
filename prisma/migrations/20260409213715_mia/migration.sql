/*
  Warnings:

  - You are about to drop the `AuthUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuestCollaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryLot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepMaterialUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepRequiredMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `defaultUnitId` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `productVariantId` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `inventoryLotId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `relatedProcessRunId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `relatedStepExecutionId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `addressText` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUserId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productVariantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `processRunId` on the `ProcessPause` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `ProcessPause` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ProcessTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ProcessTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `productVariantId` on the `ProcessTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `ProcessTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `defaultUnitId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProductCategory` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ProductCategory` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `RawMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `defaultUnitId` on the `RawMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `RawMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `RawMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `factorToBase` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityChange` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processExecutionId` to the `ProcessPause` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `ProcessTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `RawMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AuthUser_workerId_idx";

-- DropIndex
DROP INDEX "AuthUser_email_key";

-- DropIndex
DROP INDEX "ProcessRun_createdByWorkerId_idx";

-- DropIndex
DROP INDEX "ProcessRun_processTemplateId_idx";

-- DropIndex
DROP INDEX "ProcessRun_productVariantId_idx";

-- DropIndex
DROP INDEX "ProcessRun_batchCode_key";

-- DropIndex
DROP INDEX "ProductVariant_productId_name_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "StepMaterialUsage_stepExecutionId_idx";

-- DropIndex
DROP INDEX "StepParticipant_stepExecutionId_guestId_idx";

-- DropIndex
DROP INDEX "StepParticipant_stepExecutionId_workerId_idx";

-- DropIndex
DROP INDEX "TemplateStep_processTemplateId_position_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuthUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GuestCollaborator";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InventoryLot";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProcessRun";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductVariant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Role";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepExecution";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepMaterialUsage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepParticipant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepRequiredMaterial";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TemplateStep";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Worker";
PRAGMA foreign_keys=on;

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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemType" TEXT NOT NULL,
    "rawMaterialId" INTEGER,
    "productId" INTEGER,
    "quantity" DECIMAL NOT NULL,
    CONSTRAINT "InventoryItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("id", "itemType", "rawMaterialId") SELECT "id", "itemType", "rawMaterialId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_InventoryMovement" (
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
INSERT INTO "new_InventoryMovement" ("id", "movedAt", "note", "reason", "relatedOrderId") SELECT "id", "movedAt", "note", "reason", "relatedOrderId" FROM "InventoryMovement";
DROP TABLE "InventoryMovement";
ALTER TABLE "new_InventoryMovement" RENAME TO "InventoryMovement";
CREATE TABLE "new_Order" (
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
INSERT INTO "new_Order" ("clientName", "consignmentPartner", "deliveredAt", "deliveryDate", "deliveryVariant", "id", "notes", "status") SELECT "clientName", "consignmentPartner", "deliveredAt", "deliveryDate", "deliveryVariant", "id", "notes", "status" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_deliveryVariant_idx" ON "Order"("deliveryVariant");
CREATE TABLE "new_OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" DECIMAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "orderId", "quantity") SELECT "id", "orderId", "quantity" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_ProcessPause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processExecutionId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    CONSTRAINT "ProcessPause_processExecutionId_fkey" FOREIGN KEY ("processExecutionId") REFERENCES "ProcessExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProcessPause" ("endedAt", "id", "startedAt") SELECT "endedAt", "id", "startedAt" FROM "ProcessPause";
DROP TABLE "ProcessPause";
ALTER TABLE "new_ProcessPause" RENAME TO "ProcessPause";
CREATE INDEX "ProcessPause_processExecutionId_idx" ON "ProcessPause"("processExecutionId");
CREATE TABLE "new_ProcessTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "ProcessTemplate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProcessTemplate" ("id", "name") SELECT "id", "name" FROM "ProcessTemplate";
DROP TABLE "ProcessTemplate";
ALTER TABLE "new_ProcessTemplate" RENAME TO "ProcessTemplate";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT,
    "unitId" INTEGER NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "id", "name") SELECT "categoryId", "id", "name" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE TABLE "new_ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT
);
INSERT INTO "new_ProductCategory" ("id", "name") SELECT "id", "name" FROM "ProductCategory";
DROP TABLE "ProductCategory";
ALTER TABLE "new_ProductCategory" RENAME TO "ProductCategory";
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");
CREATE TABLE "new_RawMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "imgUrl" TEXT,
    CONSTRAINT "RawMaterial_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RawMaterial" ("id", "name") SELECT "id", "name" FROM "RawMaterial";
DROP TABLE "RawMaterial";
ALTER TABLE "new_RawMaterial" RENAME TO "RawMaterial";
CREATE UNIQUE INDEX "RawMaterial_name_key" ON "RawMaterial"("name");
CREATE TABLE "new_Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Unit" ("id", "name") SELECT "id", "name" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

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
CREATE INDEX "ProcessStepMaterialUsage_stepExecutionId_idx" ON "ProcessStepMaterialUsage"("stepExecutionId");
