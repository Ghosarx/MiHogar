import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, PropertySummary, PropertyDetail } from './property.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:8080/api/user';

  constructor(private http: HttpClient) {}

  getMyProperties(tipo?: string, page = 0, size = 12): Observable<PageResponse<PropertySummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<PageResponse<PropertySummary>>(`${this.API}/properties`, { params });
  }

  getMyPropertyById(id: number): Observable<PropertyDetail> {
    return this.http.get<PropertyDetail>(`${this.API}/properties/${id}`);
  }
}
