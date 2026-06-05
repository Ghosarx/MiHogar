import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminMetrics {
  totalUsuarios: number;
  totalPropiedades: number;
  propiedadesVenta: number;
  propiedadesAlquiler: number;
  propiedadesPendientes: number;
  propiedadesActivas: number;
  propiedadesRechazadas: number;
  propiedadesVendidas: number;
  totalContactClicks: number;
}

export interface UserSummary {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  totalPropiedades: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.API}/metrics`);
  }

  listUsers(page = 0, size = 20): Observable<PageResponse<UserSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<UserSummary>>(`${this.API}/users`, { params });
  }

  updateUser(id: number, data: { nombre: string; correo: string; telefono: string; nuevaContrasena?: string }): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.API}/users/${id}`, data);
  }

  toggleActive(id: number): Observable<UserSummary> {
    return this.http.patch<UserSummary>(`${this.API}/users/${id}/toggle-active`, {});
  }

  updatePropertyStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.API}/properties/${id}/status`, null, { params: { status } });
  }
}
