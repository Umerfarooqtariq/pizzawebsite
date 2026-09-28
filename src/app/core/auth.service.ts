import { inject, Injectable, signal } from '@angular/core';
import { sha256 } from './pricing';
import { StoreService } from './store.service';

const SESSION = 'pizzacrunch.session';
const LOCK = 'pizzacrunch.lock';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(StoreService);
  readonly loggedIn = signal(this.sessionAlive());

  isLoggedIn(): boolean {
    const alive = this.sessionAlive();
    this.loggedIn.set(alive);
    return alive;
  }

  async login(username: string, password: string): Promise<string> {
    const lock = this.lockLeft();
    if (lock > 0) return `Try again in ${lock} seconds.`;
    const settings = this.store.data()?.settings;
    if (!settings) return 'Menu is still loading.';
    const [userHash, passHash] = await Promise.all([
      sha256(username.trim()),
      sha256(password)
    ]);
    const ok = userHash === settings.adminUserHash && passHash === settings.adminPassHash;
    if (!ok) {
      const fails = this.bumpFails();
      if (fails >= 6) {
        sessionStorage.setItem(LOCK, String(Date.now() + 60_000));
        sessionStorage.removeItem('pizzacrunch.fails');
        return 'Too many tries. Wait a minute.';
      }
      return 'Wrong username or password.';
    }
    sessionStorage.removeItem('pizzacrunch.fails');
    sessionStorage.removeItem(LOCK);
    sessionStorage.setItem(SESSION, String(Date.now() + 12 * 60 * 60 * 1000));
    this.loggedIn.set(true);
    return '';
  }

  logout(): void {
    sessionStorage.removeItem(SESSION);
    this.loggedIn.set(false);
  }

  private sessionAlive(): boolean {
    const raw = sessionStorage.getItem(SESSION);
    const exp = Number(raw || 0);
    if (!exp || Date.now() > exp) {
      sessionStorage.removeItem(SESSION);
      return false;
    }
    return true;
  }

  private bumpFails(): number {
    const next = Number(sessionStorage.getItem('pizzacrunch.fails') || 0) + 1;
    sessionStorage.setItem('pizzacrunch.fails', String(next));
    return next;
  }

  private lockLeft(): number {
    const until = Number(sessionStorage.getItem(LOCK) || 0);
    const left = Math.ceil((until - Date.now()) / 1000);
    if (left > 0) return left;
    sessionStorage.removeItem(LOCK);
    return 0;
  }
}
