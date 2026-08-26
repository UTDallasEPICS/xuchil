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
    // Contar items por tipo
    const rawItems = await prisma.inventoryItem.count({
      where: { itemType: 'RAW' },
    });

    const productItems = await prisma.inventoryItem.count({
      where: { itemType: 'PRODUCT' },
    });

    const totalLots = await prisma.inventoryLot.count();
    const totalMovements = await prisma.inventoryMovement.count();

    // Movimientos por tipo
    const inMovements = await prisma.inventoryMovement.count({
      where: { direction: 'IN' },
    });

    const outMovements = await prisma.inventoryMovement.count({
      where: { direction: 'OUT' },
    });

    console.log('Items de Inventario:');
    console.log(`   Materias primas: ${rawItems}`);
    console.log(`   Productos: ${productItems}`);
    console.log(`   Total: ${rawItems + productItems}\n`);

    console.log('Lotes de Inventario:');
    console.log(`   Total de lotes: ${totalLots}\n`);

    console.log('Movimientos de Inventario:');
    console.log(`   Entradas (IN): ${inMovements}`);
    console.log(`   Salidas (OUT): ${outMovements}`);
    console.log(`   Total: ${totalMovements}\n`);

    // Detalles de items con stock
    const itemsWithLots = await prisma.inventoryItem.findMany({
      include: {
        rawMaterial: true,
        productVariant: {
          include: {
            product: true,
          },
        },
        inventoryLots: {
          where: {
            qtyOnHand: {
              gt: 0,
            },
          },
          include: {
            unit: true,
          },
        },
      },
    });

    const itemsWithStock = itemsWithLots.filter((item) => item.inventoryLots.length > 0);

    if (itemsWithStock.length > 0) {
      console.log('-'.repeat(80));
      console.log('\nItems con Stock Disponible:\n');

      itemsWithStock.forEach((item) => {
        const name =
          item.itemType === 'RAW'
            ? item.rawMaterial?.name
            : `${item.productVariant?.product?.name} - ${item.productVariant?.name}`;

        console.log(`\n* ${name} (${item.itemType === 'RAW' ? 'Materia Prima' : 'Producto'})`);

        item.inventoryLots.forEach((lot) => {
          console.log(`   Lote: ${lot.lotCode || 'Sin codigo'}`);
          console.log(`   Cantidad: ${lot.qtyOnHand} ${lot.unit?.name || ''}`);
          console.log(`   Recibido: ${new Date(lot.receivedAt).toLocaleDateString('es-MX')}`);
          if (lot.expiryAt) {
            console.log(`   Vence: ${new Date(lot.expiryAt).toLocaleDateString('es-MX')}`);
          }
          console.log('');
        });
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
