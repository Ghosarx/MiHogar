import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewDTO {
  id: number;
  propiedadId: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string | null;
  usuarioFoto: string | null;
  estrellas: number;
  comentario: string | null;
  creadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = 'http://localhost:8080/api';
  private readonly http = inject(HttpClient);

  getReviews(propiedadId: number): Observable<ReviewDTO[]> {
    return this.http.get<ReviewDTO[]>(`${this.API}/properties/${propiedadId}/reviews`);
  }

  crearReview(propiedadId: number, estrellas: number, comentario: string): Observable<ReviewDTO> {
    return this.http.post<ReviewDTO>(`${this.API}/properties/${propiedadId}/reviews`, { estrellas, comentario });
  }

  eliminarReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/reviews/${id}`);
  }
}
