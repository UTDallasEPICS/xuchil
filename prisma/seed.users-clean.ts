import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function clearDatabase() {
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
}

async function seedUsersOnly() {
  console.log("Start users-clean seed...");

  await clearDatabase();

  const adminHash = await bcrypt.hash("Admin123", 10);
  const userHash = await bcrypt.hash("User1234", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Administrador Xuchil",
        email: "admin@xuchil.com",
        passwordHash: adminHash,
        isAdmin: true,
        isGuest: false,
      },
      {
        name: "Operador 1",
        email: "operador1@xuchil.com",
        passwordHash: userHash,
        isAdmin: false,
        isGuest: false,
      },
      {
        name: "Operador 2",
        email: "operador2@xuchil.com",
        passwordHash: userHash,
        isAdmin: false,
        isGuest: false,
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
