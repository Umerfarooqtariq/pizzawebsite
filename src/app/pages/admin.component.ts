import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../core/auth.service';
import { Banner, Category, Extra, MenuItem, Settings, SocialPost } from '../core/models';
import { clampDiscount, readImageFile, sha256, uid } from '../core/pricing';
import { StoreService } from '../core/store.service';
import { ToastService } from '../core/toast.service';

type Tab = 'shop' | 'menu' | 'banners' | 'options' | 'backup';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  readonly store = inject(StoreService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly tab = signal<Tab>('shop');
  ready = false;
  shop!: Settings;
  phonesText = '';
  newUser = '';
  newPass = '';
  categories: Category[] = [];
  banners: Banner[] = [];
  posts: SocialPost[] = [];
  crusts: Extra[] = [];
  toppings: Extra[] = [];
  filter = 'all';
  draft: MenuItem | null = null;
  newCategory = '';

  constructor() {
    inject(Title).setTitle('Menu editor | Pizza Crunch');
    effect(() => {
      if (this.store.data() && !this.ready) this.pull();
    });
  }

  pull(): void {
    const data = this.store.data();
    if (!data) return;
    this.shop = structuredClone(data.settings);
    this.phonesText = data.settings.phones.join('\n');
    this.categories = structuredClone(data.categories);
    this.banners = structuredClone(data.banners);
    this.posts = structuredClone(data.posts);
    this.crusts = structuredClone(data.crusts);
    this.toppings = structuredClone(data.toppings);
    this.ready = true;
  }

  setDiscount(value: number): void {
    const discountPercent = clampDiscount(value);
    this.shop.discountPercent = discountPercent;
    this.store.update((data) => ({ ...data, settings: { ...data.settings, discountPercent } }));
  }

  async saveShop(): Promise<void> {
    const settings = structuredClone(this.shop);
    settings.phones = this.phonesText.split(/\n|,/).map((phone) => phone.trim()).filter(Boolean);
    settings.discountPercent = clampDiscount(settings.discountPercent);
    if (this.newUser.trim()) settings.adminUserHash = await sha256(this.newUser.trim());
    if (this.newPass) settings.adminPassHash = await sha256(this.newPass);
    this.shop = settings;
    this.newUser = '';
    this.newPass = '';
    this.store.update((data) => ({ ...data, settings }));
    this.toast.show('Shop settings saved in this browser');
  }

  async logoImage(event: Event): Promise<void> {
    await this.onImage(event, (url) => { this.shop.logo = url; });
  }

  async splashImage(event: Event): Promise<void> {
    await this.onImage(event, (url) => { this.shop.splashImage = url; });
  }

  async bannerImage(event: Event, banner: Banner): Promise<void> {
    await this.onImage(event, (url) => { banner.image = url; });
  }

  async postImage(event: Event, post: SocialPost): Promise<void> {
    await this.onImage(event, (url) => { post.image = url; });
  }

  async itemImage(event: Event): Promise<void> {
    await this.onImage(event, (url) => { if (this.draft) this.draft.image = url; });
  }

  removeBanner(index: number): void { this.banners.splice(index, 1); }
  removePost(index: number): void { this.posts.splice(index, 1); }
  removeCrust(index: number): void { this.crusts.splice(index, 1); }
  removeTopping(index: number): void { this.toppings.splice(index, 1); }

  async onImage(event: Event, apply: (url: string) => void): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      apply(await readImageFile(file));
      this.toast.show('Photo attached. Save this section, then download a backup.');
    } catch {
      this.toast.show('That photo could not be read');
    }
  }

  saveSections(): void {
    this.store.update((data) => ({ ...data, categories: this.categories }));
    this.toast.show('Sections saved in this browser');
  }

  addCategory(): void {
    const name = this.newCategory.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('cat');
    this.categories = [...this.categories, { id, name, kicker: name, title: name, subtitle: '' }];
    this.newCategory = '';
    this.saveSections();
  }

  removeCategory(id: string): void {
    const count = this.store.data()?.items.filter((item) => item.categoryId === id).length ?? 0;
    if (count) {
      this.toast.show('Delete or move its items first.');
      return;
    }
    this.categories = this.categories.filter((category) => category.id !== id);
    this.saveSections();
  }

  moveCategory(index: number, dir: number): void {
    const next = index + dir;
    if (next < 0 || next >= this.categories.length) return;
    const copy = [...this.categories];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row);
    this.categories = copy;
    this.saveSections();
  }

  visibleItems(): MenuItem[] {
    const items = this.store.data()?.items ?? [];
    return this.filter === 'all' ? items : items.filter((item) => item.categoryId === this.filter);
  }

  newItem(): void {
    this.draft = {
      id: uid('item'),
      name: '',
      description: '',
      categoryId: this.filter === 'all' ? (this.categories[0]?.id || 'deals') : this.filter,
      price: 0,
      image: '/images/logo.png',
      kind: 'simple',
      popular: false,
      sizes: []
    };
  }

  editItem(item: MenuItem): void {
    this.draft = structuredClone(item);
    this.draft.sizes = this.draft.sizes ? [...this.draft.sizes] : [];
  }

  kindChanged(kind: MenuItem['kind']): void {
    if (!this.draft) return;
    this.draft.kind = kind;
    if (kind !== 'simple' && !this.draft.sizes?.length) {
      this.draft.sizes = ['Small', 'Medium', 'Large', 'Extra Large', 'Jumbo'].map((name) => ({
        id: uid('size'),
        name,
        price: Number(this.draft?.price) || 0
      }));
    }
  }

  addSize(): void {
    this.draft?.sizes?.push({ id: uid('size'), name: 'New size', price: 0 });
  }

  removeSize(index: number): void {
    this.draft?.sizes?.splice(index, 1);
  }

  saveItem(): void {
    if (!this.draft?.name.trim()) {
      this.toast.show('Item needs a name');
      return;
    }
    const item: MenuItem = {
      ...this.draft,
      price: Number(this.draft.price) || 0,
      sizes: (this.draft.sizes || []).map((size) => ({ ...size, price: Number(size.price) || 0 }))
    };
    this.store.update((data) => ({
      ...data,
      categories: this.categories,
      items: data.items.some((entry) => entry.id === item.id)
        ? data.items.map((entry) => entry.id === item.id ? item : entry)
        : [...data.items, item]
    }));
    this.toast.show(`${item.name} saved in this browser`);
  }

  removeItem(id: string): void {
    if (!confirm('Delete this item?')) return;
    this.store.update((data) => ({ ...data, items: data.items.filter((item) => item.id !== id) }));
    if (this.draft?.id === id) this.draft = null;
    this.toast.show('Item deleted in this browser');
  }

  saveBanners(): void {
    this.store.update((data) => ({
      ...data,
      banners: this.banners,
      posts: this.posts,
      settings: { ...data.settings, splashEnabled: this.shop.splashEnabled, splashImage: this.shop.splashImage, logo: this.shop.logo }
    }));
    this.toast.show('Images saved in this browser');
  }

  addBanner(): void {
    this.banners = [...this.banners, { id: uid('banner'), image: '/images/banner-fire.jpg', kicker: 'Pizza Crunch', title: 'New banner', subtitle: '' }];
  }

  moveBanner(index: number, dir: number): void {
    const next = index + dir;
    if (next < 0 || next >= this.banners.length) return;
    const copy = [...this.banners];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row);
    this.banners = copy;
  }

  addPost(): void {
    this.posts = [...this.posts, { id: uid('post'), image: '/images/banner-fire.jpg', caption: 'New post', url: 'https://www.instagram.com/pizzacrunchrwp/' }];
  }

  saveOptions(): void {
    const crusts = this.crusts.map((entry) => ({ ...entry, price: Number(entry.price) || 0 }));
    const toppings = this.toppings.map((entry) => ({ ...entry, price: Number(entry.price) || 0 }));
    this.crusts = crusts;
    this.toppings = toppings;
    this.store.update((data) => ({ ...data, crusts, toppings }));
    this.toast.show('Crusts and toppings saved');
  }

  addExtra(list: 'crusts' | 'toppings'): void {
    const row = { id: uid(list), name: 'New option', price: 0 };
    if (list === 'crusts') this.crusts = [...this.crusts, row];
    else this.toppings = [...this.toppings, row];
  }

  download(): void {
    this.store.download();
  }

  async onDump(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      this.store.importDump(await file.text());
      this.ready = false;
      this.pull();
      this.toast.show('Backup loaded in this browser');
    } catch {
      this.toast.show('That file is not a Pizza Crunch backup');
    }
  }

  async resetFile(): Promise<void> {
    if (!confirm('Drop browser changes and load the file that is deployed with the site?')) return;
    this.ready = false;
    this.draft = null;
    await this.store.useDeployedFile();
    this.pull();
    this.toast.show('Loaded the deployed menu file');
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
