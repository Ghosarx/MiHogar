import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, TipoPropiedad } from '../models/property.model';

export interface PropertySummary {
  id: number; titulo: string; precio: number; ubicacion: string;
  tipo: string; status: string; habitaciones: number; banos: number;
  metraje: number; imagenPrincipal: string | null;
}

export interface PropertyDetail extends PropertySummary {
  descripcion: string; imagenes: string[]; amenidades: string[];
  owner: { id: number; nombre: string; apellido: string | null; telefono: string | null; fotoPerfil: string | null };
  promedioEstrellas: number | null;
  totalResenas: number | null;
}

export interface PageResponse<T> {
  content: T[]; totalElements: number; totalPages: number; number: number; size: number;
}

export interface PropertyFilters {
  tipo?: string; precioMin?: number | null; precioMax?: number | null;
  habitaciones?: number | null; banos?: number | null; ubicacion?: string;
}

const PLACEHOLDER = 'https://placehold.co/800x500?text=Sin+imagen';

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private readonly API = 'http://localhost:8080/api/properties';

  // Signal local — lo usa el catalogo y el modal sin cambios en sus templates
  readonly properties = signal<Property[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // Carga propiedades del BackEnd → mapea al modelo local
  loadProperties(tipo: TipoPropiedad): void {
    this.loading.set(true);
    this.error.set(null);
    this.listProperties({ tipo }).subscribe({
      next: (page) => {
        this.properties.set(page.content.map(p => this.summaryToLocal(p)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las propiedades.');
        this.loading.set(false);
      }
    });
  }

  // Llamada REST: listar con filtros
  listProperties(filters: PropertyFilters, page = 0, size = 50): Observable<PageResponse<PropertySummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.tipo)         params = params.set('tipo', filters.tipo);
    if (filters.precioMin)    params = params.set('precioMin', filters.precioMin);
    if (filters.precioMax)    params = params.set('precioMax', filters.precioMax);
    if (filters.habitaciones) params = params.set('habitaciones', filters.habitaciones);
    if (filters.banos)        params = params.set('banos', filters.banos);
    if (filters.ubicacion)    params = params.set('ubicacion', filters.ubicacion);
    return this.http.get<PageResponse<PropertySummary>>(this.API, { params });
  }

  // Llamada REST: detalle por id (enriquece el modal con owner y todas las fotos)
  loadDetail(id: number): Observable<PropertyDetail> {
    return this.http.get<PropertyDetail>(`${this.API}/${id}`);
  }

  // Llamada REST: publicar
  create(data: any): Observable<PropertyDetail> {
    return this.http.post<PropertyDetail>(this.API, data);
  }

  // Llamada REST: editar
  update(id: number, data: any): Observable<PropertyDetail> {
    return this.http.put<PropertyDetail>(`${this.API}/${id}`, data);
  }

  // Llamada REST: eliminar
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  // Llamada REST: mis propiedades
  mine(page = 0, size = 12): Observable<PageResponse<PropertySummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PropertySummary>>(`${this.API}/mine`, { params });
  }

  trackContactClick(propertyId: number): void {
    fetch(`${this.API}/${propertyId}/contact-click`, { method: 'POST', keepalive: true });
  }

  buildWhatsAppLink(telefono: string, titulo: string, precio: number, tipo: string): string {
    const num = telefono.replace(/\D/g, '');
    const waNum = num.startsWith('51') ? num : `51${num}`;
    const precioStr = tipo === 'alquiler'
      ? `S/. ${precio.toLocaleString('es-PE')}/mes`
      : `$ ${precio.toLocaleString('es-PE')}`;
    const msg = encodeURIComponent(`Hola, vi su propiedad "${titulo}" en MiHogar (${precioStr}) y me interesa. ¿Podría darme más información?`);
    return `https://wa.me/${waNum}?text=${msg}`;
  }

  // Mapeo: PropertySummary (BackEnd) → Property (local)
  summaryToLocal(p: PropertySummary): Property {
    return {
      id: String(p.id), titulo: p.titulo, precio: p.precio,
      ubicacion: p.ubicacion, tipo: p.tipo as TipoPropiedad,
      habitaciones: p.habitaciones ?? 0, banos: p.banos ?? 0,
      metraje: p.metraje ?? 0, amenidades: [], descripcion: '',
      imagen: p.imagenPrincipal ?? PLACEHOLDER,
      imagenes: p.imagenPrincipal ? [p.imagenPrincipal] : [PLACEHOLDER],
    };
  }

  // Mapeo: PropertyDetail (BackEnd) → Property (local)
  detailToLocal(p: PropertyDetail): Property {
    const imgs = p.imagenes?.length ? p.imagenes : [PLACEHOLDER];
    return {
      id: String(p.id), titulo: p.titulo, precio: p.precio,
      ubicacion: p.ubicacion, tipo: p.tipo as TipoPropiedad,
      habitaciones: p.habitaciones ?? 0, banos: p.banos ?? 0,
      metraje: p.metraje ?? 0, amenidades: p.amenidades ?? [],
      descripcion: p.descripcion ?? '', imagen: imgs[0],
      imagenes: imgs,
      ownerTelefono: p.owner?.telefono ?? undefined,
      ownerNombre: p.owner?.nombre,
      ownerApellido: p.owner?.apellido ?? undefined,
      ownerFoto: p.owner?.fotoPerfil ?? null,
      promedioEstrellas: p.promedioEstrellas ?? undefined,
      totalResenas: p.totalResenas ?? undefined,
    };
  }
}
