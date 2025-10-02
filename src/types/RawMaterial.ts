export interface RawMaterial {
  id: string;          
  name: string;
  image?: string;
  //description?: string;
  
  stock: number;       // Cantidad actual en almacén
  units: 'kg' | 'g' | 'L' | 'ml' | 'unidades';
  //minimumStock: number; // Nivel para generar alertas de recompra

  // Trazabilidad y Adquisición
  //supplier: string;    // Nombre del proveedor
  //lotNumber?: string;
  //expirationDate?: Date;
  //costPerUnit: number; // Precio de compra

  // Logística
  //storageLocation?: string; // Ubicación física en el almacén
}