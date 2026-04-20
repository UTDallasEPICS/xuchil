"use client";

import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import * as logbookService from "@/lib/services/logbookService";
import userService from "@/lib/services/userClient";
import styles from "./LogbookPage.module.css";
import Dashboard from "./dashboard/page";

const Logbook = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser]   = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type TableRow = Record<string, string | { text: string; idProceso: string }>;
  const [rowsWorker, setRowsWorker] = useState<TableRow[]>([]);
  const [rowsAdmin, setRowsAdmin] = useState<TableRow[]>([]);

  function monthLabelToRange(label: string) {
    if (!label || label.toLowerCase() === "cualquiera") return {};
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
        const data = await userService.getCurrentUser();
        if (!mounted) return;
        setIsAdminMode(Boolean(data.isAdmin));
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
          const data = await logbookService.fetchMyTasks({ dateFrom, dateTo });
          const items = Array.isArray(data) ? data as unknown[] : [];
          const filtered = items.filter((t: unknown) => {
            const tRec = t as Record<string, unknown>;
            const processRun = tRec.processRun as Record<string, unknown> | undefined;
            const productVariant = processRun?.productVariant as Record<string, unknown> | undefined;
            const productName = productVariant && typeof productVariant.name === "string" ? productVariant.name : "";
            return selectedProduct.label === "Todos" || productName.toLowerCase().includes(selectedProduct.label.toLowerCase());
          });
          setRowsWorker(filtered.map((t: unknown) => {
            const tRec = t as Record<string, unknown>;
            const templateStep = tRec.templateStep as Record<string, unknown> | undefined;
            return ({
              tarea: templateStep && typeof templateStep.name === "string" ? templateStep.name : "Tarea",
              fecha: typeof tRec.startedAt === "string" ? new Date(tRec.startedAt).toLocaleDateString("es-MX") : "",
              usuario: currentUser,
              detalles: { text: "Ver", idProceso: String(typeof tRec.id === "number" ? tRec.id : (tRec.id ?? "")) },
            });
          }));
        } else {
          const params: Record<string, string | number | undefined> = { dateFrom: dateFrom as string | undefined, dateTo: dateTo as string | undefined };
          const selUserVal = ((selectedUser as unknown) as Record<string, unknown>)?.value as string | number | undefined;
          if (selUserVal !== undefined) params.workerId = selUserVal;
          const data = await logbookService.fetchProcessRuns(params);
          const items = Array.isArray(data) ? data as unknown[] : [];
          const filtered = items.filter((r: unknown) => {
            const rRec = r as Record<string, unknown>;
            const productVariant = rRec.productVariant as Record<string, unknown> | undefined;
            const productName = productVariant && typeof productVariant.name === "string" ? productVariant.name : "";
            return selectedProduct.label === "Todos" || productName.toLowerCase().includes(selectedProduct.label.toLowerCase());
          });
          setRowsAdmin(filtered.map((r: unknown) => {
            const rRec = r as Record<string, unknown>;
            const productVariant = rRec.productVariant as Record<string, unknown> | undefined;
            const started = typeof rRec.startedAt === "string" ? new Date(rRec.startedAt).toLocaleDateString("es-MX") : "";
            const finished = typeof rRec.finishedAt === "string" ? new Date(rRec.finishedAt).toLocaleDateString("es-MX") : "";
            return ({
              producto: productVariant && typeof productVariant.name === "string" ? productVariant.name : "—",
              lote: typeof rRec.batchCode === "string" ? rRec.batchCode : "—",
              fechas: [started, finished].filter(Boolean).join(" - "),
              detalles: { text: "Ver", idProceso: String(typeof rRec.id === "number" ? rRec.id : (rRec.id ?? "")) },
            });
          }));
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        setError(errMsg || "Error al cargar datos");
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
      
      <Dashboard 
        currentUser={currentUser} isAdminMode={isAdminMode}
        selectedProduct={selectedProduct} selectedUser={selectedUser} selectedMonth={selectedMonth}
      />

      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={isAdminMode ? adminColumns : userColumns}
          data={isAdminMode ? (rowsAdmin as any) : (rowsWorker as any)}
          isAdminMode={isAdminMode}
        />
      </div>
    </>
  );
};

export default Logbook;
