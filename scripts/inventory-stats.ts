#!/usr/bin/env tsx
/**
 * Script para ver estadísticas del inventario
 * 
 * Uso:
 *   pnpm tsx scripts/inventory-stats.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inventoryStats() {
  console.log('Estadisticas de Inventario\n');

  try {
    const rawItems = await prisma.inventoryItem.count({ where: { itemType: 'RAW' } });
    const productItems = await prisma.inventoryItem.count({ where: { itemType: 'PRODUCT' } });
    const totalMovements = await prisma.inventoryMovement.count();

    console.log('Items de Inventario:');
    console.log(`   Materias primas: ${rawItems}`);
    console.log(`   Productos: ${productItems}`);
    console.log(`   Total: ${rawItems + productItems}\n`);

    console.log('Movimientos de Inventario:');
    console.log(`   Total: ${totalMovements}\n`);

    const itemsWithStock = await prisma.inventoryItem.findMany({
      where: { quantity: { gt: 0 } },
      include: {
        rawMaterial: true,
        product: true,
      },
    });

    if (itemsWithStock.length > 0) {
      console.log('-'.repeat(80));
      console.log('\nItems con Stock Disponible:\n');

      itemsWithStock.forEach((item) => {
        const name =
          item.itemType === 'RAW'
            ? item.rawMaterial?.name
            : item.product?.name;

        console.log(`\n* ${name} (${item.itemType === 'RAW' ? 'Materia Prima' : 'Producto'})`);
        console.log(`   Cantidad: ${item.quantity.toString()}`);
      });

      console.log('-'.repeat(80) + '\n');
    } else {
      console.log('No hay items con stock disponible.\n');
    }
  } catch (error) {
    console.error('\nError al obtener estadisticas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

inventoryStats();
