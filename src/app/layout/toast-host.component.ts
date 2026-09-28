import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of toast.toasts(); track toast.id) {
        <div class="toast">{{ toast.message }}</div>
      }
    </div>
  `
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
