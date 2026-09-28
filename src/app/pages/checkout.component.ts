import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CartService } from '../core/cart.service';
import { RsPipe } from '../core/rs.pipe';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink, RsPipe],
  template: `
    <div class="page">
      <p class="kicker">WhatsApp order</p>
      <h1 style="font-size:64px;">Checkout</h1>
      <p class="hint">This opens WhatsApp with the full cart already written. You tap Send, and the order arrives on the Pizza Crunch number.</p>
      @if (!cart.lines().length) {
        <p>Your tray is empty.</p>
        <a class="btn-gold" routerLink="/">Back to the menu</a>
      } @else {
        <div class="checkout">
          <form class="form-grid panel" (ngSubmit)="place()">
            <label>Name<input name="name" [(ngModel)]="name" required></label>
            <label>Phone<input name="phone" [(ngModel)]="phone" required></label>
            <label>Delivery address<textarea name="address" [(ngModel)]="address" required></textarea></label>
            <label>Note for the kitchen<textarea name="note" [(ngModel)]="note"></textarea></label>
            @if (error()) { <p class="warn">{{ error() }}</p> }
            <button class="btn-gold" type="submit">Send order on WhatsApp</button>
            @if (link()) {
              <a class="btn-ghost" style="text-align:center" [href]="link()" target="_blank" rel="noopener">Open WhatsApp again</a>
              <p class="hint">WhatsApp should be open. Tap Send there. The kitchen sees your name, number, address, and every item.</p>
            }
          </form>
          <aside class="panel">
            @for (line of cart.lines(); track line.lineId) {
              <div>
                <strong>{{ line.qty }} × {{ line.name }}</strong>
                <div class="muted">{{ line.options.join(' · ') }}</div>
                <div>{{ (cart.unit(line) * line.qty) | rs }}</div>
              </div>
            }
            <hr style="border-color:rgba(255,255,255,.08); width:100%;">
            <div style="display:flex; justify-content:space-between;">
              <span>Total</span>
              <strong class="total-lg">{{ cart.total() | rs }}</strong>
            </div>
            @if (store.percent() > 0) { <p class="hint">Flat {{ store.percent() }}% off is already in these prices.</p> }
          </aside>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  readonly store = inject(StoreService);
  name = '';
  phone = '';
  address = '';
  note = '';
  readonly error = signal('');
  readonly link = signal('');

  constructor() {
    inject(Title).setTitle('Checkout | Pizza Crunch');
  }

  place(): void {
    if (!this.name.trim() || !this.phone.trim() || !this.address.trim()) {
      this.error.set('Name, phone, and address are needed so the rider can find you.');
      return;
    }
    this.error.set('');
    const url = this.cart.whatsappLink({
      name: this.name.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      note: this.note.trim()
    });
    this.link.set(url);
    window.open(url, '_blank', 'noopener');
  }
}
