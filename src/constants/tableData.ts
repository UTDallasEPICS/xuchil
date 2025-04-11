// tableData.ts
import { Proceso } from "@/types/Activities";

export const procesos: Proceso[] = [
  {
    id: "143217",
    producto: "Galletas de amaranto",
    fechaInicio: "04/02/2025",
    fechaFin: "06/02/2025",
    materiaPrimaKg: 16.2,
    productoKg: 15.4,
    mermaKg: 0.71,
    observaciones: "Todo el proceso se realizó correctamente. Se notó ligera merma en el horneado.",
    actividades: [
      {
        usuario: "Antonio López",
        tarea: "Molienda y tamizado",
        fecha: "04/02/2025",
        horaInicio: "10:30",
        horaFin: "11:15",
      },
      {
        usuario: "Minerva Cruz",
        tarea: "Lavado y secado",
        fecha: "05/02/2025",
        horaInicio: "11:15",
        horaFin: "12:00",
      },
      {
        usuario: "Zoraida Pérez",
        tarea: "Envasado",
        fecha: "06/02/2025",
        horaInicio: "12:00",
        horaFin: "13:00",
      },
    ],
  },
];

export const userTaskColumns = [
    { key: "usuario", label: "Usuario" },
    { key: "tarea", label: "Tarea" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];
  
  export const userTaskData = procesos.flatMap((proceso) =>
    proceso.actividades.map((actividad) => ({
      usuario: actividad.usuario,
      tarea: actividad.tarea,
      detalles: {
        text: "Ver",
        onClick: () => {
          console.log("Proceso completo:", proceso);
          alert(`Detalles de proceso para ${actividad.usuario}:\nProducto: ${proceso.producto}`);
        },
      },
    }))
  );
  
  export const movementColumns = [
    { key: "movimiento", label: "Movimiento" },
    { key: "fecha", label: "Fecha" },
  ];
  
  export const movementData = [
    { movimiento: "Embolsado de 5kg", fecha: "11/02/2025" },
    { movimiento: "Embolsado de 5kg", fecha: "11/02/2025" },
    { movimiento: "Embolsado de 1kg", fecha: "10/02/2025" },
    { movimiento: "Embolsado de 5kg", fecha: "10/02/2025" },
    { movimiento: "Embolsado de 1kg", fecha: "09/02/2025" },
    { movimiento: "Embolsado de 1kg", fecha: "09/02/2025" },
    { movimiento: "Embolsado de 1kg", fecha: "09/02/2025" },
  ];
  