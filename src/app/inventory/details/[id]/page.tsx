"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import styles from "./DetailPage.module.css";

type DetailItem = {
  itemType: "RAW" | "PRODUCT";
  name: string;
  presentation?: string;
  quantity: number;
  units: string;
  defaultUnitId: number | null;
  lots: Array<{ id: number }>;
};

interface UnitOption {
  id: number;
  name: string;
}

interface InventoryDetailResponse {
  itemType: string;
  defaultUnitId?: number | null;
  rawMaterial?: {
    defaultUnitId?: number | null;
    name?: string | null;
    defaultUnit?: { name?: string | null } | null;
  } | null;
  productVariant?: {
    defaultUnitId?: number | null;
    product?: { name?: string | null } | null;
    name?: string | null;
    presentation?: string | null;
    defaultUnit?: { name?: string | null } | null;
  } | null;
  inventoryLots?: Array<{
    id: number;
    unitId?: number | null;
    unit?: { name?: string | null } | null;
    qtyOnHand?: number | string | null;
  }>;
}

interface InventoryMovementResponse {
  direction: string;
  qty: number | string;
  reason: string;
  movedAt?: string | null;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fechaCorta(valor: string) {
  const partes = valor.split("/");
  if (partes.length !== 3) return valor;
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  if (Number.isNaN(dia) || Number.isNaN(mes) || mes < 1 || mes > 12) return valor;
  return `${dia} ${MESES[mes - 1]}`;
}

function partirMovimiento(texto: string) {
  const corte = texto.indexOf(" de ");
  if (corte === -1) return { tipo: texto, detalle: "" };
  return {
    tipo: texto.slice(0, corte),
    detalle: texto.slice(corte + 4),
  };
}

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<DetailItem | null>(null);
  const [movimientos, setMovimientos] = useState<Array<{ movimiento: string; fecha: string }>>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [restockQty, setRestockQty] = useState("");
  const [restockUnitId, setRestockUnitId] = useState<string>("");
  const [restocking, setRestocking] = useState(false);
  const [restockError, setRestockError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const itemResponse = await fetch(`/api/inventory/items/${id}`, { credentials: "include" });
    if (!itemResponse.ok) return;
    const data: InventoryDetailResponse = await itemResponse.json();

    const qty = (data.inventoryLots || []).reduce(
      (sum, lot) => sum + Number(lot.qtyOnHand || 0),
      0
    );

    const defaultUnitId =
      data.rawMaterial?.defaultUnitId ??
      data.productVariant?.defaultUnitId ??
      data.defaultUnitId ??
      data.inventoryLots?.[0]?.unitId ??
      null;

    const mappedItem: DetailItem = {
      itemType: data.itemType === "RAW" ? "RAW" : "PRODUCT",
      name:
        data.itemType === "RAW"
          ? data.rawMaterial?.name ?? "Materia prima"
          : data.productVariant?.product?.name ?? "Producto",
      presentation:
        data.itemType === "RAW"
          ? undefined
          : data.productVariant?.name ?? data.productVariant?.presentation ?? "",
      quantity: qty,
      units:
        data.rawMaterial?.defaultUnit?.name ||
        data.productVariant?.defaultUnit?.name ||
        data.inventoryLots?.[0]?.unit?.name ||
        "",
      defaultUnitId,
      lots: data.inventoryLots || [],
    };

    const movementRows: Array<{ movimiento: string; fecha: string }> = [];
    for (const lot of mappedItem.lots) {
      const movementResponse = await fetch(`/api/inventory/lots/${lot.id}/movements`, {
        credentials: "include",
      });
      if (!movementResponse.ok) continue;
      const movements = await movementResponse.json();
      (movements as InventoryMovementResponse[]).forEach((movement) => {
        movementRows.push({
          movimiento: `${movement.direction} ${movement.qty} (${movement.reason})`,
          fecha: movement.movedAt
            ? new Date(movement.movedAt).toLocaleDateString("es-MX")
            : "",
        });
      });
    }

    setItem(mappedItem);
    setMovimientos(movementRows);
    setRestockUnitId((prev) => prev || (defaultUnitId ? String(defaultUnitId) : ""));
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadUnits() {
      const res = await fetch("/api/units", { credentials: "include" });
      if (res.ok && mounted) setUnits(await res.json());
    }

    loadUnits();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    return () => {
      mounted = false;
    };
  }, [id, load]);

  const handleRestock = async () => {
    setRestockError(null);
    const qty = Number(restockQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setRestockError("Ingresa una cantidad mayor a 0.");
      return;
    }
    try {
      setRestocking(true);
      const response = await fetch(`/api/inventory/items/${id}/restock`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qty,
          unitId: restockUnitId ? parseInt(restockUnitId, 10) : undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo agregar stock.");
      }
      setRestockQty("");
      await load();
    } catch (err) {
      setRestockError(err instanceof Error ? err.message : "No se pudo agregar stock.");
    } finally {
      setRestocking(false);
    }
  };

  if (!item) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Producto no encontrado</p>
      </div>
    );
  }

  const volverA = item.itemType === "PRODUCT" ? "/inventory/products" : "/inventory/raw";

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.back}
        onClick={() => router.push(volverA)}
      >
        <ChevronLeft size={18} />
        Inventario
      </button>

      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>{item.name}</h1>
          {!!item.presentation && (
            <p className={styles.presentation}>{item.presentation}</p>
          )}
        </div>

        <p className={styles.stock}>
          <span className={styles.stockValue}>{item.quantity}</span>
          <span className={styles.stockUnit}>{item.units}</span>
        </p>
      </header>

      <div className={styles.restockBar}>
        <input
          type="number"
          min="0"
          step="0.001"
          className={styles.restockInput}
          placeholder="Cantidad"
          value={restockQty}
          onChange={(e) => setRestockQty(e.target.value)}
        />
        <select
          className={styles.restockSelect}
          value={restockUnitId}
          onChange={(e) => setRestockUnitId(e.target.value)}
        >
          <option value="">Unidad...</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.restockButton}
          onClick={handleRestock}
          disabled={restocking}
        >
          {restocking ? "Agregando..." : "Agregar stock"}
        </button>
        {restockError ? <p className={styles.restockError}>{restockError}</p> : null}
      </div>

      <p className={styles.sectionLabel}>Movimientos</p>

      <section className={styles.card}>
        {movimientos.length === 0 ? (
          <p className={styles.empty}>Sin movimientos registrados</p>
        ) : (
          <ul className={styles.list}>
            {movimientos.map((m, i) => {
              const { tipo, detalle } = partirMovimiento(m.movimiento);
              return (
                <li className={styles.row} key={`${m.fecha}-${i}`}>
                  <div className={styles.rowText}>
                    <p className={styles.rowType}>{tipo}</p>
                    {!!detalle && <p className={styles.rowDetail}>{detalle}</p>}
                  </div>
                  <p className={styles.rowDate}>{fechaCorta(m.fecha)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
