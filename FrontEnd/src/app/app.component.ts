import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { PropertyDetailModalComponent } from './components/property-detail-modal/property-detail-modal.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, PropertyDetailModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Inyectar ThemeService aquí garantiza que el tema se aplique
  // desde el primer render, antes de que cargue cualquier página
  readonly themeService = inject(ThemeService);
}
