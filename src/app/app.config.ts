// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { routes } from './app.routes';
import { API_URL } from './app.token'
import { jwtInterceptor } from './interceptor/interceptor.auth';

const isProd =
  typeof window !== 'undefined' &&
  location.hostname === 'davidsanchezkh.github.io';

const apiBase = isProd
  ? 'https://spiritual-marie-jeanne-cerjus-caf28ccd.koyeb.app/cerjusbackend'
  : 'http://localhost:3000'; // tu backend local

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: API_URL, useValue: apiBase }
  ]
};
