import { inject, Injectable, signal } from '@angular/core';
import { sha256 } from './pricing';
import { StoreService } from './store.service';

const SESSION = 'pizzacrunch.session';

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
    const settings = this.store.data()?.settings;
    if (!settings?.adminUserHash || !settings?.adminPassHash) return 'Staff login is not set on this site yet.';
    const [userHash, passHash] = await Promise.all([
      sha256(username.trim()),
      sha256(password)
    ]);
    const ok = userHash === settings.adminUserHash && passHash === settings.adminPassHash;
    if (!ok) return 'Wrong username or password.';
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

}
