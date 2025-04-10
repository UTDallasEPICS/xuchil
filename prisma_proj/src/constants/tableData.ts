export const userTaskColumns = [
    { key: "usuario", label: "Usuario" },
    { key: "tarea", label: "Tarea" },
    { key: "detalles", label: "Detalles", isButton: true },
  ];
  
  export const userTaskData = [
    { usuario: "Antonio López", tarea: "Molienda y tamizado", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Antonio López") } },
    { usuario: "Minerva Cruz", tarea: "Lavado y secado", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Minerva Cruz") } },
    { usuario: "Zoraida Pérez", tarea: "Envasado", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Zoraida Pérez") } },
    { usuario: "Petronila Hernández", tarea: "Preparación de la mezcla", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Petronila Hernández") } },
    { usuario: "Minerva Cruz", tarea: "Dar forma a las galletas", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Minerva Cruz") } },
    { usuario: "Antonio López", tarea: "Horneado", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Antonio López") } },
    { usuario: "Petronila López", tarea: "Empacado", detalles: { text: "Ver", onClick: () => alert("Ver detalles de Petronila López") } },
  ];
  
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
  