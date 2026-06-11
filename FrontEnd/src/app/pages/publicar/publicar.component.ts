import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { TagService, Tag } from '../../services/tag.service';
import { UserService } from '../../services/user.service';
import { TipoPropiedad } from '../../models/property.model';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './publicar.component.html',
  styleUrl: './publicar.component.css',
})
export class PublicarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);
  private readonly userService = inject(UserService);
  private readonly tagService = inject(TagService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly editId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.editId() !== null);
  readonly selectedFiles = signal<File[]>([]);
  readonly fileNames = signal<string[]>([]);
  readonly isDragging = signal(false);
  readonly successData = signal<{ titulo: string; tipo: TipoPropiedad } | null>(null);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly selectedTags = signal<string[]>([]);

  readonly tagsByCategoria = computed(() => this.tagService.byCategoria());

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(Number(id));
      this.loadPropertyForEdit(Number(id));
    }
  }

  private loadPropertyForEdit(id: number): void {
    this.loading.set(true);
    this.userService.getMyPropertyById(id).subscribe({
      next: (prop) => {
        this.form.patchValue({
          tipo: prop.tipo as TipoPropiedad,
          titulo: prop.titulo,
          direccion: prop.ubicacion,
          precio: prop.precio,
          habitaciones: prop.habitaciones,
          banos: prop.banos,
          metraje: prop.metraje,
          descripcion: prop.descripcion,
        });
        this.selectedTags.set(prop.amenidades ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar la propiedad.');
        this.loading.set(false);
      }
    });
  }

  toggleTag(nombre: string): void {
    this.selectedTags.update(tags =>
      tags.includes(nombre) ? tags.filter(t => t !== nombre) : [...tags, nombre]
    );
  }

  isTagSelected(nombre: string): boolean {
    return this.selectedTags().includes(nombre);
  }

  getCategoriaLabel(cat: string): string {
    const labels: Record<string, string> = {
      servicios: 'Servicios', seguridad: 'Seguridad', espacios: 'Espacios',
      amenidades: 'Amenidades del edificio', vistas: 'Vistas y entorno', extras: 'Extras'
    };
    return labels[cat] ?? cat;
  }

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
    if (files.length) { this.selectedFiles.update(p => [...p, ...files]); this.fileNames.update(p => [...p, ...files.map(f => f.name)]); }
  }
  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length) { this.selectedFiles.update(p => [...p, ...files]); this.fileNames.update(p => [...p, ...files.map(f => f.name)]); input.value = ''; }
  }
  removeFile(i: number): void {
    this.selectedFiles.update(arr => arr.filter((_, j) => j !== i));
    this.fileNames.update(arr => arr.filter((_, j) => j !== i));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const payload = {
      titulo: v.titulo, descripcion: v.descripcion, precio: v.precio,
      ubicacion: v.direccion, tipo: v.tipo, habitaciones: v.habitaciones,
      banos: v.banos, metraje: v.metraje, amenidades: this.selectedTags(),
    };

    const request$ = this.isEditMode()
      ? this.propertyService.update(this.editId()!, payload)
      : this.propertyService.create(payload);

    request$.subscribe({
      next: (prop) => {
        const files = this.selectedFiles();
        if (files.length > 0 && !this.isEditMode()) {
          const form = new FormData();
          files.forEach(f => form.append('files', f));
          this.http.post(`http://localhost:8080/api/properties/${prop.id}/images`, form).subscribe({
            next: () => { this.loading.set(false); this.onSuccess(v.titulo, v.tipo); },
            error: (err) => {
              this.loading.set(false);
              this.errorMsg.set('La propiedad se guardó, pero las imágenes no se pudieron subir: ' + (err.error?.message || err.message || 'error desconocido'));
            }
          });
        } else {
          this.loading.set(false);
          this.onSuccess(v.titulo, v.tipo);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) this.errorMsg.set('Debes iniciar sesión para publicar.');
        else this.errorMsg.set('Error al guardar. Intenta nuevamente.');
      }
    });
  }

  private onSuccess(titulo: string, tipo: TipoPropiedad): void {
    this.successData.set({ titulo, tipo });
  }

  publishAnother(): void {
    this.form.reset({ tipo: 'venta', titulo: '', direccion: '', precio: null, habitaciones: null, banos: null, metraje: null, descripcion: '' });
    this.selectedFiles.set([]); this.fileNames.set([]); this.selectedTags.set([]); this.successData.set(null); this.errorMsg.set(null);
    this.editId.set(null);
  }

  goToPanel(): void { this.router.navigate(['/mi-panel']); }

  goToCatalogo(): void {
    this.router.navigate([this.successData()?.tipo === 'venta' ? '/comprar' : '/alquilar']);
  }
}
