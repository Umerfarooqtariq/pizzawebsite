import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'menu', loadComponent: () => import('./pages/menu.component').then(m => m.MenuComponent) },
  { path: 'about', loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact.component').then(m => m.ContactComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'admin/login', loadComponent: () => import('./pages/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' }
];
