import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, AdminMetrics, UserSummary } from '../../services/admin.service';

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

  readonly activeTab = signal<Tab>('metricas');
  readonly metrics = signal<AdminMetrics | null>(null);
  readonly users = signal<UserSummary[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly editingUser = signal<UserSummary | null>(null);

  readonly editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^[0-9]{6,15}$/)]],
    nuevaContrasena: [''],
  });

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  loadMetrics(): void {
    this.adminService.getMetrics().subscribe({
      next: (m) => this.metrics.set(m),
      error: () => this.errorMsg.set('Error al cargar métricas.')
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.listUsers().subscribe({
      next: (page) => { this.users.set(page.content); this.loading.set(false); },
      error: () => { this.errorMsg.set('Error al cargar usuarios.'); this.loading.set(false); }
    });
  }

  openEdit(user: UserSummary): void {
    this.editingUser.set(user);
    this.editForm.patchValue({
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono ?? '',
      nuevaContrasena: '',
    });
    this.successMsg.set(null);
    this.errorMsg.set(null);
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
        this.successMsg.set(`Usuario ${updated.nombre} actualizado correctamente.`);
        this.closeEdit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Error al actualizar usuario.');
      }
    });
  }

  toggleActive(user: UserSummary): void {
    this.adminService.toggleActive(user.id).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.successMsg.set(`Usuario ${updated.nombre} ${updated.activo ? 'activado' : 'desactivado'}.`);
      },
      error: () => this.errorMsg.set('Error al cambiar estado del usuario.')
    });
  }

  shouldShowError(field: string): boolean {
    const ctrl = this.editForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
