// src/app/core/http/loading-and-errors.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { catchError, finalize, throwError, timeout, TimeoutError } from 'rxjs';

const REQUEST_TIMEOUT_MS = 15000;

function shouldSuppress(req: HttpRequest<unknown>, status: number): boolean {
  const hdr = (req.headers.get('x-suppress-dialog') || '').trim().toLowerCase();
  if (!hdr) return false;
  if (hdr === 'all' || hdr === '*') return true;
  return hdr.split(',').map(s => s.trim()).includes(String(status));
}

function extractMessage(e: HttpErrorResponse): string | null {
  const b = e?.error;
  if (!b) return null;
  if (typeof b.message === 'string' && b.message.trim()) return b.message.trim();
  if (typeof b.detail === 'string' && b.detail.trim()) return b.detail.trim();
  return null;
}

function extractTitle(e: HttpErrorResponse): string | null {
  const t = e?.error?.title;
  return typeof t === 'string' && t.trim() ? t.trim() : null;
}

function extractCode(e: HttpErrorResponse): string | null {
  const c = e?.error?.code;
  return typeof c === 'string' && c.trim() ? c.trim() : null;
}

function genericTitleByStatus(status: number): string {
  if (status === 400) return 'Datos inválidos';
  if (status === 401) return 'Sesión requerida';
  if (status === 403) return 'Acceso denegado';
  if (status === 404) return 'No encontrado';
  if (status === 409) return 'Conflicto';
  if (status >= 500) return 'Ocurrió un error inesperado';
  return 'No se pudo completar la operación';
}

function titleByBusinessCode(code: string): string | null {
  switch (code) {
    case 'SECUENCIA_INVALIDA':     return 'Secuencia inválida';
    case 'ENTRADA_DUPLICADA':      return 'Entrada duplicada';
    case 'ASISTENCIA_SIN_ENTRADA': return 'Falta ENTRADA previa';
    case 'NOT_FOUND_ENTITY':       return 'No encontrado';
    case 'CIUDADANO_INACTIVO':     return 'Ciudadano inactivo';
    default: return null;
  }
}

export const loadingAndErrorsInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificacionesService);
  notify.startLoading();

  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((err: unknown) => {
      if (err instanceof TimeoutError) {
        if (!shouldSuppress(req, 0)) {
          notify.ok({
            variant: 'error',
            title: 'Servicio no disponible',
            message: 'No pudimos conectarnos al servicio. Intenta de nuevo en unos segundos.',
            primaryText: 'Aceptar'
          });
        }
        return throwError(() => err);
      }

      if (err instanceof HttpErrorResponse) {
        const status = err.status;
        const msg = extractMessage(err);
        const code = extractCode(err);
        const title = extractTitle(err)                // 1) title del backend
                   ?? (code ? titleByBusinessCode(code) : null) // 2) map por code
                   ?? genericTitleByStatus(status);    // 3) genérico por status

        if (status === 0) {
          if (!shouldSuppress(req, 0)) {
            notify.ok({
              variant: 'error', title: 'Servicio no disponible',
              message: 'No pudimos conectarnos al servicio. Verifica tu conexión e inténtalo nuevamente.',
              primaryText: 'Aceptar'
            });
          }
          return throwError(() => err);
        }

        if (status >= 500) {
          if (!shouldSuppress(req, status)) {
            notify.ok({
              variant: 'error', title,
              message: 'No pudimos procesar tu solicitud. Inténtalo más tarde.',
              primaryText: 'Aceptar'
            });
          }
          return throwError(() => err);
        }

        if (status === 400 && Array.isArray(err.error?.message)) {
          if (!shouldSuppress(req, status)) {
            notify.ok({
              variant: 'warning',
              title: 'Corrige los datos',
              message: 'Algunos campos tienen errores. Revisa e inténtalo nuevamente.',
              primaryText: 'Aceptar'
            });
          }
          return throwError(() => err);
        }

        if (!shouldSuppress(req, status)) {
          notify.ok({
            variant: status >= 400 && status < 500 ? 'warning' : 'error',
            title,
            message: msg ?? 'No se pudo completar la operación. Inténtalo nuevamente.',
            primaryText: 'Aceptar'
          });
        }
      }

      return throwError(() => err);
    }),
    finalize(() => notify.stopLoading())
  );
};
