import { Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register' | 'forgot-email' | 'forgot-code' | 'forgot-newpassword';
type SuccessType = 'login' | 'register' | 'reset';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly mode = signal<AuthMode>('login');
  readonly successMessage = signal<string | null>(null);
  readonly successType = signal<SuccessType | null>(null);
  readonly apiError = signal<string | null>(null);
  readonly recoveryEmail = signal<string>('');
  readonly resetToken = signal<string>('');
  readonly loading = signal(false);

  private readonly routeMode = toSignal(this.route.data.pipe(map(d => d['initialMode'] as AuthMode | undefined)));

  constructor() {
    effect(() => { const m = this.routeMode(); if (m) { this.mode.set(m); this.successMessage.set(null); } });
  }

  readonly loginForm = this.fb.group({
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    contrasena: this.fb.nonNullable.control('', [Validators.required]),
  });

  readonly registerForm = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    contrasena: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    telefono: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]),
  });

  readonly forgotEmailForm = this.fb.group({
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
  });

  readonly forgotCodeForm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
  });

  readonly forgotPasswordForm = this.fb.group(
    { contrasena: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]), confirmar: this.fb.nonNullable.control('', [Validators.required]) },
    { validators: matchPasswordsValidator },
  );

  readonly passwordMismatch = computed(() => {
    const f = this.forgotPasswordForm; const c = f.get('confirmar');
    return !!f.errors?.['mismatch'] && (c?.touched || c?.dirty) === true;
  });

  setMode(m: AuthMode): void { this.mode.set(m); this.successMessage.set(null); this.successType.set(null); this.apiError.set(null); }

  shouldShowError(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field); return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  errorMessage(form: FormGroup, field: string): string {
    const ctrl = form.get(field); if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Este campo es obligatorio.';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors['email']) return 'Ingresa un correo válido.';
    if (ctrl.errors['pattern']) { if (field === 'telefono') return 'Solo números, entre 6 y 15 dígitos.'; if (field === 'codigo') return 'El código tiene 6 dígitos numéricos.'; }
    return 'Campo inválido.';
  }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true); this.apiError.set(null);
    const v = this.loginForm.getRawValue();
    this.authService.login(v).subscribe({
      next: (res) => { this.loading.set(false); this.successType.set('login'); this.successMessage.set(`¡Bienvenido, ${res.nombre}!`); setTimeout(() => this.router.navigate(['/']), 1200); },
      error: () => { this.loading.set(false); this.apiError.set('Correo o contraseña incorrectos.'); }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading.set(true); this.apiError.set(null);
    const v = this.registerForm.getRawValue();
    this.authService.register(v).subscribe({
      next: (res) => { this.loading.set(false); this.successType.set('register'); this.successMessage.set(`¡Bienvenido, ${res.nombre}! Cuenta creada.`); setTimeout(() => this.router.navigate(['/']), 1200); },
      error: (err) => { this.loading.set(false); this.apiError.set(err.error?.message ?? 'Error al registrar. Intenta nuevamente.'); }
    });
  }

  onForgotEmail(): void {
    if (this.forgotEmailForm.invalid) { this.forgotEmailForm.markAllAsTouched(); return; }
    this.loading.set(true); this.apiError.set(null);
    const { correo } = this.forgotEmailForm.getRawValue();
    this.authService.forgotPassword(correo).subscribe({
      next: () => { this.loading.set(false); this.recoveryEmail.set(correo); this.forgotCodeForm.reset(); this.mode.set('forgot-code'); },
      error: () => { this.loading.set(false); this.recoveryEmail.set(correo); this.forgotCodeForm.reset(); this.mode.set('forgot-code'); }
    });
  }

  onForgotCode(): void {
    if (this.forgotCodeForm.invalid) { this.forgotCodeForm.markAllAsTouched(); return; }
    this.loading.set(true); this.apiError.set(null);
    const { codigo } = this.forgotCodeForm.getRawValue();
    this.authService.verifyCode(this.recoveryEmail(), codigo).subscribe({
      next: (res) => { this.loading.set(false); this.resetToken.set(res.resetToken); this.forgotPasswordForm.reset(); this.mode.set('forgot-newpassword'); },
      error: () => { this.loading.set(false); this.apiError.set('Código inválido o expirado.'); }
    });
  }

  onForgotNewPassword(): void {
    if (this.forgotPasswordForm.invalid) { this.forgotPasswordForm.markAllAsTouched(); return; }
    this.loading.set(true); this.apiError.set(null);
    const { contrasena, confirmar } = this.forgotPasswordForm.getRawValue();
    this.authService.resetPassword(this.resetToken(), contrasena, confirmar).subscribe({
      next: () => { this.loading.set(false); this.successType.set('reset'); this.successMessage.set('Contraseña actualizada. Ya puedes iniciar sesión.'); },
      error: () => { this.loading.set(false); this.apiError.set('Error al actualizar. Intenta de nuevo.'); }
    });
  }

  goToForgot(): void { this.forgotEmailForm.reset(); this.mode.set('forgot-email'); this.apiError.set(null); }
  goToLogin(): void { this.successMessage.set(null); this.successType.set(null); this.apiError.set(null); this.loginForm.reset(); this.registerForm.reset(); this.mode.set('login'); }
  navigateToHome(): void { this.router.navigate(['/']); }
}

function matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const c = group.get('contrasena')?.value; const f = group.get('confirmar')?.value;
  return c && f && c !== f ? { mismatch: true } : null;
}
