import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-detail-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './property-detail-modal.component.html',
  styleUrl: './property-detail-modal.component.css',
})
export class PropertyDetailModalComponent {
  private readonly modalService = inject(ModalService);
  private readonly propertyService = inject(PropertyService);
  private readonly fb = inject(FormBuilder);

  readonly property = this.modalService.selected;
  readonly isOpen = this.modalService.isOpen;
  readonly loadingDetail = this.modalService.loading;

  readonly activeThumb = signal(0);
  readonly successMessage = signal<string | null>(null);

  readonly currentImage = computed(() => {
    const p = this.property();
    if (!p) return '';
    const imgs = p.imagenes?.length ? p.imagenes : [p.imagen];
    return imgs[this.activeThumb()] ?? imgs[0];
  });

  readonly thumbImages = computed(() => {
    const p = this.property();
    if (!p) return [];
    return p.imagenes?.length ? p.imagenes : [p.imagen];
  });

  readonly priceLabel = computed(() => {
    const p = this.property();
    if (!p) return '';
    const num = new Intl.NumberFormat('es-PE').format(p.precio);
    return p.tipo === 'alquiler' ? `S/. ${num} / mes` : `$ ${num}`;
  });

  readonly whatsAppLink = computed(() => {
    const p = this.property();
    if (!p?.ownerTelefono) return null;
    return this.propertyService.buildWhatsAppLink(p.ownerTelefono, p.titulo, p.precio, p.tipo);
  });

  readonly contactForm = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    telefono: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]),
    mensaje: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(10)]),
  });

  constructor() {
    effect(() => {
      if (this.property()) {
        this.contactForm.reset();
        this.activeThumb.set(0);
        this.successMessage.set(null);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.isOpen()) this.close(); }

  close(): void { this.modalService.close(); }
  onOverlayClick(event: MouseEvent): void { if (event.target === event.currentTarget) this.close(); }
  selectThumb(index: number): void { this.activeThumb.set(index); }

  shouldShowError(field: string): boolean {
    const ctrl = this.contactForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  errorMessage(field: string): string {
    const ctrl = this.contactForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Este campo es obligatorio.';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors['email']) return 'Ingresa un correo válido.';
    if (ctrl.errors['pattern']) return 'Solo números, entre 6 y 15 dígitos.';
    return 'Campo inválido.';
  }

  onSubmit(): void {
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    const { nombre } = this.contactForm.getRawValue();
    const p = this.property();
    if (p) this.propertyService.trackContactClick(Number(p.id));
    this.successMessage.set(`¡Gracias, ${nombre}! El agente te contactará pronto.`);
    this.contactForm.reset();
  }
}
