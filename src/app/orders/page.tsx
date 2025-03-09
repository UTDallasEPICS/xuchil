"use client";
import FilterButton from "@/components/FilterButton";
import TextField from "@/components/TextField";
import { monthFilterOptions, productFilterOptions, userFilterOptions } from "@/constants/filterOptions";


const Orders = () => {
  return (
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
  );
};

export default Orders;
  