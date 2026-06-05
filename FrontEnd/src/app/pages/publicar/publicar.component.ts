import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { TipoPropiedad } from '../../models/property.model';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './publicar.component.html',
  styleUrl: './publicar.component.css',
})
export class PublicarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly selectedFiles = signal<File[]>([]);
  readonly fileNames = signal<string[]>([]);
  readonly isDragging = signal(false);
  readonly successData = signal<{ titulo: string; tipo: TipoPropiedad } | null>(null);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.group({
    tipo: this.fb.nonNullable.control<TipoPropiedad>('venta', [Validators.required]),
    titulo: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
    direccion: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    habitaciones: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    banos: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    metraje: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    descripcion: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(20)]),
  });

  shouldShowError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  errorMessage(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Este campo es obligatorio.';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors['min']) return `El valor mínimo es ${ctrl.errors['min'].min}.`;
    return 'Campo inválido.';
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); e.stopPropagation(); this.isDragging.set(true); }
  onDragLeave(e: DragEvent): void { e.preventDefault(); e.stopPropagation(); this.isDragging.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation(); this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length) {
      this.selectedFiles.update(prev => [...prev, ...files]);
      this.fileNames.update(prev => [...prev, ...files.map(f => f.name)]);
    }
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length) {
      this.selectedFiles.update(prev => [...prev, ...files]);
      this.fileNames.update(prev => [...prev, ...files.map(f => f.name)]);
      input.value = '';
    }
  }

  removeFile(i: number): void {
    this.selectedFiles.update(arr => arr.filter((_, j) => j !== i));
    this.fileNames.update(arr => arr.filter((_, j) => j !== i));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMsg.set(null);
    const v = this.form.getRawValue();

    this.propertyService.create({
      titulo: v.titulo, descripcion: v.descripcion,
      precio: v.precio, ubicacion: v.direccion,
      tipo: v.tipo, habitaciones: v.habitaciones,
      banos: v.banos, metraje: v.metraje, amenidades: [],
    }).subscribe({
      next: (prop) => {
        // Si hay imágenes, subirlas a Cloudinary
        const files = this.selectedFiles();
        if (files.length > 0) {
          const form = new FormData();
          files.forEach(f => form.append('files', f));
          this.http.post(`http://localhost:8080/api/properties/${prop.id}/images`, form).subscribe({
            next: () => { this.loading.set(false); this.successData.set({ titulo: v.titulo, tipo: v.tipo }); },
            error: () => { this.loading.set(false); this.successData.set({ titulo: v.titulo, tipo: v.tipo }); }
          });
        } else {
          this.loading.set(false);
          this.successData.set({ titulo: v.titulo, tipo: v.tipo });
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403)
          this.errorMsg.set('Debes iniciar sesión para publicar una propiedad.');
        else
          this.errorMsg.set('Error al publicar. Intenta nuevamente.');
      }
    });
  }

  publishAnother(): void {
    this.form.reset({ tipo: 'venta', titulo: '', direccion: '', precio: null, habitaciones: null, banos: null, metraje: null, descripcion: '' });
    this.selectedFiles.set([]); this.fileNames.set([]); this.successData.set(null); this.errorMsg.set(null);
  }

  goToCatalogo(): void {
    this.router.navigate([this.successData()?.tipo === 'venta' ? '/comprar' : '/alquilar']);
  }
}
