import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PropertyService, PropertySummary } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';

type TabPanel = 'todas' | 'venta' | 'alquiler';

@Component({
  selector: 'app-mi-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-panel.component.html',
  styleUrl: './mi-panel.component.css',
})
export class MiPanelComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly propertyService = inject(PropertyService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly tab = signal<TabPanel>('todas');
  readonly properties = signal<PropertySummary[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly confirmDeleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProperties();
  }

  setTab(tab: TabPanel): void {
    this.tab.set(tab);
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    const tipo = this.tab() === 'todas' ? undefined : this.tab();
    this.userService.getMyProperties(tipo).subscribe({
      next: (page) => { this.properties.set(page.content); this.loading.set(false); },
      error: () => { this.errorMsg.set('Error al cargar propiedades.'); this.loading.set(false); }
    });
  }

  editProperty(id: number): void {
    this.router.navigate(['/publicar', 'editar', id]);
  }

  askDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.propertyService.delete(id).subscribe({
      next: () => {
        this.properties.update(list => list.filter(p => p.id !== id));
        this.confirmDeleteId.set(null);
        this.successMsg.set('Propiedad eliminada correctamente.');
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: () => {
        this.confirmDeleteId.set(null);
        this.errorMsg.set('Error al eliminar la propiedad.');
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Activa', PENDING: 'Pendiente', REJECTED: 'Rechazada', SOLD: 'Vendida'
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'badge--active', PENDING: 'badge--pending',
      REJECTED: 'badge--rejected', SOLD: 'badge--sold'
    };
    return map[status] ?? '';
  }

  formatPrice(precio: number, tipo: string): string {
    const num = new Intl.NumberFormat('es-PE').format(precio);
    return tipo === 'alquiler' ? `S/. ${num}/mes` : `$ ${num}`;
  }
}
