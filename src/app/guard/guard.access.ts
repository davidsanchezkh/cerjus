// guard.access.ts
import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@/app/auth/auth.store';

export const accessGuardMatch: CanMatchFn = (route: Route, _segments: UrlSegment[]) => {
  const router = inject(Router);
  const auth = inject(AuthStore);

  const loggedIn = !!auth.getToken(); // snapshot del store (ya valida expiración en logout centralizado)
  if (!loggedIn) {
    return router.createUrlTree(['/login']);
  }

  const minLevel = route.data?.['minLevel'] as number | undefined;
  const lvl = auth['level$']?.value ?? null; // lectura sincrónica del level
  if (typeof minLevel === 'number') {
    // Recuerda: en tu app “menor nivel = más permisos”
    if (lvl == null || !(lvl <= minLevel)) {
      return router.createUrlTree(['/login']);
    }
  }

  return true;
};