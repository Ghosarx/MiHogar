import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Property } from '../models/property.model';
import { PropertyService } from './property.service';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly propertyService = inject(PropertyService);
  private readonly _selected = signal<Property | null>(null);
  readonly loading = signal(false);

  readonly selected = this._selected.asReadonly();
  readonly isOpen = computed(() => this._selected() !== null);

  constructor() {
    effect(() => {
      const open = this._selected() !== null;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });
  }

  open(property: Property): void {
    // Abre inmediatamente con los datos del catálogo
    this._selected.set(property);
    // Luego enriquece con el detalle completo del BackEnd (amenidades, fotos, owner)
    this.loading.set(true);
    this.propertyService.loadDetail(Number(property.id)).subscribe({
      next: (detail) => {
        this._selected.set(this.propertyService.detailToLocal(detail));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  close(): void { this._selected.set(null); }
}
