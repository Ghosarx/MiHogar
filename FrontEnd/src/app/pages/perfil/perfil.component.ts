import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly loadingFoto = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly tab = signal<'datos' | 'contrasena' | 'foto'>('datos');
  readonly fotoPreview = signal<string | null>(null);

  private readonly API = 'http://localhost:8080/api/perfil';
  readonly user = this.authService.user;

  readonly datosForm = this.fb.group({
    nombre:   this.fb.nonNullable.control(this.user()?.nombre   ?? '', [Validators.required, Validators.minLength(2)]),
    apellido: this.fb.nonNullable.control(this.user()?.apellido ?? '', [Validators.minLength(2)]),
    dni:      this.fb.nonNullable.control(this.user()?.dni      ?? '', [Validators.pattern(/^[0-9]{8}$/)]),
    correo:   this.fb.nonNullable.control(this.user()?.correo   ?? '', [Validators.required, Validators.email]),
    telefono: this.fb.nonNullable.control(this.user()?.telefono ?? '', [Validators.pattern(/^[0-9]{6,15}$/)]),
  });

  readonly passForm = this.fb.group({
    nuevaContrasena: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmar:       this.fb.nonNullable.control('', [Validators.required]),
  });

  // ── Datos ────────────────────────────────────────────────────────────────
  shouldShowError(field: string): boolean {
    const ctrl = this.datosForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  errorMsg(field: string): string {
    const ctrl = this.datosForm.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Campo obligatorio.';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors['email']) return 'Correo inválido.';
    if (ctrl.errors['pattern']) {
      if (field === 'telefono') return 'Solo números, 6-15 dígitos.';
      if (field === 'dni') return 'El DNI debe tener 8 dígitos.';
    }
    return 'Campo inválido.';
  }

  onGuardarDatos(): void {
    if (this.datosForm.invalid) { this.datosForm.markAllAsTouched(); return; }
    this.loading.set(true); this.success.set(null); this.error.set(null);
    this.http.put<any>(this.API, this.datosForm.getRawValue()).subscribe({
      next: (res) => {
        this.authService.updateSession({ nombre: res.nombre, apellido: res.apellido, dni: res.dni, correo: res.correo, telefono: res.telefono });
        this.loading.set(false);
        this.showSuccess('Datos actualizados correctamente.');
      },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message ?? 'Error al guardar.'); }
    });
  }

  // ── Contraseña ────────────────────────────────────────────────────────────
  onCambiarContrasena(): void {
    if (this.passForm.invalid) { this.passForm.markAllAsTouched(); return; }
    const v = this.passForm.getRawValue();
    if (v.nuevaContrasena !== v.confirmar) { this.error.set('Las contraseñas no coinciden.'); return; }
    this.loading.set(true); this.success.set(null); this.error.set(null);
    this.http.put<any>(this.API, { ...this.datosForm.getRawValue(), nuevaContrasena: v.nuevaContrasena }).subscribe({
      next: () => { this.loading.set(false); this.passForm.reset(); this.showSuccess('Contraseña actualizada correctamente.'); },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message ?? 'Error al cambiar contraseña.'); }
    });
  }

  // ── Foto de perfil ────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { this.error.set('Solo se permiten imágenes.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.error.set('La imagen no puede superar 5 MB.'); return; }

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // Subir al servidor
    const form = new FormData();
    form.append('file', file);
    this.loadingFoto.set(true); this.success.set(null); this.error.set(null);
    this.http.post<any>(`${this.API}/foto`, form).subscribe({
      next: (res) => {
        this.authService.updateSession({ fotoPerfil: res.fotoPerfil });
        this.fotoPreview.set(res.fotoPerfil);
        this.loadingFoto.set(false);
        this.showSuccess('Foto de perfil actualizada.');
      },
      error: (err) => { this.loadingFoto.set(false); this.fotoPreview.set(null); this.error.set(err.error?.message ?? 'Error al subir la foto.'); }
    });
  }

  fotoActual(): string | null {
    return this.fotoPreview() ?? this.user()?.fotoPerfil ?? null;
  }

  iniciales(): string {
    const n = this.user()?.nombre?.[0] ?? '';
    const a = this.user()?.apellido?.[0] ?? '';
    return (n + a).toUpperCase();
  }

  private showSuccess(msg: string): void {
    this.success.set(msg);
    setTimeout(() => this.success.set(null), 3500);
  }
}
