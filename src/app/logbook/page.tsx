"use client";

import React, { useState, useMemo } from "react";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import {
  userTaskColumns,
  procesos,
} from "@/constants/tableData";
import { getSessionInfo } from "@/constants/api";
import styles from "./LogbookPage.module.css";

const { isAdminMode, currentUser } = getSessionInfo();

const Logbook = () => {
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser]   = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const filteredTasks = useMemo(() => {
    return procesos.flatMap((proceso) => {
      const matchProducto =
        selectedProduct.label === "Todos" ||
        proceso.producto.toLowerCase().includes(selectedProduct.label.toLowerCase());

      if (!matchProducto) return [];

      return proceso.actividades
        .filter((actividad) => {
          const matchUsuario = isAdminMode
            ? selectedUser.label === "Todos" || actividad.usuario === selectedUser.label
            : actividad.usuario === currentUser;

          const matchMes =
            selectedMonth.label === "Cualquiera" ||
            new Date(actividad.fecha)
              .toLocaleString("es-MX", { month: "long" })
              .toLowerCase() === selectedMonth.label.toLowerCase();

          return matchUsuario && matchMes;
        })
        .map((actividad) => ({
          tarea: actividad.tarea,
          fecha: actividad.fecha,
          usuario: actividad.usuario,
          detalles: { text: "Ver", idProceso: proceso.id },
        }));
    });
  }, [selectedProduct, selectedUser, selectedMonth]);

  const userColumns = [
    { key: "tarea",    label: "Tarea" },
    { key: "fecha",    label: "Fecha" },
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
      </div>

      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={isAdminMode ? userTaskColumns : userColumns}
          data={filteredTasks}
          isAdminMode={isAdminMode}
        />
      </div>
    </>
  );
};

export default Logbook;
