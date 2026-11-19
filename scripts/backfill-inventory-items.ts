import prisma from "../src/lib/db";
import { ItemType } from "@prisma/client";

/**
 * Creates missing InventoryItem rows for product variants that don't have one
 * yet, so they appear in the products inventory even with zero stock.
 * Idempotent: skips variants that already have a PRODUCT inventory item.
 */
async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    include: { inventoryItems: true },
  });

  let created = 0;
  for (const variant of variants) {
    if (variant.inventoryItems.length > 0) continue;
    await prisma.inventoryItem.create({
      data: {
        itemType: ItemType.PRODUCT,
        productVariantId: variant.id,
        defaultUnitId: variant.defaultUnitId ?? null,
      },
    });
    created += 1;
  }

  console.log(`Backfill complete. Created ${created} inventory item(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
