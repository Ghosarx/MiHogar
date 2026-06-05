import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Tag {
  id: number;
  nombre: string;
  categoria: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly API = 'http://localhost:8080/api/tags';
  readonly tags = signal<Tag[]>([]);

  constructor(private http: HttpClient) {
    this.load();
  }

  private load(): void {
    this.http.get<Tag[]>(this.API).subscribe({
      next: (tags) => this.tags.set(tags),
      error: () => {}
    });
  }

  byCategoria(): Record<string, Tag[]> {
    const result: Record<string, Tag[]> = {};
    for (const tag of this.tags()) {
      if (!result[tag.categoria]) result[tag.categoria] = [];
      result[tag.categoria].push(tag);
    }
    return result;
  }
}
