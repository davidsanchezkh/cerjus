import { Component,inject, OnDestroy } from '@angular/core';
import { Router , ActivatedRoute, NavigationEnd,ActivatedRouteSnapshot } from '@angular/router';
import { AuthService} from '@/app/auth/auth.service';

import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  title = '';
  backHref: string | null = null;

  private sub?: Subscription;

  constructor() {
    this.updateFromUrl(this.router.url);
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateFromUrl(e.urlAfterRedirects ?? e.url));
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goBack() {
    if (this.backHref) this.router.navigateByUrl(this.backHref);
    else window.history.back();
  }

  // === Lógica basada EN LA URL ===
  private updateFromUrl(rawUrl: string) {
    try {
      const url = (rawUrl || '/').split('?')[0].split('#')[0];
      const parts = url.replace(/^\/+/, '').split('/').filter(Boolean); // ['ciudadano','123']
      const seg0 = parts[0] ?? '';
      const seg1 = parts[1] ?? '';
      const seg2 = parts[2] ?? '';

      // Defaults
      this.title = '';
      this.backHref = null;

      // ---- Reglas pedidas ----
      if (seg0 === 'ciudadano') {
        // /ciudadano
        if (!seg1) {
          this.title = 'Lista de Ciudadanos';
          this.backHref = null; // sin atrás
          return;
        }
        // /ciudadano/registrar
        if (seg1 === 'registrar') {
          this.title = 'Registar Nuevo Ciudadano';
          this.backHref = '/ciudadano';
          return;
        }
        // /ciudadano/:id
        if (seg1) {
          this.title = 'Detalle del Ciudadano';
          this.backHref = '/ciudadano';
          return;
        }
      }

      if (seg0 === 'consulta') {
        // /consulta
        if (!seg1) {
          this.title = 'Consulta';
          this.backHref = null; // "debe decir consulta y nada más"
          return;
        }
        // /consulta/registrar/:id  → back: /ciudadano/:id
        if (seg1 === 'registrar' && seg2) {
          this.title = 'Consulta';
          this.backHref = `/ciudadano/${seg2}`;
          return;
        }
        // /consulta/:id → back: /consulta
        if (seg1) {
          this.title = 'Detalle de la Consulta';
          this.backHref = '/consulta';
          return;
        }
      }

      if (seg0 === 'seguimiento' && seg1 === 'registrar' && seg2) {
        // /seguimiento/registrar/:id → back: /consulta/:id
        this.title = 'Regsitrar Nuevo Seguimiento';
        this.backHref = `/consulta/${seg2}`;
        return;
      }

      // Fallback genérico
      this.title = this.capitalize(seg0 || ''); // e.g. 'Dashboard'
      this.backHref = null;
    } catch (err) {
      console.error('Header update error:', err);
      this.title = '';
      this.backHref = null;
    }
  }

  private capitalize(x: string): string {
    return x ? x.charAt(0).toUpperCase() + x.slice(1) : '';
  }
}