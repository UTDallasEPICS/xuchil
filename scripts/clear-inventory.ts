#!/usr/bin/env tsx
/**
 * Script para limpiar el inventario desde la terminal
 * 
 * ADVERTENCIA: Este script eliminará todos los datos de inventario
 * 
 * Uso:
 *   pnpm tsx scripts/clear-inventory.ts
 * 
 * Con confirmación automática (peligroso):
 *   pnpm tsx scripts/clear-inventory.ts --force
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

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

async function clearInventory() {
  console.log('Script de Limpieza de Inventario\n');

  const forceFlag = process.argv.includes('--force');

  if (!forceFlag) {
    console.log('ADVERTENCIA: Esta accion eliminara:');
    console.log('   - Todos los movimientos de inventario');
    console.log('   - Todos los lotes de inventario');
    console.log('   - Todos los items de inventario');
    console.log('\n   Esta accion NO es reversible.\n');

    const confirmation = await question('Estas seguro? Escribe "CONFIRMAR" para continuar: ');

    if (confirmation !== 'CONFIRMAR') {
      console.log('\nOperacion cancelada.');
      process.exit(0);
    }
  }

  try {
    console.log('\nLimpiando inventario...\n');

    
    // 1. Eliminar movimientos de inventario
    const deletedMovements = await prisma.inventoryMovement.deleteMany({});
    console.log(`Eliminados ${deletedMovements.count} movimientos de inventario`);

    // 2. Eliminar usos de materiales en steps
    const deletedMaterialUsages = await prisma.stepMaterialUsage.deleteMany({});
    console.log(`Eliminados ${deletedMaterialUsages.count} usos de materiales`);

    // 3. Eliminar lotes de inventario
    const deletedLots = await prisma.inventoryLot.deleteMany({});
    console.log(`Eliminados ${deletedLots.count} lotes de inventario`);

    // 4. Eliminar items de inventario
    const deletedItems = await prisma.inventoryItem.deleteMany({});
    console.log(`Eliminados ${deletedItems.count} items de inventario`);

    console.log('\nInventario limpiado exitosamente\n');
  } catch (error) {
    console.error('\nError al limpiar inventario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearInventory();
