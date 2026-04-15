import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function clearDatabase() {
  // Delete from dependents to parents to satisfy foreign keys.
  await prisma.$transaction([
    prisma.stepParticipant.deleteMany(),
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
    prisma.guestCollaborator.deleteMany(),
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

async function seedUsersOnly() {
  console.log("Start users-clean seed...");

  await clearDatabase();

  await prisma.role.createMany({
    data: [
      { id: 1, name: "Produccion" },
      { id: 2, name: "Administracion" },
    ],
  });

  await prisma.worker.createMany({
    data: [
      { id: 1, fullName: "Administrador Xuchil", roleId: 2, isActive: true },
      { id: 2, fullName: "Operador 1", roleId: 1, isActive: true },
      { id: 3, fullName: "Operador 2", roleId: 1, isActive: true },
    ],
  });

  const adminHash = await bcrypt.hash("Admin123", 10);
  const userHash = await bcrypt.hash("User1234", 10);

  await prisma.authUser.createMany({
    data: [
      {
        id: 1,
        workerId: 1,
        email: "admin@xuchil.com",
        passwordHash: adminHash,
        isAdmin: true,
        isActive: true,
      },
      {
        id: 2,
        workerId: 2,
        email: "operador1@xuchil.com",
        passwordHash: userHash,
        isAdmin: false,
        isActive: true,
      },
      {
        id: 3,
        workerId: 3,
        email: "operador2@xuchil.com",
        passwordHash: userHash,
        isAdmin: false,
        isActive: true,
      },
    ],
  });

  console.log("Users-clean seed finished.");
  console.log("Admin: admin@xuchil.com / Admin123");
  console.log("Operadores: operador1@xuchil.com / User1234, operador2@xuchil.com / User1234");
}

seedUsersOnly()
  .catch((error) => {
    console.error("Users-clean seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
