export interface SizeOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
  kind: 'simple' | 'pizza' | 'sized';
  popular?: boolean;
  sizes?: SizeOption[];
}

export interface Category {
  id: string;
  name: string;
  kicker: string;
  title: string;
  subtitle: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Banner {
  id: string;
  image: string;
  kicker: string;
  title: string;
  subtitle: string;
  showText?: boolean;
}

export interface SocialPost {
  id: string;
  image: string;
  caption: string;
  url: string;
}

export interface Settings {
  name: string;
  tagline: string;
  logo: string;
  discountPercent: number;
  phone: string;
  phones: string[];
  whatsapp: string;
  address: string;
  hours: string;
  mapQuery: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  foodpanda: string;
  followers: string;
  following: string;
  bio: string;
  about: string;
  splashEnabled: boolean;
  splashImage: string;
  adminUserHash: string;
  adminPassHash: string;
}

export interface StoreData {
  settings: Settings;
  categories: Category[];
  items: MenuItem[];
  crusts: Extra[];
  toppings: Extra[];
  banners: Banner[];
  posts: SocialPost[];
}

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  image: string;
  qty: number;
  baseUnit: number;
  options: string[];
  note: string;
}

export interface CheckoutDetails {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export type ModalRequest =
  | { type: 'item'; item: MenuItem }
  | { type: 'builder' };
