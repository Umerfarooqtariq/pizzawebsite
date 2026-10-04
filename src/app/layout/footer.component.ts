import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    @if (store.data(); as data) {
      <footer class="site-footer">
        <div class="foot-grid">
          <div>
            <h3>{{ data.settings.name }}</h3>
            <p>{{ data.settings.bio }}</p>
          </div>
          <div>
            <h3>Visit</h3>
            <p>{{ data.settings.address }}</p>
            <p><a routerLink="/contact">Open the map</a></p>
          </div>
          <div>
            <h3>Hours</h3>
            <p>{{ data.settings.hours }}</p>
            <ul>
              @for (phone of data.settings.phones; track phone) {
                <li><a [href]="'tel:' + phone">{{ phone }}</a></li>
              }
            </ul>
          </div>
          <div>
            <h3>Follow</h3>
            <ul>
              <li><a [href]="data.settings.instagram" target="_blank" rel="noopener">Instagram</a></li>
              <li><a [href]="data.settings.facebook" target="_blank" rel="noopener">Facebook</a></li>
              <li><a [href]="data.settings.tiktok" target="_blank" rel="noopener">TikTok</a></li>
              <li><a [href]="data.settings.foodpanda" target="_blank" rel="noopener">foodpanda</a></li>
              <li><a [href]="'https://wa.me/' + data.settings.whatsapp" target="_blank" rel="noopener">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div class="legal">
          <span>© {{ year }} {{ data.settings.name }}.</span>
          <a class="staff" routerLink="/admin/login">Login</a>
        </div>
      </footer>
    }
  `
})
export class FooterComponent {
  readonly store = inject(StoreService);
  readonly year = new Date().getFullYear();
}
