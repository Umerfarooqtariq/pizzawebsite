import { Injectable, signal } from '@angular/core';
import { MenuItem, ModalRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly state = signal<ModalRequest | null>(null);

  openItem(item: MenuItem): void {
    this.state.set({ type: 'item', item });
  }

  openBuilder(): void {
    this.state.set({ type: 'builder' });
  }

  close(): void {
    this.state.set(null);
  }
}
