import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { RsPipe } from '../core/rs.pipe';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, RsPipe],
  template: `
    @if (cart.open()) {
      <div class="drawer-back" (click)="cart.open.set(false)">
        <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-label="Your cart">
          <header>
            <h2>Your tray</h2>
            <button type="button" class="icon-x" style="position:static" (click)="cart.open.set(false)">×</button>
          </header>
          <div class="drawer-lines">
            @if (!cart.lines().length) {
              <p class="hint">The tray is empty. Add a deal or a pizza.</p>
            }
            @for (line of cart.lines(); track line.lineId) {
              <article class="line">
                <img [src]="line.image" [alt]="line.name">
                <div>
                  <h3>{{ line.name }}</h3>
                  @for (option of line.options; track option) { <p>{{ option }}</p> }
                  @if (line.note) { <p>Note: {{ line.note }}</p> }
                  <div class="qty">
                    <button type="button" (click)="cart.setQty(line.lineId, line.qty - 1)">−</button>
                    <span>{{ line.qty }}</span>
                    <button type="button" (click)="cart.setQty(line.lineId, line.qty + 1)">+</button>
                    <strong class="total-lg" style="font-size:16px">{{ (cart.unit(line) * line.qty) | rs }}</strong>
                  </div>
                </div>
              </article>
            }
          </div>
          <footer>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span>Total</span>
              <strong class="total-lg">{{ cart.total() | rs }}</strong>
            </div>
            <a class="btn-gold" style="text-align:center" routerLink="/checkout" (click)="cart.open.set(false)">Checkout on WhatsApp</a>
          </footer>
        </aside>
      </div>
    }
  `
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
}
