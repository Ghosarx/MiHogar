import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  accessToken: string; refreshToken: string;
  correo: string; nombre: string; rol: string;
}

const ACCESS_KEY = 'mh_access';
const REFRESH_KEY = 'mh_refresh';
const USER_KEY = 'mh_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';

  private readonly _user = signal<{ nombre: string; correo: string; rol: string } | null>(this.rehydrate());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.rol === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  register(req: { nombre: string; correo: string; contrasena: string; telefono: string }) {
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

  getAccessToken(): string | null { return localStorage.getItem(ACCESS_KEY); }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    const u = { nombre: res.nombre, correo: res.correo, rol: res.rol };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    this._user.set(u);
  }

  private rehydrate() {
    try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
}
