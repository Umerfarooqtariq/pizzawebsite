import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-about',
  imports: [],
  template: `
    @if (store.data(); as data) {
      <div class="page">
        <header class="page-intro">
          <p class="kicker">{{ data.settings.tagline }}</p>
          <h1>About us</h1>
        </header>
        <div class="split">
          <div class="prose">{{ data.settings.about }}</div>
          <div>
            <img src="/images/banner-collage.jpg" alt="Pizza Crunch kitchen spread" style="border-radius:20px; margin-bottom:12px;">
            <img src="/images/logo-mark.jpg" alt="Pizza Crunch mark" style="border-radius:20px;">
          </div>
        </div>
      </div>
    }
  `
})
export class AboutComponent {
  readonly store = inject(StoreService);
  constructor() {
    inject(Title).setTitle('About | Pizza Crunch');
  }
}
