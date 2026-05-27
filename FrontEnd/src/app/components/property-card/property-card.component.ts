import { Component, computed, input, output } from '@angular/core';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
})
export class PropertyCardComponent {
  readonly property = input.required<Property>();
  readonly detailClick = output<Property>();

  readonly badgeLabel = computed(() =>
    this.property().tipo === 'venta' ? 'Venta' : 'Alquiler',
  );

  readonly priceLabel = computed(() => {
    const p = this.property();
    const num = new Intl.NumberFormat('es-PE').format(p.precio);
    return p.tipo === 'alquiler' ? `S/. ${num} / mes` : `$ ${num}`;
  });

  onDetailClick(): void {
    this.detailClick.emit(this.property());
  }
}
