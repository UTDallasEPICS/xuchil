import {
  Prisma,
  ItemType,
  MovementDirection,
  MovementReason,
  ReservationStatus,
} from "@prisma/client";
import { EPS } from "@/lib/availability";

export class InsufficientStockError extends Error {
  rawMaterialId: number;
  neededBase: number;
  availableBase: number;

  constructor(rawMaterialId: number, neededBase: number, availableBase: number) {
    super(`Materia prima ${rawMaterialId}: se requieren ${neededBase} (base) pero hay ${availableBase} disponibles.`);
    this.name = "InsufficientStockError";
    this.rawMaterialId = rawMaterialId;
    this.neededBase = neededBase;
    this.availableBase = availableBase;
  }
}

export interface ActualUsage {
  qty: number;
  unitId: number;
}

const toNumber = (value: unknown): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Consumes the raw materials reserved for a given step execution, drawing them
 * FIFO across inventory lots and flipping the reservations to CONSUMED.
 *
 * - Quantity defaults to what was reserved; pass `actualByMaterial` (keyed by
 *   rawMaterialId) to adjust per step. Using less frees the difference (the
 *   reservation stops counting as reserved); using more is validated against the
 *   quantity still free after honoring other active reservations.
 * - Only RESERVED reservations are touched, so resuming a paused step never
 *   double-consumes.
 */
export async function consumeForStep(
  tx: Prisma.TransactionClient,
  params: {
    stepExecutionId: number;
    processRunId: number;
    templateStepId: number;
    now: Date;
    actualByMaterial?: Map<number, ActualUsage>;
  }
): Promise<void> {
  const { stepExecutionId, processRunId, templateStepId, now, actualByMaterial } = params;

  const reservations = await tx.materialReservation.findMany({
    where: { processRunId, templateStepId, status: ReservationStatus.RESERVED },
    include: { unit: true },
  });
  if (reservations.length === 0) return;

  const units = await tx.unit.findMany({ select: { id: true, factorToBase: true } });
  const factorByUnit = new Map<number, number>(units.map((u) => [u.id, toNumber(u.factorToBase)]));
  const factorOf = (unitId: number | null | undefined) =>
    unitId != null ? factorByUnit.get(unitId) ?? 1 : 1;

  for (const reservation of reservations) {
    const rawMaterialId = reservation.rawMaterialId;
    const reservedBase = toNumber(reservation.qty) * factorOf(reservation.unitId);

    // Determine how much to consume (in base units) and in the reservation unit.
    const actual = actualByMaterial?.get(rawMaterialId);
    let consumeBase = reservedBase;
    let consumedQtyInResUnit = toNumber(reservation.qty);
    if (actual) {
      consumeBase = actual.qty * factorOf(actual.unitId);
      const resFactor = factorOf(reservation.unitId);
      consumedQtyInResUnit = resFactor > 0 ? consumeBase / resFactor : actual.qty;
    }

    // Inventory items + lots for this raw material.
    const items = await tx.inventoryItem.findMany({
      where: { itemType: ItemType.RAW, rawMaterialId },
      select: { id: true },
    });
    const itemIds = items.map((i) => i.id);
    const lots = await tx.inventoryLot.findMany({
      where: { inventoryItemId: { in: itemIds }, qtyOnHand: { gt: 0 } },
      include: { unit: true },
      orderBy: [{ receivedAt: "asc" }, { id: "asc" }],
    });

    const onHandBase = lots.reduce(
      (sum, lot) => sum + toNumber(lot.qtyOnHand) * factorOf(lot.unitId),
      0
    );

    // Protect material reserved by other reservations (other runs / other steps
    // of this run) that are not the one being consumed now.
    const otherReserved = await tx.materialReservation.findMany({
      where: {
        rawMaterialId,
        status: ReservationStatus.RESERVED,
        id: { not: reservation.id },
      },
      include: { unit: true },
    });
    const protectedBase = otherReserved.reduce(
      (sum, r) => sum + toNumber(r.qty) * factorOf(r.unitId),
      0
    );

    const freeBase = onHandBase - protectedBase;
    if (consumeBase > freeBase + EPS) {
      throw new InsufficientStockError(rawMaterialId, consumeBase, freeBase);
    }

    // Draw FIFO across lots.
    let remaining = consumeBase;
    for (const lot of lots) {
      if (remaining <= EPS) break;
      if (lot.unitId == null) continue;
      const lotFactor = factorOf(lot.unitId);
      const lotBase = toNumber(lot.qtyOnHand) * lotFactor;
      if (lotBase <= 0) continue;
      const drawBase = Math.min(lotBase, remaining);
      const drawLotUnit = lotFactor > 0 ? drawBase / lotFactor : drawBase;
      const newQty = toNumber(lot.qtyOnHand) - drawLotUnit;

      await tx.inventoryLot.update({
        where: { id: lot.id },
        data: { qtyOnHand: newQty },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryLotId: lot.id,
          direction: MovementDirection.OUT,
          qty: drawLotUnit,
          unitId: lot.unitId,
          reason: MovementReason.CONSUMPTION_STEP,
          relatedStepExecutionId: stepExecutionId,
          relatedProcessRunId: processRunId,
          movedAt: now,
        },
      });

      await tx.stepMaterialUsage.create({
        data: {
          stepExecutionId,
          rawMaterialId,
          inventoryLotId: lot.id,
          qtyUsed: drawLotUnit,
          unitId: lot.unitId,
        },
      });

      remaining -= drawBase;
    }

    await tx.materialReservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.CONSUMED,
        consumedAt: now,
        qty: consumedQtyInResUnit,
      },
    });
  }
}
