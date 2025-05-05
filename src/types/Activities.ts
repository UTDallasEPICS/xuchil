export interface Actividad {
    usuario: string;
    tarea: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }
  
  export interface Proceso {
    id: string;
    producto: string;
    fechaInicio: string;
    fechaFin: string;
    actividades: Actividad[];
    materiaPrimaKg: number;
    productoKg: number;
    mermaKg: number;
    observaciones: string;
  }