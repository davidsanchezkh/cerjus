/// <reference types="@angular/localize" />
// main.ts (debug)
(() => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const kind = nav?.type ?? (performance as any).navigation?.type;
  console.log('%c[BOOT]', 'color:#0aa', 'navigation.type =', kind); 
  window.addEventListener('beforeunload', () => console.log('%c[LEAVE]', 'color:#a50', 'beforeunload'));
  window.addEventListener('pageshow', (e: any) => console.log('%c[SHOW]', 'color:#0a0', 'pageshow', { persisted: e?.persisted }));
})();
document.addEventListener('click', (ev) => {
  const a = (ev.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
  if (!a) return;
  // Si tiene href "vacío" o apunta a la misma URL, loguea
  const href = a.getAttribute('href');
  if (href === '' || href === '#' || a.target === '_self') {
    console.warn('[A-click]', { href, a });
  }
}, { capture: true });
//continua
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App,appConfig)
.then(() => document.body.classList.remove('preboot'))
.catch(err => console.error(err));