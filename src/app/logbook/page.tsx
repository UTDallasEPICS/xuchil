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

import styles from "./LogbookPage.module.css";

const currentUserName = "Antonio López";

const isAdminMode = false; 

const Logbook = () => {
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser] = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const filteredTasks = useMemo(() => {
    return procesos.flatMap((proceso) => {
      const matchProducto =
        selectedProduct.label === "Todos" ||
        proceso.producto
          .toLowerCase()
          .includes(selectedProduct.label.toLowerCase());

      if (!matchProducto) return [];

      return proceso.actividades
        .filter((actividad) => {
          const matchUsuario = isAdminMode
            ? selectedUser.label === "Todos" || actividad.usuario === selectedUser.label
            : actividad.usuario === currentUserName;

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
          detalles: {
            text: "Ver",
            idProceso: proceso.id,
          },
        }));
    });
  }, [selectedProduct, selectedUser, selectedMonth]);

  const userColumns = [
    { key: "tarea", label: "Tarea" },
    { key: "fecha", label: "Fecha" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];

  return (
    <>
      <div className="page" style={{ maxWidth: "700px" }}>
        <h1 style={{ textAlign: 'center', paddingTop: "15px" }}>Bitácora</h1>

        {!isAdminMode && (
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <h2>{currentUserName}</h2>
          </div>          
        )}

        <div
          style={{
            width: "100vw",
            maxWidth: "700px",
            display: "flex",
            overflowX: "auto",
            gap: "10px",
            padding: "10px",
            marginLeft: "30px"
          }}
        >
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

      <div style={{ paddingBottom: "90px" }}>
        <DynamicTable
          columns={isAdminMode ? userTaskColumns : userColumns}
          data={filteredTasks}
        />
      </div>
    </>
  );
};

export default Logbook;
