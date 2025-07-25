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
  {
    id: "143218",
    producto: "Harina de maíz",
    fechaInicio: "10/01/2025",
    fechaFin: "11/01/2025",
    materiaPrimaKg: 25,
    productoKg: 23,
    mermaKg: 2,
    observaciones: "Buen rendimiento. El secado fue más largo por la humedad.",
    actividades: [
      {
        usuario: "Petronila Hernández",
        tarea: "Lavado",
        fecha: "10/01/2025",
        horaInicio: "08:00",
        horaFin: "09:30",
      },
      {
        usuario: "Minerva Cruz",
        tarea: "Secado",
        fecha: "10/01/2025",
        horaInicio: "09:30",
        horaFin: "11:00",
      },
    ],
  },
  {
    id: "143219",
    producto: "Frijol",
    fechaInicio: "15/02/2025",
    fechaFin: "15/02/2025",
    materiaPrimaKg: 30,
    productoKg: 29.5,
    mermaKg: 0.5,
    observaciones: "Empacado sin incidentes.",
    actividades: [
      {
        usuario: "Víctor Aragón",
        tarea: "Clasificación",
        fecha: "15/02/2025",
        horaInicio: "09:00",
        horaFin: "10:00",
      },
      {
        usuario: "Antonio López",
        tarea: "Embolsado de 5kg",
        fecha: "15/02/2025",
        horaInicio: "10:00",
        horaFin: "11:30",
      },
    ],
  },
  {
    id: "143220",
    producto: "Sustituto de café",
    fechaInicio: "22/03/2025",
    fechaFin: "23/03/2025",
    materiaPrimaKg: 12,
    productoKg: 10.5,
    mermaKg: 1.5,
    observaciones: "La molienda fue más gruesa de lo normal.",
    actividades: [
      {
        usuario: "Petronila Hernández",
        tarea: "Molienda",
        fecha: "22/03/2025",
        horaInicio: "13:00",
        horaFin: "14:00",
      },
      {
        usuario: "Minerva Cruz",
        tarea: "Empacado",
        fecha: "23/03/2025",
        horaInicio: "09:00",
        horaFin: "10:00",
      },
    ],
  },
  {
    id: "143221",
    producto: "Galletas de mezquite",
    fechaInicio: "18/02/2025",
    fechaFin: "19/02/2025",
    materiaPrimaKg: 20,
    productoKg: 18,
    mermaKg: 2,
    observaciones: "Se realizaron pruebas con nueva receta.",
    actividades: [
      {
        usuario: "Zoraida Pérez",
        tarea: "Preparación de la mezcla",
        fecha: "18/02/2025",
        horaInicio: "08:30",
        horaFin: "09:30",
      },
      {
        usuario: "Antonio López",
        tarea: "Horneado",
        fecha: "18/02/2025",
        horaInicio: "10:00",
        horaFin: "11:30",
      },
      {
        usuario: "Víctor Aragón",
        tarea: "Decoración",
        fecha: "19/02/2025",
        horaInicio: "09:00",
        horaFin: "10:00",
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
  { movimiento: "Entrega de 5 bolsas", fecha: "08/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 5 bolsas", fecha: "09/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 4 bolsas", fecha: "10/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 2 bolsas", fecha: "10/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 2 bolsas", fecha: "11/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 2 bolsas", fecha: "11/02/2025", productId: "maiz-negro" },
  { movimiento: "Entrega de 2 bolsas", fecha: "11/02/2025", productId: "maiz-negro" },

  { movimiento: "Salida de 1 lote", fecha: "12/02/2025", productId: "mezquite-5kg" },
  { movimiento: "Salida de 1 lote", fecha: "13/02/2025", productId: "mezquite-5kg" },
  { movimiento: "Salida de 1 lote", fecha: "14/02/2025", productId: "mezquite-5kg" },
  { productId: "mezquite-5kg", movimiento: "Producción de 10 bolsas", fecha: "08/02/2025" },
  { productId: "mezquite-5kg", movimiento: "Entrega de 5 bolsas", fecha: "10/02/2025" },

  { productId: "amaranto-1kg", movimiento: "Producción de 20 bolsas", fecha: "09/02/2025" },
  { productId: "amaranto-1kg", movimiento: "Venta de 4 bolsas", fecha: "11/02/2025" },

  { productId: "sustituto-1kg", movimiento: "Producción de 12 frascos", fecha: "07/02/2025" },
  { productId: "sustituto-1kg", movimiento: "Entrega de 6 frascos", fecha: "09/02/2025" },

  { productId: "harina-mezquite", movimiento: "Recepción de 500kg", fecha: "05/02/2025" },
  { productId: "harina-mezquite", movimiento: "Consumo de 100kg", fecha: "10/02/2025" },

  { productId: "vaina-mezquite", movimiento: "Compra de 1000kg", fecha: "04/02/2025" },
  { productId: "vaina-mezquite", movimiento: "Consumo de 200kg", fecha: "08/02/2025" },

  { productId: "maiz-negro", movimiento: "Compra de 100kg", fecha: "06/02/2025" },
  { productId: "maiz-negro", movimiento: "Consumo de 50kg", fecha: "10/02/2025" },

  { productId: "maiz-amarillo", movimiento: "Compra de 200kg", fecha: "06/02/2025" },
  { productId: "maiz-amarillo", movimiento: "Consumo de 80kg", fecha: "09/02/2025" },

  { productId: "frijol-negro", movimiento: "Recepción de 150kg", fecha: "05/02/2025" },
  { productId: "frijol-negro", movimiento: "Consumo de 20kg", fecha: "11/02/2025" },
];

  