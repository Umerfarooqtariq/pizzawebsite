import { MenuItem } from './models';

export function formatRs(value: number): string {
  const n = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const whole = Math.abs(n % 1) < 0.001;
  const fixed = n.toFixed(whole ? 0 : 2);
  const [rupees, paisa] = fixed.split('.');
  const withCommas = rupees.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Rs. ${withCommas}${paisa ? `.${paisa}` : ''}`;
}

export function clampDiscount(percent: number): number {
  const n = Number(percent);
  if (!Number.isFinite(n)) return 0;
  return Math.min(90, Math.max(0, Math.round(n)));
}

export function applyDiscount(price: number, percent: number): number {
  const p = clampDiscount(percent);
  return Math.round(Number(price) * (100 - p)) / 100;
}

export function basePrice(item: MenuItem): number {
  if (item.sizes && item.sizes.length) {
    return Math.min(...item.sizes.map((size) => Number(size.price) || 0));
  }
  return Number(item.price) || 0;
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function readImageFile(file: File, max = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read the image'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the image'));
    };
    img.src = url;
  });
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
