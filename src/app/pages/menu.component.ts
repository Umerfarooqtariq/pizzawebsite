import { Component, computed, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MenuItem } from '../core/models';
import { ModalService } from '../core/modal.service';
import { applyDiscount, basePrice } from '../core/pricing';
import { RsPipe } from '../core/rs.pipe';
import { StoreService } from '../core/store.service';
import { CartService } from '../core/cart.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-menu-page',
  imports: [RsPipe],
  template: `
    @if (store.data(); as data) {
      <div class="page">
        <header class="page-intro">
          <p class="kicker">The board</p>
          <h1>Menu</h1>
          <p class="hint">Tap a dish. Pizzas open crust and size. Deals drop straight into the tray.</p>
        </header>
        @if (store.percent() > 0) {
          <p class="pill off" style="position:static; display:inline-block; margin-bottom:8px;">Flat {{ store.percent() }}% off on the whole menu</p>
        }
        @for (category of categories(); track category.id) {
          <section class="menu-block">
            <h2>{{ category.title }}</h2>
            @for (item of items(category.id); track item.id) {
              <button type="button" class="menu-row" (click)="open(item)">
                <img [src]="item.image" [alt]="item.name">
                <span>
                  <span class="menu-top">
                    <h3>{{ item.name }}</h3>
                    <span class="leader"></span>
                    <strong>{{ price(item) | rs }}</strong>
                  </span>
                  @if (store.percent() > 0) { <s class="was">{{ was(item) | rs }}</s> }
                  <p>{{ item.description }}</p>
                </span>
              </button>
            }
          </section>
        }
      </div>
    }
  `
})
export class MenuComponent {
  readonly store = inject(StoreService);
  private readonly modal = inject(ModalService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  readonly categories = computed(() => {
    const data = this.store.data();
    if (!data) return [];
    return data.categories.filter((category) => data.items.some((item) => item.categoryId === category.id));
  });

  constructor() {
    this.title.setTitle('Menu | Pizza Crunch');
  }

  items(id: string): MenuItem[] {
    return this.store.data()?.items.filter((item) => item.categoryId === id) ?? [];
  }

  was(item: MenuItem): number {
    return basePrice(item);
  }

  price(item: MenuItem): number {
    return applyDiscount(basePrice(item), this.store.percent());
  }

  open(item: MenuItem): void {
    if (item.kind === 'simple') {
      this.cart.add({ itemId: item.id, name: item.name, image: item.image, qty: 1, baseUnit: item.price, options: [], note: '' });
      this.toast.show(`${item.name} added to cart`);
      return;
    }
    this.modal.openItem(item);
  }
}
