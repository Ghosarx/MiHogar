import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, AdminMetrics, UserSummary } from '../../services/admin.service';
import { ThemeService } from '../../services/theme.service';

type Tab = 'metricas' | 'usuarios';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  readonly themeService = inject(ThemeService);

  readonly activeTab = signal<Tab>('metricas');
  readonly metrics = signal<AdminMetrics | null>(null);
  readonly users = signal<UserSummary[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly editingUser = signal<UserSummary | null>(null);

  // ── KPI Cards ──────────────────────────────────────────────────────────────

  readonly kpiCards = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    return [
      { icon: 'home',   color: '#2dd4bf', bg: 'rgba(45,212,191,.12)', label: 'Total propiedades', value: m.totalPropiedades,    trend: '+' + m.propiedadesActivas,  trendPos: true,  sub: 'activas' },
      { icon: 'check',  color: '#4ade80', bg: 'rgba(74,222,128,.12)', label: 'Propiedades activas', value: m.propiedadesActivas,   trend: m.propiedadesVenta + ' venta', trendPos: true,  sub: 'publicadas' },
      { icon: 'click',  color: '#f472b6', bg: 'rgba(244,114,182,.12)', label: 'Clicks de contacto', value: m.totalContactClicks,   trend: m.propiedadesAlquiler + ' alq', trendPos: true,  sub: 'interacciones' },
      { icon: 'users',  color: '#a78bfa', bg: 'rgba(167,139,250,.12)', label: 'Usuarios registrados', value: m.totalUsuarios,        trend: '0.00%',                     trendPos: true,  sub: 'último mes' },
    ];
  });

  // ── Line chart SVG (Propiedades por categoría) ────────────────────────────

  readonly lineChart = computed(() => {
    const m = this.metrics();
    if (!m) return null;

    const W = 600, H = 180, px = 10, py = 16;
    const cW = W - px * 2, cH = H - py * 2;

    const raw1 = [m.propiedadesVenta, m.propiedadesAlquiler, m.propiedadesActivas, m.propiedadesPendientes, m.propiedadesRechazadas, m.propiedadesVendidas, m.totalPropiedades];
    const raw2 = raw1.map((v, i) => Math.max(0, v * [0.6, 0.7, 0.55, 0.8, 0.4, 0.65, 0.5][i]));
    const labels = ['Venta', 'Alquiler', 'Activas', 'Pend.', 'Rechazo', 'Vendidas', 'Total'];
    const maxVal = Math.max(...raw1, 1);

    const toPoints = (vals: number[]) => vals.map((v, i) => ({
      x: +(px + (i / (vals.length - 1)) * cW).toFixed(1),
      y: +(py + cH - (v / maxVal) * cH).toFixed(1),
    }));

    const smooth = (pts: {x:number,y:number}[]) => {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1], c = pts[i], mx = (p.x + c.x) / 2;
        d += ` C ${mx} ${p.y},${mx} ${c.y},${c.x} ${c.y}`;
      }
      return d;
    };

    const p1 = toPoints(raw1), p2 = toPoints(raw2);
    const path1 = smooth(p1);
    const path2 = smooth(p2);
    const area1 = path1 + ` L ${p1[p1.length-1].x} ${py+cH} L ${px} ${py+cH} Z`;
    const yLines = [0, 25, 50, 75, 100].map(v => +(py + cH - (v / 100) * cH).toFixed(1));

    return {
      path1, path2, area1, labels, maxVal, W, H,
      points: p1.map((p, i) => ({ ...p, val: raw1[i], label: labels[i] })),
      yLines, bottom: py + cH,
    };
  });

  // ── Sidebar: top categories ───────────────────────────────────────────────

  readonly categories = computed(() => {
    const m = this.metrics();
    if (!m) return [];
    const total = m.totalPropiedades || 1;
    return [
      { label: 'Venta',      sub: 'Propiedades en venta',    value: m.propiedadesVenta,    pct: Math.round(m.propiedadesVenta    / total * 100) },
      { label: 'Alquiler',   sub: 'Propiedades en alquiler', value: m.propiedadesAlquiler, pct: Math.round(m.propiedadesAlquiler / total * 100) },
      { label: 'Activas',    sub: 'Publicaciones activas',   value: m.propiedadesActivas,  pct: Math.round(m.propiedadesActivas  / total * 100) },
      { label: 'Pendientes', sub: 'En espera de aprobación', value: m.propiedadesPendientes, pct: Math.round(m.propiedadesPendientes / total * 100) },
      { label: 'Rechazadas', sub: 'No aprobadas',            value: m.propiedadesRechazadas, pct: Math.round(m.propiedadesRechazadas / total * 100) },
    ];
  });

  readonly editForm = this.fb.group({
    nombre:          ['', [Validators.required, Validators.minLength(3)]],
    correo:          ['', [Validators.required, Validators.email]],
    telefono:        ['', [Validators.pattern(/^[0-9]{6,15}$/)]],
    nuevaContrasena: [''],
  });

  ngOnInit(): void { this.loadMetrics(); this.loadUsers(); }

  setTab(tab: Tab): void { this.activeTab.set(tab); this.successMsg.set(null); this.errorMsg.set(null); }

  loadMetrics(): void {
    this.adminService.getMetrics().subscribe({
      next: (m) => this.metrics.set(m),
      error: () => this.errorMsg.set('Error al cargar métricas.'),
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.listUsers().subscribe({
      next: (page) => { this.users.set(page.content); this.loading.set(false); },
      error: () => { this.errorMsg.set('Error al cargar usuarios.'); this.loading.set(false); },
    });
  }

  openEdit(user: UserSummary): void {
    this.editingUser.set(user);
    this.editForm.patchValue({ nombre: user.nombre, correo: user.correo, telefono: user.telefono ?? '', nuevaContrasena: '' });
    this.successMsg.set(null); this.errorMsg.set(null);
  }

  closeEdit(): void { this.editingUser.set(null); }

  saveUser(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    const user = this.editingUser();
    if (!user) return;
    this.loading.set(true);
    const v = this.editForm.getRawValue();
    const payload: any = { nombre: v.nombre, correo: v.correo, telefono: v.telefono };
    if (v.nuevaContrasena && v.nuevaContrasena.length >= 8) payload.nuevaContrasena = v.nuevaContrasena;
    this.adminService.updateUser(user.id, payload).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.loading.set(false);
        this.successMsg.set(`Usuario ${updated.nombre} actualizado.`);
        this.closeEdit();
      },
      error: (err) => { this.loading.set(false); this.errorMsg.set(err.error?.message ?? 'Error al actualizar.'); },
    });
  }

  toggleActive(user: UserSummary): void {
    this.adminService.toggleActive(user.id).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.successMsg.set(`Usuario ${updated.nombre} ${updated.activo ? 'activado' : 'desactivado'}.`);
      },
      error: () => this.errorMsg.set('Error al cambiar estado.'),
    });
  }

  shouldShowError(field: string): boolean {
    const ctrl = this.editForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  iniciales(nombre: string): string {
    return nombre.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
