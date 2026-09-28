import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
      <a routerLink="/menu" routerLinkActive="active">Menu</a>
      <a routerLink="/contact" routerLinkActive="active">Contact</a>
      <a routerLink="/checkout" routerLinkActive="active">Cart {{ cart.count() ? '(' + cart.count() + ')' : '' }}</a>
    </nav>
  `
})
export class BottomNavComponent {
  readonly cart = inject(CartService);
}
