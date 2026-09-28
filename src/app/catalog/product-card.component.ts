import { Component, computed, inject, input } from '@angular/core';
import { CartService } from '../core/cart.service';
import { MenuItem } from '../core/models';
import { ModalService } from '../core/modal.service';
import { applyDiscount, basePrice } from '../core/pricing';
import { RevealDirective } from '../core/reveal.directive';
import { RsPipe } from '../core/rs.pipe';
import { StoreService } from '../core/store.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-product-card',
  imports: [RsPipe, RevealDirective],
  template: `
    <article class="card" appReveal (click)="onCard()">
      <div class="pills">
        @if (store.percent() > 0) { <span class="pill off">{{ store.percent() }}% OFF</span> }
        @if (item().popular) { <span class="pill pop">Popular</span> }
      </div>
      <img [src]="item().image" [alt]="item().name" (error)="fallback($event)">
      <div class="card-body">
        <h3>{{ item().name }}</h3>
        <p>{{ item().description }}</p>
        <div class="price-row">
          @if (quote().from) { <span class="from">from</span> }
          <strong>{{ quote().now | rs }}</strong>
          @if (store.percent() > 0) { <s>{{ quote().was | rs }}</s> }
        </div>
        <button type="button" class="btn-gold" (click)="onAdd($event)">Add to Cart</button>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  readonly item = input.required<MenuItem>();
  readonly store = inject(StoreService);
  private readonly cart = inject(CartService);
  private readonly modal = inject(ModalService);
  private readonly toast = inject(ToastService);

  readonly quote = computed(() => {
    const was = basePrice(this.item());
    return { was, now: applyDiscount(was, this.store.percent()), from: (this.item().sizes?.length ?? 0) > 1 };
  });

  onCard(): void {
    if (this.item().kind !== 'simple') this.modal.openItem(this.item());
  }

  onAdd(event: Event): void {
    event.stopPropagation();
    const item = this.item();
    if (item.kind !== 'simple') {
      this.modal.openItem(item);
      return;
    }
    this.cart.add({ itemId: item.id, name: item.name, image: item.image, qty: 1, baseUnit: item.price, options: [], note: '' });
    this.toast.show(`${item.name} added to cart`);
  }

  fallback(event: Event): void {
    (event.target as HTMLImageElement).src = '/images/logo.png';
  }
}
