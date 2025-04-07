"use client";
import DynamicTable from "@/components/DynamicTable";
import FilterButton from "@/components/FilterButton";
import TextField from "@/components/TextField";
import { monthFilterOptions, productFilterOptions, userFilterOptions } from "@/constants/filterOptions";
import { movementColumns, movementData, userTaskColumns, userTaskData } from "@/constants/tableData";


const Orders = () => {
  return (
    <>
      <div className="page">
        <h1>Pedidos</h1>
        <p>Contenido de la sección Pedidos.</p>
        <TextField 
          placeholder="Escribe aquí..." 
        />
        <FilterButton title="Filtrar por producto" options={productFilterOptions} />
        <FilterButton title="Filtrar por usuario" options={userFilterOptions} />
        <FilterButton title="Filtrar por mes" options={monthFilterOptions} />
      </div>
      <div style={{ padding: "20px" }}>
        <h1>Tabla de Usuarios y Tareas</h1>

        <h1>Tabla de Movimientos</h1>
        <DynamicTable columns={movementColumns} data={movementData} />
      </div>
    </>
  );
};

export default Orders;
  