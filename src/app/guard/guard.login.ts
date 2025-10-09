// guard.login.ts
import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@/app/auth/auth.store';

export const loginGuardMactch: CanMatchFn = () => {
  const router = inject(Router);
  const auth = inject(AuthStore);

  // Si ya hay sesión válida, manda al home (ciudadano)
  const loggedIn = !!auth.getToken();
  return loggedIn ? router.createUrlTree(['/ciudadano']) : true;
};