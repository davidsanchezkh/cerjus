// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpContext  } from '@angular/common/http';
import { API_URL } from '@app/app.token';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthStore } from './auth.store';
import { SUPPRESS_401_DIALOG } from '@/app/components/notificaciones/supresor/supresor';

interface LoginResponse { access_token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private store = inject(AuthStore);

  login(credentials: { email: string; password: string }): Observable<void> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/ingresar`,
      credentials,
      {
        context: new HttpContext().set(SUPPRESS_401_DIALOG, true),
      }
    ).pipe(
      tap(res => { if (res?.access_token) this.store.setToken(res.access_token); }),
      map(() => void 0)
    );
  }

  logout() {
    this.store.logout();
  }
}