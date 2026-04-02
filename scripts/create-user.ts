#!/usr/bin/env tsx
/**
 * Script para crear un usuario desde la terminal
 * 
 * Uso:
 *   pnpm tsx scripts/create-user.ts
 * 
 * O con argumentos:
 *   pnpm tsx scripts/create-user.ts --email="user@example.com" --password="MyPass123" --name="Juan Pérez" --role=1 --admin
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

interface UserInput {
  email: string;
  password: string;
  fullName: string;
  roleId?: number;
  phone?: string;
  isAdmin: boolean;
}

// Función para leer entrada de terminal
function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Parse argumentos de línea de comando
function parseArgs(): Partial<UserInput> {
  const args = process.argv.slice(2);
  const parsed: Partial<UserInput> = {};

  args.forEach((arg) => {
    if (arg.startsWith('--email=')) {
      parsed.email = arg.split('=')[1];
    } else if (arg.startsWith('--password=')) {
      parsed.password = arg.split('=')[1];
    } else if (arg.startsWith('--name=')) {
      parsed.fullName = arg.split('=')[1];
    } else if (arg.startsWith('--phone=')) {
      parsed.phone = arg.split('=')[1];
    } else if (arg.startsWith('--role=')) {
      parsed.roleId = parseInt(arg.split('=')[1]);
    } else if (arg === '--admin') {
      parsed.isAdmin = true;
    }
  });

  return parsed;
}

async function createUser() {
  console.log('Script de Creacion de Usuario\n');

  const argsInput = parseArgs();
  
  // Recolectar datos faltantes de forma interactiva
  const email = argsInput.email || await question('Email del usuario: ');
  const password = argsInput.password || await question('Contraseña: ');
  const fullName = argsInput.fullName || await question('Nombre completo: ');
  const phone = argsInput.phone || await question('Telefono (opcional, Enter para saltar): ') || undefined;
  
  let roleId = argsInput.roleId;
  if (!roleId) {
    // Mostrar roles disponibles
    const roles = await prisma.role.findMany();
    console.log('\nRoles disponibles:');
    roles.forEach(role => console.log(`  ${role.id}. ${role.name}`));
    const roleInput = await question('\nID del rol (Enter para ninguno): ');
    roleId = roleInput ? parseInt(roleInput) : undefined;
  }
  
  let isAdmin = argsInput.isAdmin || false;
  if (!argsInput.isAdmin) {
    const adminInput = await question('Es administrador? (s/N): ');
    isAdmin = adminInput.toLowerCase() === 's' || adminInput.toLowerCase() === 'si';
  }

  // Validar email único
  const existingUser = await prisma.authUser.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`\nError: Ya existe un usuario con el email "${email}"`);
    process.exit(1);
  }

  // Crear usuario
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.authUser.create({
      data: {
        email,
        passwordHash: hashedPassword,
        isAdmin,
        worker: {
          create: {
            fullName,
            roleId: roleId || undefined,
            phone: phone || undefined,
          },
        },
      },
      include: {
        worker: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log('\nUsuario creado exitosamente:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.worker?.fullName}`);
    console.log(`   Rol: ${user.worker?.role?.name || 'Sin rol'}`);
    console.log(`   Admin: ${user.isAdmin ? 'Si' : 'No'}`);
    console.log(`   Telefono: ${user.worker?.phone || 'No especificado'}`);
  } catch (error) {
    console.error('\nError al crear usuario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
