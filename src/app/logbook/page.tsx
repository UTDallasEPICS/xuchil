"use client";

import React, { useEffect, useState } from "react";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import styles from "./LogbookPage.module.css";
import Dashboard from "./dashboard/page";

const Logbook = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser] = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const [rowsWorker, setRowsWorker] = useState([]);
  const [rowsAdmin, setRowsAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  type TableRow = Record<string, string | { text: string; idProceso: string }>;

  useEffect(() => {
    const loadProcessStepExecutions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/process-step-executions", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();

        const doneItems = data.filter((item) => item.status === "DONE");

        const workerRows: TableRow[] = doneItems.map((item) => ({
          tarea:
            item.processTemplateStep?.name ??
            item.templateStep?.name ??
            item.notes ??
            "Sin nombre",
          fecha: item.finishedAt
            ? new Date(item.finishedAt).toLocaleDateString("es-MX")
            : "",
          usuario:
            item.processStepWorkers?.[0]?.worker?.name ??
            item.processStepWorkers?.[0]?.worker?.email ??
            "—",
          detalles: {
            text: "Ver",
            idProceso: String(item.processExecutionId ?? item.id),
          },
        }));

        const adminRows: TableRow[] = doneItems.map((item) => ({
          producto: item.processExecution?.product?.name ?? "—",
          lote: item.processExecution?.batchCode ?? "—",
          fechas: [
            item.startedAt
              ? new Date(item.startedAt).toLocaleDateString("es-MX")
              : "",
            item.finishedAt
              ? new Date(item.finishedAt).toLocaleDateString("es-MX")
              : "",
          ]
            .filter(Boolean)
            .join(" - "),
          usuario:
            item.processStepWorkers?.[0]?.worker?.name ??
            item.processStepWorkers?.[0]?.worker?.email ??
            "—",
          detalles: {
            text: "Ver",
            idProceso: String(item.processExecutionId ?? item.id),
          },
        }));

        setRowsWorker(workerRows);
        setRowsAdmin(adminRows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    void loadProcessStepExecutions();
  }, []);

  const userColumns = [
    { key: "tarea", label: "Tarea" },
    { key: "fecha", label: "Fecha" },
    { key: "usuario", label: "Usuario" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];

  const adminColumns = [
    { key: "producto", label: "Producto" },
    { key: "lote", label: "Lote" },
    { key: "fechas", label: "Fechas" },
    { key: "usuario", label: "Usuario" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];

  return (
    <>
      <div className={`${styles.wrapper} page`}>
        <h1 className={styles.title}>Bitácora</h1>

        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <button onClick={() => setIsAdminMode((current) => !current)}>
            {isAdminMode ? "Ver como usuario" : "Ver como admin"}
          </button>
        </div>

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

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <Dashboard
        currentUser={""}
        isAdminMode={isAdminMode}
        selectedProduct={selectedProduct}
        selectedUser={selectedUser}
        selectedMonth={selectedMonth}
      />

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