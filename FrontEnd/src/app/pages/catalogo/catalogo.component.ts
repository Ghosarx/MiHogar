import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { ModalService } from '../../services/modal.service';
import { Property, TipoPropiedad } from '../../models/property.model';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ReactiveFormsModule, PropertyCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly propertyService = inject(PropertyService);
  private readonly modalService = inject(ModalService);

  readonly tipo = toSignal(
    this.route.data.pipe(map(d => d['tipo'] as TipoPropiedad)),
    { initialValue: 'venta' as TipoPropiedad },
  );

  readonly titulo = computed(() =>
    this.tipo() === 'venta' ? 'Propiedades en venta' : 'Propiedades en alquiler',
  );

  private readonly initialQuery = this.route.snapshot.queryParamMap;
  private readonly initialPrecioMax = this.initialQuery.get('precioMax');
  private readonly initialUbicacion = this.initialQuery.get('ubicacion');

  readonly filterForm = this.fb.group({
    precioMin: this.fb.control<number | null>(null),
    precioMax: this.fb.control<number | null>(this.initialPrecioMax ? Number(this.initialPrecioMax) : null),
    habitaciones: this.fb.control<number | null>(null),
    banos: this.fb.control<number | null>(null),
    ubicacion: this.fb.nonNullable.control(this.initialUbicacion ?? ''),
  });

  readonly filterValues = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });

  readonly filteredProperties = computed<Property[]>(() => {
    const all = this.propertyService.properties();
    const tipo = this.tipo();
    const f = this.filterValues();
    return all.filter(p => {
      if (p.tipo !== tipo) return false;
      if (f.precioMin && p.precio < f.precioMin) return false;
      if (f.precioMax && p.precio > f.precioMax) return false;
      if (f.habitaciones && p.habitaciones < f.habitaciones) return false;
      if (f.banos && p.banos < f.banos) return false;
      if (f.ubicacion && !p.ubicacion.toLowerCase().includes(f.ubicacion.toLowerCase())) return false;
      return true;
    });
  });

  constructor() {
    // Cada vez que cambia tipo (venta/alquiler) recarga del BackEnd
    effect(() => { this.propertyService.loadProperties(this.tipo()); }, { allowSignalWrites: true });
  }

  resetFilters(): void {
    this.filterForm.reset({ precioMin: null, precioMax: null, habitaciones: null, banos: null, ubicacion: '' });
  }

  onPropertyClick(property: Property): void { this.modalService.open(property); }
}
