-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phoneNo" TEXT
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEndProduct" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "input_weight" REAL,
    "output_weight" REAL,
    "loss_weight" REAL,
    "status" TEXT NOT NULL,
    "start_timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_timestamp" DATETIME,
    "notes" TEXT,
    "worker_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "Task_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Task_worker_id_idx" ON "Task"("worker_id");

-- CreateIndex
CREATE INDEX "Task_product_id_idx" ON "Task"("product_id");
