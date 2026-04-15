"use client";

import React, { useState, useMemo, useEffect } from "react";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import { fetchMyTasks, fetchProcessRuns } from "@/app/oldapi/logbook";
import styles from "./LogbookPage.module.css";

const Logbook = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser]   = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsWorker, setRowsWorker] = useState<any[]>([]);
  const [rowsAdmin, setRowsAdmin] = useState<any[]>([]);

  function monthLabelToRange(label: string) {
    if (!label || label.toLowerCase() === "cualquiera") return {};
    const locale = "es-MX";
    const date = new Date();
    const monthIndex = new Date(Date.parse(`${label} 1, ${date.getFullYear()}`)).getMonth();
    const from = new Date(date.getFullYear(), monthIndex, 1);
    const to   = new Date(date.getFullYear(), monthIndex + 1, 0);
    const toISO = (d: Date) => d.toISOString().slice(0,10);
    return { dateFrom: toISO(from), dateTo: toISO(to) };
  }

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        if (!mounted) return;
        setIsAdminMode(!!data.isAdmin);
        setCurrentUser(data.worker?.fullName ?? data.email ?? "");
      } catch {
        return;
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Load data from API when filters change
  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const { dateFrom, dateTo } = monthLabelToRange(selectedMonth.label);
        if (!isAdminMode) {
          const data = await fetchMyTasks({ dateFrom, dateTo });
          // Client-side filter by product label; my-tasks endpoint also accepts productVariantId
          const filtered = data.filter((t: any) => {
            const productName = t.processRun?.productVariant?.name || "";
            const matchProducto = selectedProduct.label === "Todos" ||
              productName.toLowerCase().includes(selectedProduct.label.toLowerCase());
            return matchProducto;
          });
          setRowsWorker(filtered.map((t: any) => ({
            tarea: t.templateStep?.name ?? "Tarea",
            fecha: t.startedAt ? new Date(t.startedAt).toLocaleDateString("es-MX") : "",
            usuario: currentUser,
            // IMPORTANT: we keep "idProceso" for compatibility with DynamicTable,
            // but pass the StepExecutionId; the detail page discrimina por modo.
            detalles: { text: "Ver", idProceso: t.id },
          })));
        } else {
          const params: any = { dateFrom, dateTo };
          // If your user filter has value=id, pass workerId to backend (it supports it)
          if ((selectedUser as any)?.value) params.workerId = (selectedUser as any).value;
          const data = await fetchProcessRuns(params);
          // Client-side filter by product name as safeguard
          const filtered = data.filter((r: any) => {
            const productName = r.productVariant?.name || "";
            return selectedProduct.label === "Todos" ||
              productName.toLowerCase().includes(selectedProduct.label.toLowerCase());
          });
          setRowsAdmin(filtered.map((r: any) => ({
            producto: r.productVariant?.name ?? "—",
            lote: r.batchCode ?? "—",
            fechas: [r.startedAt, r.finishedAt]
              .filter(Boolean)
              .map((d: string) => new Date(d).toLocaleDateString("es-MX"))
              .join(" - "),
            detalles: { text: "Ver", idProceso: r.id }, // processRunId
          })));
        }
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, selectedUser, selectedMonth]);

  const userColumns = [
    { key: "tarea",    label: "Tarea" },
    { key: "fecha",    label: "Fecha" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];

  const adminColumns = [
    { key: "producto", label: "Producto" },
    { key: "lote",     label: "Lote" },
    { key: "fechas",   label: "Fechas" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];

  return (
    <>
      <div className={`${styles.wrapper} page`}>
        <h1 className={styles.title}>Bitácora</h1>

        {!isAdminMode && (
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <h2>{currentUser}</h2>
          </div>
        )}

        <div className={styles.filters}>
          <FilterButton
            title="Filtrar por producto"
            options={productFilterOptions}
            onChange={setSelectedProduct}
          />
          {isAdminMode && (
            <FilterButton
              title="Filtrar por usuario"
              options={userFilterOptions}
              onChange={setSelectedUser}
            />
          )}
          <FilterButton
            title="Filtrar por mes"
            options={monthFilterOptions}
            onChange={setSelectedMonth}
          />
        </div>
        {loading && <p>Cargando…</p>}
        {error && <p style={{color: "red"}}>{error}</p>}
      </div>

      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={isAdminMode ? adminColumns : userColumns}
          data={isAdminMode ? rowsAdmin : rowsWorker}
          isAdminMode={isAdminMode}
        />
      </div>
    </>
  );
};

export default Logbook;
