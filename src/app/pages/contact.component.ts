import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-contact',
  template: `
    @if (store.data(); as data) {
      <div class="page">
        <header class="page-intro">
          <p class="kicker">Find the kitchen</p>
          <h1>Contact</h1>
        </header>
        <div class="split">
          <div class="panel">
            <p class="kicker">Address</p>
            <h2 style="font-size:42px;">Visit</h2>
            <p>{{ data.settings.address }}</p>
            <p>{{ data.settings.hours }}</p>
            <div class="contact-actions">
              @for (phone of data.settings.phones; track phone) {
                <a class="btn-ghost" [href]="'tel:' + phone">{{ phone }}</a>
              }
              <a class="btn-gold" [href]="'https://wa.me/' + data.settings.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
              <a class="btn-ghost" [href]="data.settings.foodpanda" target="_blank" rel="noopener">foodpanda</a>
            </div>
          </div>
          <div class="map-card">
            <iframe [src]="map()" title="Pizza Crunch on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    }
  `
})
export class ContactComponent {
  readonly store = inject(StoreService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly map = computed<SafeResourceUrl>(() => {
    const query = this.store.data()?.settings.mapQuery || 'Pizza Crunch Rawalpindi';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`
    );
  });

  constructor() {
    inject(Title).setTitle('Contact | Pizza Crunch');
  }
}
