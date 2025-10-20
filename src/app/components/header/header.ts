import { Component, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@/app/auth/auth.service';
import { PageMetaService, PageMeta } from '@/app/services/page_meta.service';
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
  private metaSvc = inject(PageMetaService);

  title = '';
  /** puede ser string (URL) o any[] (comandos de Router) */
  backLink: string | any[] | null = null;

  private subMeta?: Subscription;
  private subNav?: Subscription;

  constructor() {
    // 1) Preferir meta global {titulo, ruta}
    this.subMeta = this.metaSvc.meta$.subscribe((m) => {
      if (this.applyMeta(m)) return;
      // si no hay meta útil, caer al fallback por URL actual
      this.updateFromUrl(this.router.url);
    });

    // 2) Recalcular fallback al navegar SOLO si no hay meta útil
    this.subNav = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const hasMeta = this.hasUsefulMeta();
        if (!hasMeta) this.updateFromUrl(e.urlAfterRedirects ?? e.url);
      });
  }

  ngOnDestroy() {
    this.subMeta?.unsubscribe();
    this.subNav?.unsubscribe();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goBack() {
    if (Array.isArray(this.backLink)) {
      this.router.navigate(this.backLink as any[]);
    } else if (typeof this.backLink === 'string') {
      this.router.navigateByUrl(this.backLink);
    } else {
      window.history.back();
    }
  }

  /** Aplica meta global. Devuelve true si fue “útil” (título o ruta definidos). */
  private applyMeta(m: PageMeta | undefined | null): boolean {
    const titulo = m?.titulo?.trim();
    const ruta = m?.ruta ?? null;

    const useful = Boolean(titulo || ruta);
    if (useful) {
      this.title = titulo || this.title || '';
      this.backLink = ruta ?? this.backLink ?? null;
    } else {
      // limpiar solo si no venía nada útil
      this.title = '';
      this.backLink = null;
    }
    return useful;
  }

  private hasUsefulMeta(): boolean {
    const m = (this.metaSvc as any)._meta$?.value as PageMeta | undefined; // ok: sólo lectura
    return Boolean(m && (m.titulo || m.ruta));
  }

  // ===== Fallback basado EN LA URL (tu lógica original, pulida) =====
  private updateFromUrl(rawUrl: string) {
    try {
      const url = (rawUrl || '/').split('?')[0].split('#')[0];
      const parts = url.replace(/^\/+/, '').split('/').filter(Boolean); // ['ciudadano','123']
      const seg0 = parts[0] ?? '';
      const seg1 = parts[1] ?? '';
      const seg2 = parts[2] ?? '';

      // Defaults
      this.title = '';
      this.backLink = null;

      if (seg0 === 'ciudadano') {
        if (!seg1) {               // /ciudadano
          this.title = 'Lista de Ciudadanos';
          this.backLink = null;
          return;
        }
        if (seg1 === 'registrar') {// /ciudadano/registrar
          this.title = 'Registrar Nuevo Ciudadano';
          this.backLink = '/ciudadano';
          return;
        }
        if (seg1) {                // /ciudadano/:id
          this.title = 'Detalle del Ciudadano';
          this.backLink = '/ciudadano';
          return;
        }
      }

      if (seg0 === 'consulta') {
        if (!seg1) {               // /consulta
          this.title = 'Consulta';
          this.backLink = null;
          return;
        }
        if (seg1 === 'registrar' && seg2) { // /consulta/registrar/:id  → back: /ciudadano/:id
          this.title = 'Consulta';
          this.backLink = `/ciudadano/${seg2}`;
          return;
        }
        if (seg1) {                // /consulta/:id → back: /consulta
          this.title = '';
          this.backLink = '/consulta';
          return;
        }
      }

      if (seg0 === 'seguimiento' && seg1 === 'registrar' && seg2) {
        // /seguimiento/registrar/:id → back: /consulta/:id
        this.title = 'Registrar Nuevo Seguimiento';
        this.backLink = `/consulta/${seg2}`;
        return;
      }

      // Fallback genérico
      this.title = this.capitalize(seg0 || '');
      this.backLink = null;
    } catch (err) {
      console.error('Header update error:', err);
      this.title = '';
      this.backLink = null;
    }
  }

  private capitalize(x: string): string {
    return x ? x.charAt(0).toUpperCase() + x.slice(1) : '';
  }
}
