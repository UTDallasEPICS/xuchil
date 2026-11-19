import prisma from "@/lib/db";
import { ReservationStatus } from "@prisma/client";

export interface MaterialAvailability {
  rawMaterialId: number;
  name: string;
  defaultUnitId: number | null;
  defaultUnitFactor: number;
  totalOnHandBase: number;
  reservedBase: number;
  availableBase: number;
  availableInDefaultUnit: number;
}

// Small tolerance to absorb floating point noise on stock math.
export const EPS = 1e-9;

const toNumber = (value: unknown): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Computes, per raw material, the total stock on hand, the actively reserved
 * quantity and the available quantity, all normalized to base units via
 * Unit.factorToBase. Pass a list of ids to limit the scope; omit it for all
 * active raw materials.
 */
export async function getRawMaterialAvailability(
  rawMaterialIds?: number[]
): Promise<Map<number, MaterialAvailability>> {
  const materials = await prisma.rawMaterial.findMany({
    where: rawMaterialIds ? { id: { in: rawMaterialIds } } : { isActive: true },
    include: {
      defaultUnit: true,
      inventoryItems: {
        include: { inventoryLots: { include: { unit: true } } },
      },
      materialReservations: {
        where: { status: ReservationStatus.RESERVED },
        include: { unit: true },
      },
    },
  });

  const result = new Map<number, MaterialAvailability>();

  for (const material of materials) {
    let totalOnHandBase = 0;
    for (const item of material.inventoryItems) {
      for (const lot of item.inventoryLots) {
        if (lot.unitId == null) continue;
        const factor = toNumber(lot.unit?.factorToBase ?? 1);
        totalOnHandBase += toNumber(lot.qtyOnHand) * factor;
      }
    }

    let reservedBase = 0;
    for (const reservation of material.materialReservations) {
      const factor = toNumber(reservation.unit?.factorToBase ?? 1);
      reservedBase += toNumber(reservation.qty) * factor;
    }

    const defaultUnitFactor = toNumber(material.defaultUnit?.factorToBase ?? 1);
    const availableBase = totalOnHandBase - reservedBase;

    result.set(material.id, {
      rawMaterialId: material.id,
      name: material.name,
      defaultUnitId: material.defaultUnitId,
      defaultUnitFactor,
      totalOnHandBase,
      reservedBase,
      availableBase,
      availableInDefaultUnit:
        defaultUnitFactor > 0 ? availableBase / defaultUnitFactor : availableBase,
    });
  }

  return result;
}
