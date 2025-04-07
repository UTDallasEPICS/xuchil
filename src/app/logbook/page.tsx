"use client";
import React, { useState, useMemo } from "react";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import TextField from "@/components/TextField";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import {
  movementColumns,
  movementData,
  userTaskColumns,
  procesos,
} from "@/constants/tableData";

const Logbook = () => {
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser] = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);

  const filteredTasks = useMemo(() => {
    return procesos.flatMap((proceso) => {
      const matchProducto =
        selectedProduct.label === "Todos" ||
        proceso.producto.toLowerCase().includes(selectedProduct.label.toLowerCase());

      if (!matchProducto) return [];

      return proceso.actividades
        .filter((actividad) => {
          const matchUsuario =
            selectedUser.label === "Todos" || actividad.usuario === selectedUser.label;

          const matchMes =
            selectedMonth.label === "Cualquiera" ||
            new Date(actividad.fecha).toLocaleString("es-MX", { month: "long" }).toLowerCase() ===
              selectedMonth.label.toLowerCase();

          return matchUsuario && matchMes;
        })
        .map((actividad) => ({
          usuario: actividad.usuario,
          tarea: actividad.tarea,
          detalles: {
            text: "Ver",
            idProceso: proceso.id,
            onClick: () => {
              console.log("Proceso completo:", proceso);
              alert(`Detalles de proceso:\nProducto: ${proceso.producto}\nActividad: ${actividad.tarea}`);
            },
          },
        }));
    });
  }, [selectedProduct, selectedUser, selectedMonth]);

  return (
    <>
      <div className="page" style={{ padding: "20px"}}>
        <h1 style={{textAlign: 'center'}}>Bitácora</h1>

        <div style={{ display: "flex", overflowX: "auto", gap: "10px", padding: "10px 0" }}>
          <FilterButton
            title="Filtrar por producto"
            options={productFilterOptions}
            onChange={setSelectedProduct}
          />
          <FilterButton
            title="Filtrar por usuario"
            options={userFilterOptions}
            onChange={setSelectedUser}
          />
          <FilterButton
            title="Filtrar por mes"
            options={monthFilterOptions}
            onChange={setSelectedMonth}
          />
        </div>
      </div>

      <div style={{}}>
        <DynamicTable columns={userTaskColumns} data={filteredTasks} />
      </div>
    </>
  );
};

export default Logbook;

