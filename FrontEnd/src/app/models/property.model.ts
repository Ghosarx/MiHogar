export type TipoPropiedad = 'venta' | 'alquiler';

export interface Property {
  id: string;
  titulo: string;
  precio: number;
  ubicacion: string;
  tipo: TipoPropiedad;
  habitaciones: number;
  banos: number;
  metraje: number;
  amenidades: string[];
  descripcion: string;
  imagen: string;       // imagen principal (primera del array o placeholder)
  imagenes: string[];   // todas las imágenes del BackEnd
  ownerTelefono?: string;
  ownerNombre?: string;
}
