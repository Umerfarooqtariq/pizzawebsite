import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine, CheckoutDetails } from './models';
import { applyDiscount, formatRs } from './pricing';
import { StoreService } from './store.service';

const KEY = 'pizzacrunch.cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly store = inject(StoreService);
  readonly lines = signal<CartLine[]>(this.read());
  readonly open = signal(false);
  readonly bump = signal(false);

  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));
  readonly total = computed(() => {
    const percent = this.store.percent();
    return this.lines().reduce((sum, line) => sum + applyDiscount(line.baseUnit, percent) * line.qty, 0);
  });

  add(line: Omit<CartLine, 'lineId'>): void {
    const signature = `${line.itemId}|${line.options.join('|')}|${line.note}|${line.baseUnit}`;
    this.lines.update((list) => {
      const index = list.findIndex((entry) =>
        `${entry.itemId}|${entry.options.join('|')}|${entry.note}|${entry.baseUnit}` === signature);
      if (index === -1) {
        return [...list, { ...line, lineId: crypto.randomUUID() }];
      }
      return list.map((entry, i) => i === index ? { ...entry, qty: entry.qty + line.qty } : entry);
    });
    this.persist();
    this.flash();
  }

  setQty(lineId: string, qty: number): void {
    this.lines.update((list) => list.flatMap((line) => {
      if (line.lineId !== lineId) return [line];
      if (qty <= 0) return [];
      return [{ ...line, qty }];
    }));
    this.persist();
  }

  remove(lineId: string): void {
    this.lines.update((list) => list.filter((line) => line.lineId !== lineId));
    this.persist();
  }

  clear(): void {
    this.lines.set([]);
    this.persist();
  }

  unit(line: CartLine): number {
    return applyDiscount(line.baseUnit, this.store.percent());
  }

  whatsappLink(details: CheckoutDetails): string {
    const settings = this.store.data()?.settings;
    const phone = (settings?.whatsapp || '').replace(/\D/g, '');
    const percent = this.store.percent();
    const rows = this.lines().map((line, index) => {
      const extras = line.options.length ? `\n${line.options.join('\n')}` : '';
      const note = line.note ? `\nNote: ${line.note}` : '';
      return `${index + 1}) ${line.name}  x${line.qty}${extras}${note}\n${formatRs(this.unit(line) * line.qty)}`;
    });
    const when = new Date().toLocaleString('en-PK', { hour12: true });
    const text = [
      `*New order — ${settings?.name || 'Pizza Crunch'}*`,
      when,
      '',
      `*Name:* ${details.name}`,
      `*Phone:* ${details.phone}`,
      `*Address:* ${details.address}`,
      details.note ? `*Note:* ${details.note}` : '',
      '',
      '*Cart*',
      rows.join('\n\n'),
      '',
      percent > 0 ? `Flat ${percent}% off is already in the prices.` : '',
      `*Total: ${formatRs(this.total())}*`
    ].filter(Boolean).join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  private flash(): void {
    this.bump.set(true);
    setTimeout(() => this.bump.set(false), 450);
  }

  private persist(): void {
    localStorage.setItem(KEY, JSON.stringify(this.lines()));
  }

  private read(): CartLine[] {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed as CartLine[] : [];
    } catch {
      return [];
    }
  }
}
