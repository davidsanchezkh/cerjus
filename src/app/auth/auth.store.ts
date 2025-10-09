import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'token';

function decodeBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '==='.slice((b64.length + 3) % 4);
  return atob(padded);
}

function parseJwt<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as T;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = parseJwt<{ exp?: number }>(token);
  if (!payload?.exp) return false; // si no hay exp, no lo forzamos
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private router = inject(Router);

  private token$ = new BehaviorSubject<string | null>(null);
  /** Nivel numérico (mismo criterio que tus utils) */
  private level$ = new BehaviorSubject<number | null>(null);
  /** Flag de login derivado del token */
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Cargar token inicial desde localStorage
    const initial = localStorage.getItem(TOKEN_KEY);
    if (initial && !isExpired(initial)) {
      this.applyToken(initial);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      this.clearState();
    }

    // Escuchar cambios entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === TOKEN_KEY) {
        const val = e.newValue;
        if (val && !isExpired(val)) {
          this.applyToken(val);
        } else {
          this.clearState();
        }
      }
    });
  }

  /** Lectura sincrónica del token para el interceptor */
  getToken(): string | null {
    return this.token$.value;
  }

  /** Observables por si los necesitas en layouts/sidebars */
  tokenChanges() { return this.token$.asObservable(); }
  levelChanges() { return this.level$.asObservable(); }
  isLoggedInChanges() { return this.loggedIn$.asObservable(); }

  /** Guardar token (p.ej. tras login) */
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.applyToken(token);
  }

  /** Logout global */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.clearState();
    // Navega a login solo si estás en área protegida; aquí mandamos a login directo
    this.router.navigateByUrl('/login');
  }

  // ===== Helpers internos =====

  private applyToken(token: string) {
    this.token$.next(token);
    this.loggedIn$.next(!isExpired(token));

    // Nivel desde payload (igual que en tus utils: payload.nivel)
    const payload = parseJwt<any>(token);
    const lvl = Number(payload?.nivel);
    this.level$.next(Number.isFinite(lvl) ? lvl : null);
  }

  private clearState() {
    this.token$.next(null);
    this.level$.next(null);
    this.loggedIn$.next(false);
  }
}