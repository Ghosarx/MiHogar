import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly chatService = inject(ChatService);
  readonly authService = inject(AuthService);

  @ViewChild('msgList') msgList!: ElementRef<HTMLDivElement>;

  texto = signal('');

  ngOnInit(): void {
    this.chatService.iniciarPoll();
  }

  togglePanel(): void {
    this.chatService.panelAbierto.update(v => !v);
    if (this.chatService.panelAbierto()) this.chatService.cargarChats();
  }

  ngOnDestroy(): void {
    this.chatService.detenerPoll();
  }

  enviar(): void {
    const t = this.texto().trim();
    if (!t || !this.chatService.chatAbierto()) return;
    this.chatService.enviarMensaje(this.chatService.chatAbierto()!.id, t);
    this.texto.set('');
    setTimeout(() => this.scrollBottom(), 100);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.enviar(); }
  }

  scrollBottom(): void {
    const el = this.msgList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  miId(): number | undefined { return this.authService.user()?.id; }

  nombreOtro(chat: any): string {
    return [chat.otroUsuarioNombre, chat.otroUsuarioApellido].filter(Boolean).join(' ');
  }

  iniciales(nombre: string, apellido: string): string {
    return ((nombre?.[0] ?? '') + (apellido?.[0] ?? '')).toUpperCase();
  }
}
