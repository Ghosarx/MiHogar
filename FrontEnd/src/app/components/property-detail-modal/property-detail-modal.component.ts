import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ReviewService, ReviewDTO } from '../../services/review.service';

@Component({
  selector: 'app-property-detail-modal',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './property-detail-modal.component.html',
  styleUrl: './property-detail-modal.component.css',
})
export class PropertyDetailModalComponent {
  private readonly modalService = inject(ModalService);
  private readonly propertyService = inject(PropertyService);
  private readonly reviewService = inject(ReviewService);
  readonly authService = inject(AuthService);
  readonly chatService = inject(ChatService);

  readonly property = this.modalService.selected;
  readonly isOpen = this.modalService.isOpen;
  readonly loadingDetail = this.modalService.loading;

  readonly activeThumb = signal(0);

  // Reseñas
  readonly reviews = signal<ReviewDTO[]>([]);
  readonly loadingReviews = signal(false);
  readonly reviewStars = signal(0);       // estrella seleccionada en el picker (0 = ninguna)
  readonly reviewHover = signal(0);       // estrella sobre la que está el cursor
  readonly reviewComentario = signal('');
  readonly submitReviewError = signal<string | null>(null);
  readonly submitReviewOk = signal(false);

  readonly myReview = computed(() => {
    const uid = this.authService.user()?.id;
    return uid ? this.reviews().find(r => r.usuarioId === uid) ?? null : null;
  });

  readonly canReview = computed(() => {
    const p = this.property();
    const user = this.authService.user();
    if (!p || !user) return false;
    if (Number(p.id) === 0) return false;
    return !this.myReview();
  });

  readonly starsArray = [1, 2, 3, 4, 5];

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

  constructor() {
    effect(() => {
      const p = this.property();
      if (p) {
        this.activeThumb.set(0);
        this.loadReviews(Number(p.id));
        this.resetReviewForm();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.isOpen()) this.close(); }

  close(): void { this.modalService.close(); }
  onOverlayClick(event: MouseEvent): void { if (event.target === event.currentTarget) this.close(); }
  selectThumb(index: number): void { this.activeThumb.set(index); }

  ownerIniciales(): string {
    const p = this.property();
    const n = p?.ownerNombre ?? '';
    const a = p?.ownerApellido ?? '';
    return ((n[0] ?? '') + (a[0] ?? '')).toUpperCase() || 'U';
  }

  reviewIniciales(r: ReviewDTO): string {
    return ((r.usuarioNombre[0] ?? '') + (r.usuarioApellido?.[0] ?? '')).toUpperCase() || 'U';
  }

  iniciarChat(): void {
    const p = this.property();
    if (!p || !this.authService.isAuthenticated()) return;
    this.chatService.iniciarChat(Number(p.id), (chat) => {
      this.close();
      this.chatService.abrirChat(chat);
    });
  }

  // ── Rating helpers ────────────────────────────────────────────────────────

  starsRange(n: number): number[] { return Array.from({ length: n }, (_, i) => i + 1); }

  starClass(star: number): 'filled' | 'half' | 'empty' {
    const avg = this.property()?.promedioEstrellas ?? 0;
    if (star <= Math.floor(avg)) return 'filled';
    if (star === Math.ceil(avg) && avg % 1 >= 0.25) return 'half';
    return 'empty';
  }

  pickerClass(star: number): 'active' | 'hover' | '' {
    const h = this.reviewHover();
    const s = this.reviewStars();
    if (h > 0) return star <= h ? 'hover' : '';
    return star <= s ? 'active' : '';
  }

  // ── Reseñas CRUD ──────────────────────────────────────────────────────────

  loadReviews(propiedadId: number): void {
    this.loadingReviews.set(true);
    this.reviewService.getReviews(propiedadId).subscribe({
      next: rs => { this.reviews.set(rs); this.loadingReviews.set(false); },
      error: () => this.loadingReviews.set(false),
    });
  }

  submitReview(): void {
    const stars = this.reviewStars();
    const p = this.property();
    if (!p || stars === 0) { this.submitReviewError.set('Selecciona al menos una estrella.'); return; }
    this.submitReviewError.set(null);

    this.reviewService.crearReview(Number(p.id), stars, this.reviewComentario()).subscribe({
      next: r => {
        this.reviews.update(rs => [r, ...rs]);
        this.submitReviewOk.set(true);
        this.resetReviewForm();
      },
      error: (e) => this.submitReviewError.set(e?.error?.message ?? 'No se pudo enviar la reseña.'),
    });
  }

  deleteReview(id: number): void {
    this.reviewService.eliminarReview(id).subscribe({
      next: () => this.reviews.update(rs => rs.filter(r => r.id !== id)),
      error: () => {},
    });
  }

  private resetReviewForm(): void {
    this.reviewStars.set(0);
    this.reviewHover.set(0);
    this.reviewComentario.set('');
    this.submitReviewOk.set(false);
    this.submitReviewError.set(null);
  }
}
