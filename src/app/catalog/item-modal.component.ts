import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { CartService } from '../core/cart.service';
import { Extra, MenuItem } from '../core/models';
import { ModalService } from '../core/modal.service';
import { applyDiscount, formatRs } from '../core/pricing';
import { RsPipe } from '../core/rs.pipe';
import { StoreService } from '../core/store.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-item-modal',
  imports: [RsPipe],
  templateUrl: './item-modal.component.html'
})
export class ItemModalComponent {
  readonly modal = inject(ModalService);
  readonly store = inject(StoreService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly crustId = signal('');
  readonly flavorId = signal('');
  readonly sizeId = signal('');
  readonly toppingIds = signal<string[]>([]);
  readonly qty = signal(1);
  readonly note = signal('');

  constructor() {
    effect(() => {
      const request = this.modal.state();
      if (!request) return;
      this.crustId.set('');
      this.sizeId.set('');
      this.toppingIds.set([]);
      this.qty.set(1);
      this.note.set('');
      this.flavorId.set(request.type === 'item' && request.item.kind === 'pizza' ? request.item.id : '');
    });
  }

  readonly mode = computed(() => {
    const request = this.modal.state();
    if (!request) return '';
    return request.type === 'builder' ? 'builder' : request.item.kind;
  });

  readonly flavor = computed<MenuItem | null>(() => {
    const data = this.store.data();
    const request = this.modal.state();
    if (!data || !request) return null;
    if (request.type === 'item') return request.item;
    return data.items.find((item) => item.id === this.flavorId()) ?? null;
  });

  readonly pizzas = computed(() => this.store.data()?.items.filter((item) => item.categoryId === 'pizza') ?? []);

  readonly photo = computed(() => this.flavor()?.image || '/images/crown.jpg');
  readonly title = computed(() => this.mode() === 'builder' ? 'Create Your Own Pizza' : (this.flavor()?.name || 'Pizza'));

  readonly base = computed(() => {
    const data = this.store.data();
    const item = this.flavor();
    if (!data || !item) return 0;
    const size = item.sizes?.find((entry) => entry.id === this.sizeId());
    const sizePrice = size ? Number(size.price) : (item.kind === 'simple' ? Number(item.price) : 0);
    let crustPrice = 0;
    if (this.mode() === 'pizza' || this.mode() === 'builder') {
      const crust = data.crusts.find((entry) => entry.id === this.crustId());
      crustPrice = crust && !(crust.id === 'crown' && item.id === 'crown-crust') ? Number(crust.price) : 0;
    }
    const toppingPrice = data.toppings
      .filter((entry) => entry.id !== 'none' && this.toppingIds().includes(entry.id))
      .reduce((sum, entry) => sum + Number(entry.price), 0);
    return sizePrice + crustPrice + toppingPrice;
  });

  readonly ready = computed(() => {
    const mode = this.mode();
    if (mode === 'sized') return !!this.sizeId();
    if (mode === 'pizza') return !!this.crustId() && !!this.sizeId();
    if (mode === 'builder') return !!this.crustId() && !!this.flavorId() && !!this.sizeId();
    return !!this.flavor();
  });

  readonly hint = computed(() => {
    const mode = this.mode();
    if (this.ready()) return '';
    if ((mode === 'pizza' || mode === 'builder') && !this.crustId()) return 'Select a crust to continue.';
    if (mode === 'builder' && !this.flavorId()) return 'Select a flavour.';
    if (!this.sizeId()) return 'Select a size.';
    return '';
  });

  now(price: number): number {
    return applyDiscount(price, this.store.percent());
  }

  showSizes(): boolean {
    const item = this.flavor();
    if (!item?.sizes?.length) return false;
    if (this.mode() === 'sized') return true;
    if (this.mode() === 'pizza') return !!this.crustId();
    if (this.mode() === 'builder') return !!this.crustId() && !!this.flavorId();
    return false;
  }

  showToppings(): boolean {
    return (this.mode() === 'pizza' || this.mode() === 'builder') && !!this.sizeId();
  }

  sizeStepOn(): boolean {
    if (this.mode() === 'sized') return !this.sizeId();
    if (this.mode() === 'builder') return !!this.flavorId() && !this.sizeId();
    return !!this.crustId() && !this.sizeId();
  }

  money(price: number): string {
    return formatRs(this.now(price));
  }

  crustLabel(crust: Extra): string {
    const item = this.flavor();
    if (!crust.price || (crust.id === 'crown' && item?.id === 'crown-crust')) return 'Included';
    return `+ ${this.money(crust.price)}`;
  }

  pickCrust(id: string): void {
    this.crustId.set(id);
  }

  pickFlavor(id: string): void {
    this.flavorId.set(id);
    this.sizeId.set('');
  }

  pickSize(id: string): void {
    this.sizeId.set(id);
  }

  toggleTopping(id: string): void {
    if (id === 'none') {
      this.toppingIds.set([]);
      return;
    }
    this.toppingIds.update((list) => list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]);
  }

  toppingOn(id: string): boolean {
    if (id === 'none') return this.toppingIds().length === 0;
    return this.toppingIds().includes(id);
  }

  onNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value.slice(0, 150));
  }

  add(): void {
    const item = this.flavor();
    const data = this.store.data();
    if (!item || !data || !this.ready()) return;
    const options: string[] = [];
    if (this.mode() === 'pizza' || this.mode() === 'builder') {
      const crust = data.crusts.find((entry) => entry.id === this.crustId());
      if (crust) options.push(`Crust: ${crust.name}`);
      const names = data.toppings.filter((entry) => this.toppingIds().includes(entry.id)).map((entry) => entry.name);
      options.push(`Toppings: ${names.length ? names.join(', ') : 'None'}`);
    }
    const size = item.sizes?.find((entry) => entry.id === this.sizeId());
    if (size) options.push(`Size: ${size.name}`);
    const name = this.mode() === 'builder' ? `${item.name}` : item.name;
    this.cart.add({
      itemId: item.id,
      name,
      image: item.image,
      qty: this.qty(),
      baseUnit: this.base(),
      options,
      note: this.note().trim()
    });
    this.toast.show(`${name} added to cart`);
    this.modal.close();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (this.modal.state()) this.modal.close();
  }
}
