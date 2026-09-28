import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  template: `
    <div class="page" style="max-width:480px;">
      <p class="kicker">Staff</p>
      <h1 style="font-size:64px;">Menu login</h1>
      <form class="form-grid panel" (ngSubmit)="submit()">
        <label>Username<input name="user" [(ngModel)]="username" autocomplete="username"></label>
        <label>Password<input name="pass" type="password" [(ngModel)]="password" autocomplete="current-password"></label>
        @if (error()) { <p class="warn">{{ error() }}</p> }
        <button class="btn-gold" type="submit">Log in</button>
      </form>
    </div>
  `
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  readonly error = signal('');

  constructor() {
    inject(Title).setTitle('Staff login | Pizza Crunch');
    if (this.auth.isLoggedIn()) void this.router.navigateByUrl('/admin');
  }

  async submit(): Promise<void> {
    const message = await this.auth.login(this.username, this.password);
    this.error.set(message);
    if (!message) void this.router.navigateByUrl('/admin');
  }
}
