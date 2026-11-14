import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function clearDatabase() {
  // Delete from dependents to parents to satisfy foreign keys.
  await prisma.$transaction([
    prisma.stepParticipant.deleteMany(),
    prisma.materialReservation.deleteMany(),
    prisma.stepMaterialUsage.deleteMany(),
    prisma.processPause.deleteMany(),
    prisma.stepExecution.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.inventoryLot.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.stepRequiredMaterial.deleteMany(),
    prisma.templateStep.deleteMany(),
    prisma.processRun.deleteMany(),
    prisma.processTemplate.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.authUser.deleteMany(),
    prisma.worker.deleteMany(),
    prisma.role.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.rawMaterial.deleteMany(),
    prisma.unit.deleteMany(),
  ]);
}

async function seedClean() {
  console.log("Start clean seed...");

  await clearDatabase();

  // Units (ids 1-5) are referenced by hardcoded ids across the app.
  await prisma.unit.createMany({
    data: [
      { id: 1, name: "kg", factorToBase: 1 },
      { id: 2, name: "g", factorToBase: 0.001 },
      { id: 3, name: "L", factorToBase: 1 },
      { id: 4, name: "mL", factorToBase: 0.001 },
      { id: 5, name: "unidad", factorToBase: 1 },
    ],
  });

  await prisma.role.createMany({
    data: [
      { id: 1, name: "Produccion" },
      { id: 2, name: "Administracion" },
    ],
  });

  await prisma.worker.create({
    data: { id: 1, fullName: "Administrador Xuchil", roleId: 2, isActive: true },
  });

  const adminHash = await bcrypt.hash("Admin123", 10);
  await prisma.authUser.create({
    data: {
      id: 1,
      workerId: 1,
      email: "admin@xuchil.com",
      passwordHash: adminHash,
      isAdmin: true,
      isActive: true,
    },
  });

  console.log("Clean seed finished.");
  console.log("Admin: admin@xuchil.com / Admin123");
}

seedClean()
  .catch((error) => {
    console.error("Clean seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
