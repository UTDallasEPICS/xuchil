CREATE TABLE "process_run" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "product_variant_id" INTEGER NOT NULL,
  "process_template_id" INTEGER NOT NULL,
  "batch_code" TEXT NOT NULL UNIQUE,
  "created_by_worker_id" INTEGER,
  "planned_qty" DECIMAL,
  "planned_unit_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PLANNED' CHECK("status" IN ('PLANNED','STARTED','FINISHED')),
  "started_at" DATETIME,
  "finished_at" DATETIME,
  "good_output_qty" DECIMAL,
  "scrap_qty" DECIMAL,
  "output_unit_id" INTEGER,
  "notes" TEXT
);

CREATE TABLE "process_pause" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "process_run_id" INTEGER NOT NULL,
  "started_at" DATETIME NOT NULL,
  "ended_at" DATETIME,
  "reason" TEXT
);

CREATE TABLE "step_execution" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "process_run_id" INTEGER NOT NULL,
  "template_step_id" INTEGER NOT NULL,
  "worker_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK("status" IN ('PENDING','IN_PROGRESS','DONE')),
  "started_at" DATETIME,
  "finished_at" DATETIME,
  "actual_duration_min" INTEGER,
  "input_qty" DECIMAL,
  "input_unit_id" INTEGER,
  "notes" TEXT
);

CREATE TABLE "step_participant" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "step_execution_id" INTEGER NOT NULL,
  "worker_id" INTEGER,
  "guest_id" INTEGER
);
