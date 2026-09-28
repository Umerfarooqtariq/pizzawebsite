import { AfterViewInit, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProductCardComponent } from '../catalog/product-card.component';
import { ModalService } from '../core/modal.service';
import { RevealDirective } from '../core/reveal.directive';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-home',
  imports: [ProductCardComponent, RevealDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(StoreService);
  readonly modal = inject(ModalService);
  private readonly title = inject(Title);
  readonly index = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private spy?: IntersectionObserver;
  private hovering = false;

  readonly categories = computed(() => {
    const data = this.store.data();
    if (!data) return [];
    return data.categories.filter((category) => data.items.some((item) => item.categoryId === category.id));
  });

  readonly banners = computed(() => this.store.data()?.banners ?? []);
  readonly posts = computed(() => this.store.data()?.posts ?? []);
  readonly marquee = computed(() => {
    const posts = this.posts();
    return [...posts, ...posts].map((post, index) => ({ ...post, key: `${post.id}-${index}` }));
  });

  constructor() {
    this.title.setTitle('Pizza Crunch | Rawalpindi');
  }

  ngAfterViewInit(): void {
    this.play();
    this.spy = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) this.store.activeSection.set(visible.target.id);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] });
    document.querySelectorAll('section.section').forEach((section) => this.spy?.observe(section));
  }

  ngOnDestroy(): void {
    this.stop();
    this.spy?.disconnect();
  }

  items(categoryId: string) {
    return this.store.data()?.items.filter((item) => item.categoryId === categoryId) ?? [];
  }

  play(): void {
    this.stop();
    if (this.hovering) return;
    this.timer = setInterval(() => this.go(1, false), 4000);
  }

  pause(): void {
    this.hovering = true;
    this.stop();
  }

  resume(): void {
    this.hovering = false;
    this.play();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  go(dir: number, manual: boolean): void {
    const total = this.banners().length;
    if (!total) return;
    this.index.update((current) => (current + dir + total) % total);
    if (manual) this.play();
  }

  jump(i: number): void {
    this.index.set(i);
    this.play();
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.store.activeSection.set(id);
  }
}
