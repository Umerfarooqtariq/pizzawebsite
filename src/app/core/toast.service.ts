import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string): void {
    const id = crypto.randomUUID();
    this.toasts.update((list) => [...list, { id, message }].slice(-3));
    setTimeout(() => this.dismiss(id), 2600);
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
