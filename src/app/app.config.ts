// app.config.ts
import {ApplicationConfig,provideBrowserGlobalErrorListeners,provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { API_URL } from './app.token';
import { jwtInterceptor } from './interceptor/interceptor.auth';
import { loadingAndErrorsInterceptor } from './interceptor/loadinganderrors';
import { environment } from '../environments/environment';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        jwtInterceptor,
        loadingAndErrorsInterceptor
      ])
    ),

    {
      provide: API_URL,
      useValue: environment.apiUrl
    }
  ]
};
