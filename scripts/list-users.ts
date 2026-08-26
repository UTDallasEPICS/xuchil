#!/usr/bin/env tsx
/**
 * Script para listar todos los usuarios registrados
 * 
 * Uso:
 *   pnpm tsx scripts/list-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  console.log('Usuarios Registrados\n');

  try {
    const users = await prisma.authUser.findMany({
      include: {
        worker: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (users.length === 0) {
      console.log('No hay usuarios registrados en la base de datos.\n');
      return;
    }

    console.log(`Total: ${users.length} usuario(s)\n`);
    console.log('-'.repeat(80));

    users.forEach((user) => {
      console.log(`\nUsuario #${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.worker?.fullName || 'N/A'}`);
      console.log(`   Rol: ${user.worker?.role?.name || 'Sin rol'}`);
      console.log(`   Admin: ${user.isAdmin ? 'Si' : 'No'}`);
      console.log(`   Telefono: ${user.worker?.phone || 'No especificado'}`);
      console.log(`   Activo: ${user.isActive ? 'Si' : 'No'}`);
      console.log(`   Ultimo login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('es-MX') : 'Nunca'}`);
    });

    console.log('\n' + '-'.repeat(80) + '\n');
  } catch (error) {
    console.error('\nError al listar usuarios:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
