import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemModalComponent } from './catalog/item-modal.component';
import { CartService } from './core/cart.service';
import { ModalService } from './core/modal.service';
import { StoreService } from './core/store.service';
import { BottomNavComponent } from './layout/bottom-nav.component';
import { CartDrawerComponent } from './layout/cart-drawer.component';
import { FooterComponent } from './layout/footer.component';
import { HeaderComponent } from './layout/header.component';
import { ToastHostComponent } from './layout/toast-host.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BottomNavComponent,
    ToastHostComponent,
    CartDrawerComponent,
    ItemModalComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly store = inject(StoreService);
  readonly cart = inject(CartService);
  readonly modal = inject(ModalService);
  readonly splash = signal(false);
  readonly scrolled = signal(false);
  private splashDecided = false;

  constructor() {
    void this.store.load();
    effect(() => {
      const data = this.store.data();
      const lock = !!this.modal.state() || this.cart.open() || this.splash();
      document.body.style.overflow = lock ? 'hidden' : '';
      if (!data || this.splashDecided) return;
      this.splashDecided = true;
      const onAdmin = window.location.pathname.startsWith('/admin');
      if (!onAdmin && data.settings.splashEnabled && data.settings.splashImage && !sessionStorage.getItem('pizzacrunch.splash')) {
        this.splash.set(true);
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 500);
  }

  closeSplash(): void {
    sessionStorage.setItem('pizzacrunch.splash', '1');
    this.splash.set(false);
  }

  top(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
