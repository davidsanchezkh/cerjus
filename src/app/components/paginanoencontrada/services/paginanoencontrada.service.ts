import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

const KNOWN_PREFIXES = ['/ciudadano', '/consulta', '/seguimiento'];
const SS_KEY_STACK = 'lastGoodUrlsStack';
const SS_KEY_LAST_BAD = 'lastBadUrl';

function isKnownAppPath(url: string): boolean {
  return KNOWN_PREFIXES.some(p => url === p || url.startsWith(p + '/'));
}

/**
 * Carga/guarda un stack corto de últimas URLs “buenas”
 */
function loadStack(): string[] {
  try {
    const raw = sessionStorage.getItem(SS_KEY_STACK);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveStack(stack: string[]) {
  try { sessionStorage.setItem(SS_KEY_STACK, JSON.stringify(stack)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class PaginaNoEncontradaService {
  private goodStack: string[] = loadStack();     // últimas buenas (tope = la más reciente)
  private lastBadUrl: string | null = sessionStorage.getItem(SS_KEY_LAST_BAD);

  constructor(private router: Router) {
    // Registrar “mala” justo antes de navegar al 404
    this.router.events
      .pipe(filter((e: RouterEvent): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        // Si se va a /pagina-no-encontrada, recordamos desde dónde veníamos
        if (e.url.startsWith('/pagina-no-encontrada')) {
          // La “mala” es la que venía justo antes (la actual en location)
          const bad = window.location.pathname + window.location.search + window.location.hash;
          this.lastBadUrl = bad;
          try { sessionStorage.setItem(SS_KEY_LAST_BAD, bad); } catch {}
        }
      });

    // Registrar “buenas” en cada NavigationEnd
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        // No registrar el propio 404 ni rutas desconocidas
        if (url !== '/pagina-no-encontrada' && isKnownAppPath(url)) {
          // Evitar duplicado consecutivo
          if (this.goodStack[0] !== url) {
            this.goodStack.unshift(url);
            // Mantener stack corto
            if (this.goodStack.length > 20) this.goodStack.length = 20;
            saveStack(this.goodStack);
          }
        }
      });
  }

  /** Última URL válida (o null) */
  getLastGoodUrl(): string | null {
    return this.goodStack.length ? this.goodStack[0] : null;
  }

  /** Última URL mala que llevó a 404 (o null) */
  getLastBadUrl(): string | null {
    return this.lastBadUrl;
  }

  /**
   * Dada una URL “mala”, devuelve una ruta segura dentro de la app.
   * Reglas mínimas: 
   *  - /ciudadano/...  -> /ciudadano
   *  - /consulta/registrar/:id (no num) -> /consulta/registrar
   *  - /consulta/:id (no num) -> /consulta
   *  - /seguimiento/registrar/:id (no num) -> /seguimiento/registrar
   *  - /seguimiento/... -> /seguimiento
   */
  fallbackFrom(bad: string | null): string | null {
    if (!bad) return null;
    try {
      const path = bad.split('?')[0].split('#')[0];
      const seg = path.split('/').filter(Boolean); // sin vacíos

      if (!seg.length) return null;
      const head = '/' + seg[0];

      if (head === '/ciudadano') {
        return '/ciudadano';
      }

      if (head === '/consulta') {
        // /consulta/registrar            -> ok
        // /consulta/registrar/:id (num)  -> ok (pero si id no num -> /consulta/registrar)
        // /consulta/:id (num)            -> ok (si no num -> /consulta)
        if (seg[1] === 'registrar') {
          if (seg.length >= 3) {
            return /^\d+$/.test(seg[2]) ? `/consulta/registrar/${seg[2]}` : '/consulta/registrar';
          }
          return '/consulta/registrar';
        }
        if (seg.length >= 2) {
          return /^\d+$/.test(seg[1]) ? `/consulta/${seg[1]}` : '/consulta';
        }
        return '/consulta';
      }

      if (head === '/seguimiento') {
        // /seguimiento/registrar
        // /seguimiento/registrar/:id → no num -> /seguimiento/registrar
        if (seg[1] === 'registrar') {
          if (seg.length >= 3) {
            return /^\d+$/.test(seg[2]) ? `/seguimiento/registrar/${seg[2]}` : '/seguimiento/registrar';
          }
          return '/seguimiento/registrar';
        }
        return '/seguimiento';
      }

      return null;
    } catch {
      return null;
    }
  }
}