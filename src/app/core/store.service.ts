import { Injectable, computed, signal } from '@angular/core';
import { StoreData } from './models';
import { clampDiscount } from './pricing';

const KEY = 'pizzacrunch.store';

function normalize(input: StoreData): StoreData {
  const settings = input.settings;
  settings.discountPercent = clampDiscount(settings.discountPercent);
  settings.phones = Array.isArray(settings.phones) ? settings.phones : [];
  return {
    settings,
    categories: input.categories ?? [],
    items: input.items ?? [],
    crusts: input.crusts ?? [],
    toppings: input.toppings ?? [],
    banners: input.banners ?? [],
    posts: input.posts ?? []
  };
}

function isStore(value: unknown): value is StoreData {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<StoreData>;
  return !!record.settings && Array.isArray(record.items) && Array.isArray(record.categories);
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly data = signal<StoreData | null>(null);
  readonly override = signal(false);
  readonly error = signal('');
  readonly activeSection = signal('deals');

  readonly percent = computed(() => this.data()?.settings.discountPercent ?? 0);

  async load(): Promise<void> {
    try {
      const response = await fetch('/data/store.json');
      if (!response.ok) throw new Error('Menu file missing');
      const remote = normalize(await response.json() as StoreData);
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isStore(parsed)) {
          const local = normalize(parsed);
          if (!local.settings.adminUserHash) local.settings.adminUserHash = remote.settings.adminUserHash;
          if (!local.settings.adminPassHash) local.settings.adminPassHash = remote.settings.adminPassHash;
          this.data.set(local);
          this.override.set(true);
          this.error.set('');
          return;
        }
      }
      this.data.set(remote);
      this.override.set(false);
      this.error.set('');
    } catch {
      this.error.set('Menu could not load. Check that public/data/store.json is part of the site.');
    }
  }

  update(mutator: (current: StoreData) => StoreData): void {
    const current = this.data();
    if (!current) return;
    const next = normalize(mutator(structuredClone(current)));
    this.data.set(next);
    this.override.set(true);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      this.error.set('This browser is full. Download a backup now so the photos are not lost.');
    }
  }

  async useDeployedFile(): Promise<void> {
    localStorage.removeItem(KEY);
    this.override.set(false);
    await this.load();
  }

  download(): void {
    const current = this.data();
    if (!current) return;
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pizza-crunch-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  importDump(raw: string): void {
    const parsed: unknown = JSON.parse(raw);
    if (!isStore(parsed)) throw new Error('This file is not a Pizza Crunch backup.');
    const next = normalize(parsed);
    this.data.set(next);
    this.override.set(true);
    localStorage.setItem(KEY, JSON.stringify(next));
  }
}
