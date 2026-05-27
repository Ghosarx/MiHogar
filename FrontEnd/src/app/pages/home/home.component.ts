import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type TipoBusqueda = 'venta' | 'alquiler';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly searchForm = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoBusqueda>('venta'),
    precioMax: this.fb.control<number | null>(null),
    ubicacion: this.fb.nonNullable.control(''),
  });

  onSubmit(): void {
    const { tipo, precioMax, ubicacion } = this.searchForm.getRawValue();
    const path = tipo === 'venta' ? '/comprar' : '/alquilar';

    const queryParams: Record<string, string | number> = {};
    if (precioMax && precioMax > 0) queryParams['precioMax'] = precioMax;
    const ubicacionTrim = ubicacion.trim();
    if (ubicacionTrim) queryParams['ubicacion'] = ubicacionTrim;

    this.router.navigate([path], { queryParams });
  }
}
