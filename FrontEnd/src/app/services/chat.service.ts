import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface ChatDTO {
  id: number;
  otroUsuarioId: number;
  otroUsuarioNombre: string;
  otroUsuarioApellido: string;
  otroUsuarioFoto: string | null;
  propiedadId: number | null;
  propiedadTitulo: string | null;
  ultimoMensaje: string | null;
  ultimoMensajeEn: string | null;
  noLeidos: number;
  creadoEn: string;
}

export interface MessageDTO {
  id: number;
  remitenteId: number;
  remitenteNombre: string;
  contenido: string;
  leido: boolean;
  enviadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = 'http://localhost:8080/api/chat';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly chats = signal<ChatDTO[]>([]);
  readonly chatAbierto = signal<ChatDTO | null>(null);
  readonly mensajes = signal<MessageDTO[]>([]);
  readonly panelAbierto = signal(false);
  readonly loadingMensajes = signal(false);

  readonly totalNoLeidos = computed(() => this.chats().reduce((s, c) => s + c.noLeidos, 0));

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private msgPollInterval: ReturnType<typeof setInterval> | null = null;

  cargarChats(): void {
    if (!this.authService.isAuthenticated()) return;
    this.http.get<ChatDTO[]>(this.API).subscribe({ next: c => this.chats.set(c), error: () => {} });
  }

  iniciarChat(propiedadId: number, callback: (chat: ChatDTO) => void): void {
    this.http.post<ChatDTO>(`${this.API}/iniciar?propiedadId=${propiedadId}`, {}).subscribe({
      next: (chat) => {
        this.cargarChats();
        callback(chat);
      },
      error: () => {}
    });
  }

  abrirChat(chat: ChatDTO): void {
    this.chatAbierto.set(chat);
    this.panelAbierto.set(true);
    this.cargarMensajes(chat.id);
    this.iniciarPollMensajes(chat.id);
    this.marcarLeidos(chat.id);
  }

  cerrarChat(): void {
    this.chatAbierto.set(null);
    this.mensajes.set([]);
    this.detenerPollMensajes();
  }

  cerrarPanel(): void {
    this.cerrarChat();
    this.panelAbierto.set(false);
  }

  cargarMensajes(chatId: number): void {
    this.loadingMensajes.set(true);
    this.http.get<MessageDTO[]>(`${this.API}/${chatId}/mensajes`).subscribe({
      next: m => { this.mensajes.set(m); this.loadingMensajes.set(false); },
      error: () => this.loadingMensajes.set(false)
    });
  }

  enviarMensaje(chatId: number, contenido: string): void {
    this.http.post<MessageDTO>(`${this.API}/${chatId}/mensajes`, { contenido }).subscribe({
      next: msg => this.mensajes.update(ms => [...ms, msg]),
      error: () => {}
    });
  }

  marcarLeidos(chatId: number): void {
    this.http.post(`${this.API}/${chatId}/leer`, {}).subscribe({
      next: () => this.chats.update(cs => cs.map(c => c.id === chatId ? { ...c, noLeidos: 0 } : c)),
      error: () => {}
    });
  }

  iniciarPoll(): void {
    this.cargarChats();
    this.pollInterval = setInterval(() => this.cargarChats(), 10000);
  }

  detenerPoll(): void {
    if (this.pollInterval) { clearInterval(this.pollInterval); this.pollInterval = null; }
  }

  private iniciarPollMensajes(chatId: number): void {
    this.detenerPollMensajes();
    this.msgPollInterval = setInterval(() => {
      if (this.chatAbierto()?.id === chatId) this.cargarMensajes(chatId);
    }, 4000);
  }

  private detenerPollMensajes(): void {
    if (this.msgPollInterval) { clearInterval(this.msgPollInterval); this.msgPollInterval = null; }
  }
}
