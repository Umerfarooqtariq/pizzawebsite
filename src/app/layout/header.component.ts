import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../core/cart.service';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (store.data(); as data) {
      <header class="site-header" [class.scrolled]="scrolled()">
        <a class="brand" routerLink="/">
          <img [src]="data.settings.logo" alt="Pizza Crunch logo">
          <span>
            <strong>{{ data.settings.name }}</strong>
            <small>{{ data.settings.tagline }}</small>
          </span>
        </a>
        <nav class="nav-links" [class.open]="open()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="open.set(false)">Home</a>
          <a routerLink="/menu" routerLinkActive="active" (click)="open.set(false)">Menu</a>
          <a routerLink="/about" routerLinkActive="active" (click)="open.set(false)">About</a>
          <a routerLink="/contact" routerLinkActive="active" (click)="open.set(false)">Contact</a>
        </nav>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="menu-toggle" (click)="open.set(!open())">Menu</button>
          <button type="button" class="cart-btn" [class.bump]="cart.bump()" (click)="cart.open.set(true)">
            Cart
            @if (cart.count()) { <span class="cart-count">{{ cart.count() }}</span> }
          </button>
        </div>
      </header>
    }
  `
})
export class HeaderComponent {
  readonly store = inject(StoreService);
  readonly cart = inject(CartService);
  readonly scrolled = signal(false);
  readonly open = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
