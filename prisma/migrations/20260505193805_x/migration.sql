/*
  Warnings:

  - You are about to drop the column `processExecutionId` on the `ProcessPause` table. All the data in the column will be lost.
  - Added the required column `processStepExecutionId` to the `ProcessPause` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_deliveryVariant_idx";

-- DropIndex
DROP INDEX "Order_status_idx";

-- DropIndex
DROP INDEX "Order_deliveryDate_idx";

-- DropIndex
DROP INDEX "ProcessExecution_processId_idx";

-- DropIndex
DROP INDEX "ProcessStepMaterialUsage_stepExecutionId_idx";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProcessPause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processStepExecutionId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    CONSTRAINT "ProcessPause_processStepExecutionId_fkey" FOREIGN KEY ("processStepExecutionId") REFERENCES "ProcessStepExecution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProcessPause" ("endedAt", "id", "startedAt") SELECT "endedAt", "id", "startedAt" FROM "ProcessPause";
DROP TABLE "ProcessPause";
ALTER TABLE "new_ProcessPause" RENAME TO "ProcessPause";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryLotId_idx" ON "InventoryMovement"("inventoryLotId");

-- CreateIndex
CREATE INDEX "ProcessExecution_status_idx" ON "ProcessExecution"("status");
