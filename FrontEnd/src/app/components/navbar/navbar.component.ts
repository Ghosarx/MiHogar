import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly menuOpen = signal(false);

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  logout(): void { this.authService.logout(); this.closeMenu(); }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768 && this.menuOpen()) this.closeMenu();
  }
}
