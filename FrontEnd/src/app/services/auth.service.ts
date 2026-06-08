import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  accessToken: string; refreshToken: string;
  id: number; correo: string; nombre: string; apellido: string;
  dni: string; telefono: string; fotoPerfil: string; rol: string;
}

export interface UserSession {
  id: number; nombre: string; apellido: string; dni: string;
  correo: string; telefono: string; fotoPerfil: string | null; rol: string;
}

const ACCESS_KEY = 'mh_access';
const REFRESH_KEY = 'mh_refresh';
const USER_KEY = 'mh_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';

  private readonly _user = signal<UserSession | null>(this.rehydrate());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.rol === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  register(req: { nombre: string; apellido: string; dni: string; correo: string; contrasena: string; telefono: string }) {
    return this.http.post<AuthResponse>(`${this.API}/register`, req).pipe(tap(res => this.saveSession(res)));
  }

  login(req: { correo: string; contrasena: string }) {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(tap(res => this.saveSession(res)));
  }

  forgotPassword(correo: string) {
    return this.http.post(`${this.API}/forgot-password`, { correo });
  }

  verifyCode(correo: string, codigo: string) {
    return this.http.post<{ resetToken: string }>(`${this.API}/verify-code`, { correo, codigo });
  }

  resetPassword(resetToken: string, nuevaContrasena: string, confirmar: string) {
    return this.http.post(`${this.API}/reset-password`, { resetToken, nuevaContrasena, confirmar });
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); localStorage.removeItem(USER_KEY);
    this._user.set(null); this.router.navigate(['/']);
  }

  updateSession(data: Partial<UserSession>): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._user.set(updated);
  }

  getAccessToken(): string | null { return localStorage.getItem(ACCESS_KEY); }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    const u: UserSession = { id: res.id, nombre: res.nombre, apellido: res.apellido, dni: res.dni, correo: res.correo, telefono: res.telefono, fotoPerfil: res.fotoPerfil ?? null, rol: res.rol };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    this._user.set(u);
  }

  private rehydrate(): UserSession | null {
    try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
}
